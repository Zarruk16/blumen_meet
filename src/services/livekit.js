/**
 * LiveKit client helpers — token fetch and connection config.
 */

const trimTrailingSlash = (url) => (url || "").replace(/\/$/, "");

export function getLiveKitServerUrl() {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
}

/**
 * Backend URL for token generation.
 * Falls back to same-origin Next.js API when unset.
 */
export function getTokenEndpoint() {
  const backend = trimTrailingSlash(process.env.NEXT_PUBLIC_BACKEND_URL);
  if (backend) {
    return `${backend}/get-token`;
  }
  return "/api/livekit/get-token";
}

/**
 * Request a LiveKit access token from the configured backend.
 */
export async function fetchLiveKitToken({
  roomName,
  userName,
  identity,
  isHost = false,
  signal,
}) {
  const endpoint = getTokenEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomName,
      userName,
      identity,
      isHost,
    }),
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Token request failed (${response.status})`);
  }

  if (!data?.token || !data?.serverUrl) {
    throw new Error("Invalid token response from server.");
  }

  return {
    token: data.token,
    serverUrl: data.serverUrl,
    identity: data.identity,
  };
}
