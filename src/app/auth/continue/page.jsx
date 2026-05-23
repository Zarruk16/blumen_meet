"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getDashboardPathForRole } from "@/lib/saas/dashboardPaths";
import Loader from "@/app/components/Loader";

function AuthContinueContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/user-auth");
      return;
    }

    if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("/auth/continue")) {
      router.replace(callbackUrl);
      return;
    }

    router.replace(getDashboardPathForRole(session.user.role));
  }, [session, status, router, callbackUrl]);

  return <Loader />;
}

export default function AuthContinuePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Suspense fallback={<Loader />}>
        <AuthContinueContent />
      </Suspense>
    </div>
  );
}
