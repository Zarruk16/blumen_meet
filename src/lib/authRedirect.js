export function getLoginUrl(callbackUrl = "/#workspace") {
  const params = new URLSearchParams({ callbackUrl });
  return `/user-auth?${params.toString()}`;
}

export function redirectToLogin(router, callbackUrl) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.hash || "#workspace"}`
      : callbackUrl || "/#workspace";
  router.push(getLoginUrl(url));
}
