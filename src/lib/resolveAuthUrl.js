/**
 * In dev, use the request host so OAuth works on phone hotspot (not localhost).
 */
export function applyAuthUrlFromRequest(req) {
  if (process.env.NODE_ENV !== "development") return null;

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return null;

  let proto = req.headers.get("x-forwarded-proto");
  if (!proto) {
    try {
      proto = new URL(req.url).protocol.replace(":", "");
    } catch {
      proto = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "http";
    }
  }

  const url = `${proto}://${host}`;
  process.env.NEXTAUTH_URL = url;
  return url;
}

export function getOAuthCallbackUrls(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  return {
    google: `${base}/api/auth/callback/google`,
    github: `${base}/api/auth/callback/github`,
  };
}
