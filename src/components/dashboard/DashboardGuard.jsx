"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/Loader";

export function DashboardGuard({ children, allowedRoles }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/user-auth?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const role = session.user?.role;
    if (allowedRoles?.length && !allowedRoles.includes(role)) {
      if (role === "super_admin") router.replace("/admin/dashboard");
      else if (role === "reseller" || role === "team_member") router.replace("/reseller/dashboard");
      else router.replace("/");
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#06060a]">
        <Loader />
      </div>
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.user?.role)) {
    return null;
  }

  return children;
}
