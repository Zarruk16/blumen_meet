import { NextResponse } from "next/server";
import { findUserByEmailVerificationToken, markEmailVerified } from "@/lib/saas/authTokens";

export async function GET(req) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/user-auth?error=missing_token`);
  }

  try {
    const user = await findUserByEmailVerificationToken(token);
    if (!user) {
      return NextResponse.redirect(`${appUrl}/user-auth?error=invalid_token`);
    }

    await markEmailVerified(user._id);
    return NextResponse.redirect(`${appUrl}/user-auth?verified=1`);
  } catch (error) {
    console.error("[verify-email]", error);
    return NextResponse.redirect(`${appUrl}/user-auth?error=verify_failed`);
  }
}
