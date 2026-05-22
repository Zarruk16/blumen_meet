import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { applyAuthUrlFromRequest } from "@/lib/resolveAuthUrl";

const handler = NextAuth(authOptions);

async function authHandler(req, context) {
  const authUrl = applyAuthUrlFromRequest(req);
  if (authUrl && process.env.NODE_ENV === "development") {
    console.log("[next-auth] Using URL:", authUrl);
  }
  return handler(req, context);
}

export { authHandler as GET, authHandler as POST };
