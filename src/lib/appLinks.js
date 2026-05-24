const DEFAULT_HOST = "blumen-meet.vercel.app";
const ANDROID_PACKAGE = "com.blumenmeet.app";
const IOS_BUNDLE_ID = "com.blumenmeet.app";
const APP_SCHEME = "blumenmeet";

function getWebOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL;
  if (!base) return `https://${DEFAULT_HOST}`;
  if (base.startsWith("http")) return base.replace(/\/$/, "");
  return `https://${base.replace(/\/$/, "")}`;
}

export function getAppLinkHost() {
  try {
    return new URL(getWebOrigin()).host || DEFAULT_HOST;
  } catch {
    return DEFAULT_HOST;
  }
}

export function getWebJoinUrl(roomId) {
  return `${getWebOrigin()}/join/${encodeURIComponent(roomId)}`;
}

export function getAppSchemeJoinUrl(roomId) {
  return `${APP_SCHEME}://join/${encodeURIComponent(roomId)}`;
}

/** Android intent URL — opens the app when installed, else stays in browser via fallback. */
export function getAndroidAppIntentUrl(roomId) {
  const webJoin = getWebJoinUrl(roomId);
  const host = getAppLinkHost();
  const path = `/join/${encodeURIComponent(roomId)}`;
  return (
    `intent://${host}${path}#Intent;` +
    `scheme=https;` +
    `package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(webJoin)};` +
    "end"
  );
}

export function isMobileUserAgent(userAgent = "") {
  return /Android|iPhone|iPad|iPod/i.test(userAgent);
}

export function isAndroidUserAgent(userAgent = "") {
  return /Android/i.test(userAgent);
}

export function isIosUserAgent(userAgent = "") {
  return /iPhone|iPad|iPod/i.test(userAgent);
}

export { ANDROID_PACKAGE, IOS_BUNDLE_ID, APP_SCHEME, DEFAULT_HOST };
