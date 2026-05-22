"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { redirectToLogin } from "@/lib/authRedirect";

export function useAuthGate() {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const requireAuth = useCallback(
    (onAuthed, { callbackPath, callbackUrl } = {}) => {
      if (isLoading) return;
      if (!isAuthenticated) {
        redirectToLogin(router, callbackPath || callbackUrl);
        return;
      }
      onAuthed?.();
    },
    [isAuthenticated, isLoading, router]
  );

  return { isAuthenticated, isLoading, requireAuth, redirectToLogin: () => redirectToLogin(router) };
}
