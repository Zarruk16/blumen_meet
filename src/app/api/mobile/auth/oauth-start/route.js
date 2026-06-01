import { NextResponse } from "next/server";

const DEFAULT_APP_REDIRECT = "blumenmeet://auth/callback";
const COOKIE_NAME = "mobile_app_redirect";

/** NextAuth session cookies — cleared silently so mobile OAuth skips the sign-out page. */
const NEXT_AUTH_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
];

function baseUrlFromRequest(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

function clearNextAuthCookies(response) {
  for (const name of NEXT_AUTH_COOKIES) {
    response.cookies.set(name, "", { httpOnly: true, secure: true, path: "/", maxAge: 0 });
  }
  return response;
}

/**
 * Entry point for native OAuth — stores app redirect in a cookie, then sends user to NextAuth.
 * Clears any stale web session cookies without showing NextAuth's "Sign out?" page.
 */
export async function GET(request) {
  const origin = baseUrlFromRequest(request);
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") || "google";
  const appRedirect = searchParams.get("redirect") || DEFAULT_APP_REDIRECT;

  const callbackUrl = `${origin}/api/mobile/auth/oauth-complete`;
  const signInParams = new URLSearchParams({ callbackUrl });

  // Always show Google account chooser on mobile (no silent reuse of web session).
  if (provider === "google") {
    signInParams.set(
      "authorizationParams",
      JSON.stringify({ prompt: "select_account", access_type: "online" })
    );
  }

  const signInUrl = `${origin}/api/auth/signin/${provider}?${signInParams}`;

  const response = NextResponse.redirect(signInUrl);
  clearNextAuthCookies(response);
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
