"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function MobileOAuthDoneContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const appRedirect = searchParams.get("app_redirect") || "blumenmeet://auth/callback";
  const [message, setMessage] = useState("Completing sign in…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setFailed(true);
      setMessage("Sign in was cancelled or failed. Close this window and try again in the app.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (cancelled) return;
        const completeUrl = `/api/mobile/auth/oauth-complete?${new URLSearchParams({
          redirect: appRedirect,
        })}`;
        window.location.replace(completeUrl);
      } catch (err) {
        if (cancelled) return;
        setFailed(true);
        setMessage(err.message || "Could not finish sign in");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, appRedirect]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      {!failed ? (
        <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
      ) : null}
      <p className={`mt-6 max-w-sm text-sm ${failed ? "text-red-300" : "text-zinc-400"}`}>{message}</p>
    </div>
  );
}

export default function MobileOAuthDonePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        </div>
      }
    >
      <MobileOAuthDoneContent />
    </Suspense>
  );
}
