import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
    async signIn({ user, profile }) {
      try {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: profile.name,
            email: profile.email,
            profilePicture: profile.picture,
            isVerified: profile.email_verified ? true : false,
          });
        }
        user.id = dbUser._id.toString();
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        user.id = user.email;
        return true;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // ignore invalid url
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
