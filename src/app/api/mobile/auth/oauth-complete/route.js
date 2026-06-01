import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signMobileToken } from "@/lib/mobileAuth";
import { COOKIE_NAME, DEFAULT_APP_REDIRECT } from "../oauth-start/route";

function baseUrlFromRequest(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

function successHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Signed in</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#a1a1aa;font-family:system-ui,sans-serif;}</style>
</head>
<body><p>Signed in — returning to the app…</p></body>
</html>`;
}

/**
 * NextAuth callbackUrl target — session → JWT → native app.
 * iOS: return token on this HTTPS URL (ASWebAuthenticationSession matches redirectUri prefix).
 * Android: 302 to blumenmeet://auth/callback?token=…
 */
export async function GET(request) {
  const origin = baseUrlFromRequest(request);
  const { searchParams } = new URL(request.url);
  const cookieRedirect = request.cookies.get(COOKIE_NAME)?.value;
  const appRedirect = searchParams.get("redirect") || cookieRedirect || DEFAULT_APP_REDIRECT;
  const userAgent = request.headers.get("user-agent") || "";
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

  const clearCookie = (res) => {
    res.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: true, path: "/", maxAge: 0 });
    return res;
  };

  // Final hop — browser already at redirectUri?token=…; ASWebAuthenticationSession can close.
  if (searchParams.get("mobile") === "1" && searchParams.get("token")) {
    return clearCookie(
      new NextResponse(successHtml(), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      })
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return clearCookie(NextResponse.redirect(`${origin}/mobile-oauth-error?reason=session`));
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return clearCookie(NextResponse.redirect(`${origin}/mobile-oauth-error?reason=user`));
    }
    if (user.status === "suspended") {
      return clearCookie(NextResponse.redirect(`${origin}/mobile-oauth-error?reason=suspended`));
    }

    const token = await signMobileToken(user);

    // iOS ASWebAuthenticationSession completes on HTTPS URLs, not blumenmeet:// redirects.
    if (isIOS || appRedirect.startsWith("https://")) {
      const httpsReturn = `${origin}/api/mobile/auth/oauth-complete?${new URLSearchParams({
        token,
        mobile: "1",
      })}`;
      return clearCookie(NextResponse.redirect(httpsReturn, 302));
    }

    const target = new URL(appRedirect);
    target.searchParams.set("token", token);
    return clearCookie(NextResponse.redirect(target.toString(), 302));
  } catch (error) {
    console.error("[mobile/auth/oauth-complete]", error);
    return clearCookie(NextResponse.redirect(`${origin}/mobile-oauth-error?reason=bridge`));
  }
}
