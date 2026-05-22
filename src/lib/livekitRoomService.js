import { RoomServiceClient, TrackSource } from "livekit-server-sdk";

function getClient() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !livekitUrl) return null;
  return new RoomServiceClient(livekitUrl, apiKey, apiSecret);
}

export async function deleteLiveKitRoom(roomName) {
  if (!roomName) return false;

  try {
    const client = getClient();
    if (!client) return false;
    await client.deleteRoom(roomName);
    return true;
  } catch (err) {
    console.warn("[livekit] deleteRoom", err?.message || err);
    return false;
  }
}

/**
 * Mute a participant's microphone track(s) in a room (host action via server API).
 */
export async function muteParticipantMicrophone(roomName, participantIdentity) {
  const client = getClient();
  if (!client) {
    throw new Error("LiveKit is not configured");
  }
  if (!roomName || !participantIdentity) {
    throw new Error("room and participant identity are required");
  }

  const participants = await client.listParticipants(roomName);
  const target = participants.find((p) => p.identity === participantIdentity);
  if (!target) {
    throw new Error("Participant is not in the meeting");
  }

  const micTracks = (target.tracks || []).filter(
    (t) => t.source === TrackSource.MICROPHONE || t.type === 0
  );

  if (!micTracks.length) {
    return { muted: false, reason: "no_microphone_track" };
  }

  for (const track of micTracks) {
    if (track.sid) {
      await client.mutePublishedTrack(roomName, participantIdentity, track.sid, true);
    }
  }

  return { muted: true, trackCount: micTracks.length };
}
