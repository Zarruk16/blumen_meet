import dbConnect, { dbConnectWithRetry } from "@/lib/dbConnect";
import User from "@/models/User";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/saas/password";
import { resolveSuperAdminEmail } from "@/lib/saas/permissions";
import { ROLES } from "@/lib/saas/constants";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
          "+password"
        );
        if (!user?.password) return null;
        if (user.status === "suspended") return null;
        const valid = await verifyPassword(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          image: user.avatar || user.profilePicture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || ROLES.CUSTOMER;
        token.company = user.company || "";
      }
      if (trigger === "update" && session?.user) {
        token.role = session.user.role ?? token.role;
        token.company = session.user.company ?? token.company;
      }
      if (token.id) {
        await dbConnect();
        const dbUser = await User.findById(token.id).select("role company").lean();
        if (dbUser) {
          token.role = dbUser.role;
          token.company = dbUser.company || "";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role || ROLES.CUSTOMER;
      session.user.company = token.company || "";
      return session;
    },
    async signIn({ user, profile, account }) {
      try {
        await dbConnectWithRetry(3);
        const email = (user?.email || profile?.email || "").trim().toLowerCase();
        if (!email) {
          console.error("[signIn] OAuth provider returned no email");
          return false;
        }

        let dbUser = await User.findOne({ email });

        if (dbUser?.status === "suspended") {
          console.error("[signIn] Suspended account:", email);
          return false;
        }

        const isSuperAdmin = resolveSuperAdminEmail(email);
        const picture =
          profile?.picture || profile?.avatar_url || user?.image || "";
        const displayName =
          profile?.name || user?.name || email.split("@")[0] || "User";

        if (!dbUser) {
          dbUser = await User.create({
            name: displayName,
            email,
            profilePicture: picture,
            avatar: picture,
            isVerified: true,
            role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER,
            status: "active",
          });
        } else {
          let changed = false;
          if (picture && !dbUser.avatar) {
            dbUser.avatar = picture;
            dbUser.profilePicture = picture;
            changed = true;
          }
          if (!dbUser.name && displayName) {
            dbUser.name = displayName;
            changed = true;
          }
          if (isSuperAdmin && dbUser.role !== ROLES.SUPER_ADMIN) {
            dbUser.role = ROLES.SUPER_ADMIN;
            changed = true;
          }
          if (account?.provider !== "credentials" && !dbUser.isVerified) {
            dbUser.isVerified = true;
            changed = true;
          }
          if (changed) await dbUser.save();
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        return true;
      } catch (error) {
        console.error("[signIn] OAuth sign-in failed:", error?.message || error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/user-auth",
    error: "/mobile-oauth-error",
  },
  debug: process.env.NODE_ENV === "development",
};
