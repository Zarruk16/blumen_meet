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

/** HTML fallback when HTTP 302 to a custom scheme is ignored (some iOS WebAuth sessions). */
function nativeReturnHtml(targetUrl) {
  const safeJson = JSON.stringify(targetUrl);
  const safeAttr = targetUrl
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta http-equiv="refresh" content="0;url=${safeAttr}"/>
  <title>Opening Blumen Meet</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:1.25rem;background:#09090b;color:#a1a1aa;font-family:system-ui,-apple-system,sans-serif;padding:1.5rem;text-align:center;}
    a{color:#c4b5fd;font-weight:600;font-size:1rem;text-decoration:none;padding:.75rem 1.25rem;border:1px solid #4c1d95;border-radius:.75rem;}
  </style>
</head>
<body>
  <p>Returning to Blumen Meet…</p>
  <a id="open" href="${safeAttr}">Open Blumen Meet</a>
  <script>
    (function () {
      var t = ${safeJson};
      try { window.location.replace(t); } catch (e) {}
      try { window.location.href = t; } catch (e) {}
      setTimeout(function () { try { window.location.href = t; } catch (e) {} }, 250);
      setTimeout(function () { document.getElementById("open").click(); }, 600);
    })();
  </script>
</body>
</html>`;
}

/**
 * NextAuth callbackUrl target — session → JWT → native app deep link.
 * Prefer HTTP 302 (ASWebAuthenticationSession on iOS). HTML page is fallback for stubborn sessions.
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
    const target = new URL(appRedirect);
    target.searchParams.set("token", token);
    const targetStr = target.toString();

    if (isIOS) {
      const html = nativeReturnHtml(targetStr);
      return clearCookie(
        new NextResponse(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        })
      );
    }

    return clearCookie(NextResponse.redirect(targetStr, 302));
  } catch (error) {
    console.error("[mobile/auth/oauth-complete]", error);
    return clearCookie(NextResponse.redirect(`${origin}/mobile-oauth-error?reason=bridge`));
  }
}
