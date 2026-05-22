import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/recordings", "/meetings"];

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname, search } = req.nextUrl;

  if (pathname === "/user-auth" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && isProtectedPath(pathname)) {
    const login = new URL("/user-auth", req.url);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user-auth", "/recordings", "/recordings/:path*", "/meetings/:path*"],
};
