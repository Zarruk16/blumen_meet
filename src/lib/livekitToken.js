import { AccessToken } from "livekit-server-sdk";

/**
 * Generate a LiveKit JWT for room access (used by Next.js API route).
 */
export async function createLiveKitToken({
  roomName,
  userName,
  identity,
  isHost = false,
}) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    throw new Error(
      "LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL."
    );
  }

  const participantIdentity =
    (typeof identity === "string" && identity.trim()) ||
    `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: userName,
    ttl: "6h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: Boolean(isHost),
  });

  const jwt = await token.toJwt();

  return {
    token: jwt,
    serverUrl: livekitUrl,
    identity: participantIdentity,
  };
}
