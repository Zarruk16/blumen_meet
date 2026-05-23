import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/recordings", "/meetings"];
const ADMIN_PREFIX = "/admin";
const RESELLER_PREFIX = "/reseller";

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isDashboardPath(pathname) {
  return pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(RESELLER_PREFIX);
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, search } = req.nextUrl;

  if (pathname === "/user-auth" && token) {
    const role = token.role;
    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (role === "reseller" || role === "team_member") {
      return NextResponse.redirect(new URL("/reseller/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname === "/auth/continue" && !token) {
    const login = new URL("/user-auth", req.url);
    login.searchParams.set("callbackUrl", "/auth/continue");
    return NextResponse.redirect(login);
  }

  if (!token && (isProtectedPath(pathname) || isDashboardPath(pathname))) {
    const login = new URL("/user-auth", req.url);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }

  if (token && pathname.startsWith(ADMIN_PREFIX) && token.role !== "super_admin") {
    return NextResponse.redirect(new URL("/reseller/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user-auth",
    "/auth/continue",
    "/recordings",
    "/recordings/:path*",
    "/meetings/:path*",
    "/admin/:path*",
    "/reseller/:path*",
  ],
};
