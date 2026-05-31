"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy OAuth landing — immediately hand off to server oauth-complete (no client useSession). */
function MobileOAuthDoneContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const appRedirect = searchParams.get("app_redirect") || "blumenmeet://auth/callback";
    const completeUrl = `/api/mobile/auth/oauth-complete?${new URLSearchParams({
      redirect: appRedirect,
    })}`;
    window.location.replace(completeUrl);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
      <p className="mt-6 max-w-sm text-sm text-zinc-400">Completing sign in…</p>
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
