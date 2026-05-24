"use client";

import { useCallback, useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import {
  getAndroidAppIntentUrl,
  getAppSchemeJoinUrl,
  getWebJoinUrl,
  isAndroidUserAgent,
  isIosUserAgent,
  isMobileUserAgent,
} from "@/lib/appLinks";

const ATTEMPT_KEY = "blumen_open_in_app_attempted";

/**
 * On mobile, offer (and optionally try once) to open the native Blumen Meet app for this join link.
 */
export default function OpenInAppBanner({ roomId }) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState(null);

  const openInApp = useCallback(() => {
    if (typeof window === "undefined" || !roomId) return;
    const ua = navigator.userAgent;
    const webJoin = getWebJoinUrl(roomId);

    if (isAndroidUserAgent(ua)) {
      window.location.href = getAndroidAppIntentUrl(roomId);
      return;
    }

    if (isIosUserAgent(ua)) {
      window.location.href = getAppSchemeJoinUrl(roomId);
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.href = webJoin;
        }
      }, 1200);
      return;
    }

    window.location.href = getAppSchemeJoinUrl(roomId);
  }, [roomId]);

  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;
    const ua = navigator.userAgent;
    if (!isMobileUserAgent(ua)) return;

    setPlatform(isAndroidUserAgent(ua) ? "android" : isIosUserAgent(ua) ? "ios" : "mobile");
    setVisible(true);

    try {
      if (sessionStorage.getItem(ATTEMPT_KEY) === roomId) return;
      sessionStorage.setItem(ATTEMPT_KEY, roomId);
    } catch {
      return;
    }

    const timer = window.setTimeout(() => {
      openInApp();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [roomId, openInApp]);

  if (!visible || !roomId) return null;

  return (
    <div className="relative z-30 mx-auto mb-4 max-w-5xl px-4 sm:px-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-violet-500/35 bg-violet-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
            <Smartphone className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Open in Blumen Meet app</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {platform === "android"
                ? "If the app is installed, this link opens the meeting directly."
                : "Continue in the app for the best experience on your phone."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openInApp}
          className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95 active:scale-[0.98]"
        >
          Open app
        </button>
      </div>
    </div>
  );
}
