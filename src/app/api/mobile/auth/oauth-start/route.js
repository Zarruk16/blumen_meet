import { NextResponse } from "next/server";

const DEFAULT_APP_REDIRECT = "blumenmeet://auth/callback";
const COOKIE_NAME = "mobile_app_redirect";

function baseUrlFromRequest(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

/**
 * Entry point for native OAuth — stores app redirect in a cookie, then sends user to NextAuth.
 * Keeps NextAuth callbackUrl fixed (more reliable on iOS than long query strings in callbackUrl).
 */
export async function GET(request) {
  const origin = baseUrlFromRequest(request);
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "google";
  const appRedirect = searchParams.get("redirect") || DEFAULT_APP_REDIRECT;

  const callbackUrl = `${origin}/api/mobile/auth/oauth-complete`;
  const signInUrl = `${origin}/api/auth/signin/${provider}?${new URLSearchParams({
    callbackUrl,
  })}`;

  const response = NextResponse.redirect(signInUrl);
  response.cookies.set(COOKIE_NAME, appRedirect, {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

export { COOKIE_NAME, DEFAULT_APP_REDIRECT };
