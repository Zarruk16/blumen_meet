import { RoomServiceClient } from "livekit-server-sdk";

export async function deleteLiveKitRoom(roomName) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl || !roomName) {
    return false;
  }

  try {
    const client = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
    await client.deleteRoom(roomName);
    return true;
  } catch (err) {
    console.warn("[livekit] deleteRoom", err?.message || err);
    return false;
  }
}
