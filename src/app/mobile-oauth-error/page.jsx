"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const MESSAGES = {
  AccessDenied:
    "Could not reach the database to finish sign in. Check your internet connection and MongoDB Atlas access, then try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Try email/password on the website first.",
  Configuration:
    "Server auth is misconfigured. Check NEXTAUTH_URL and Google OAuth credentials.",
  Default: "Something went wrong during sign in.",
};

function MobileOAuthErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") || "Default";
  const message = MESSAGES[error] || MESSAGES.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      <h1 className="text-xl font-semibold text-red-300">Sign in failed</h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">{message}</p>
      <p className="mt-2 text-xs text-zinc-600">Error code: {error}</p>
      <Link
        href="/user-auth"
        className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white"
      >
        Try again on web
      </Link>
      <p className="mt-6 max-w-xs text-xs leading-relaxed text-zinc-500">
        Close this browser tab and return to the Blumen Meet app to try again.
      </p>
    </div>
  );
}

export default function MobileOAuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          Loading…
        </div>
      }
    >
      <MobileOAuthErrorContent />
    </Suspense>
  );
}
