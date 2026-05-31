import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signMobileToken } from "@/lib/mobileAuth";

const DEFAULT_APP_REDIRECT = "blumenmeet://auth/callback";

function baseUrlFromRequest(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

/**
 * NextAuth OAuth callbackUrl target — reads session server-side and 302s to the native app.
 * Avoids client-side useSession timing/cookie issues in ASWebAuthenticationSession.
 */
export async function GET(request) {
  const origin = baseUrlFromRequest(request);
  const { searchParams } = new URL(request.url);
  const appRedirect = searchParams.get("redirect") || DEFAULT_APP_REDIRECT;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(`${origin}/mobile-oauth-error?reason=session`);
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.redirect(`${origin}/mobile-oauth-error?reason=user`);
    }
    if (user.status === "suspended") {
      return NextResponse.redirect(`${origin}/mobile-oauth-error?reason=suspended`);
    }

    const token = await signMobileToken(user);
    const target = new URL(appRedirect);
    target.searchParams.set("token", token);

    return NextResponse.redirect(target.toString());
  } catch (error) {
    console.error("[mobile/auth/oauth-complete]", error);
    return NextResponse.redirect(`${origin}/mobile-oauth-error?reason=bridge`);
  }
}
