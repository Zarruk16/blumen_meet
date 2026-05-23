import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/saas/password";
import { resolveSuperAdminEmail } from "@/lib/saas/permissions";
import { ROLES } from "@/lib/saas/constants";
import { createResellerForUser } from "@/lib/saas/resellerService";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        await dbConnect();
        const email = (user.email || profile?.email || "").toLowerCase();
        let dbUser = await User.findOne({ email });

        const isSuperAdmin = resolveSuperAdminEmail(email);

        if (!dbUser) {
          dbUser = await User.create({
            name: profile?.name || user.name || email.split("@")[0],
            email,
            profilePicture: profile?.picture || user.image || "",
            avatar: profile?.picture || user.image || "",
            isVerified: profile?.email_verified ? true : account?.provider !== "credentials",
            role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.CUSTOMER,
            status: "active",
          });
        } else if (isSuperAdmin && dbUser.role !== ROLES.SUPER_ADMIN) {
          dbUser.role = ROLES.SUPER_ADMIN;
          await dbUser.save();
        }

        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
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
  },
  debug: process.env.NODE_ENV === "development",
};
