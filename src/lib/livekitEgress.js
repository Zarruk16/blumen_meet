import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  S3Upload,
} from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";

function getEgressClient() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const host = process.env.LIVEKIT_URL?.replace("wss://", "https://").replace("ws://", "http://");

  if (!apiKey || !apiSecret || !host) {
    throw new Error("LiveKit is not configured.");
  }

  return new EgressClient(host, apiKey, apiSecret);
}

export function isRecordingConfigured() {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET &&
      process.env.LIVEKIT_URL &&
      process.env.LIVEKIT_S3_BUCKET &&
      process.env.LIVEKIT_S3_ACCESS_KEY &&
      process.env.LIVEKIT_S3_SECRET &&
      process.env.LIVEKIT_S3_ACCESS_KEY.length > 10 &&
      !process.env.LIVEKIT_S3_ACCESS_KEY.startsWith("PASTE_")
  );
}

export function getRecordingSetupMessage() {
  return (
    "Recording needs free Cloudflare R2 storage (not AWS). " +
    "Add LIVEKIT_S3_* to .env.local — see RECORDING_WITHOUT_AWS.md"
  );
}

export async function startRoomRecording(roomName, { hostUserId, hostName } = {}) {
  if (!isRecordingConfigured()) {
    throw new Error(getRecordingSetupMessage());
  }

  const recordingId = uuidv4();
  const filepath = `recordings/${roomName}/${recordingId}.mp4`;

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath,
    output: {
      case: "s3",
      value: new S3Upload({
        accessKey: process.env.LIVEKIT_S3_ACCESS_KEY,
        secret: process.env.LIVEKIT_S3_SECRET,
        bucket: process.env.LIVEKIT_S3_BUCKET,
        region: process.env.LIVEKIT_S3_REGION || "auto",
        ...(process.env.LIVEKIT_S3_ENDPOINT
          ? {
              endpoint: process.env.LIVEKIT_S3_ENDPOINT.replace(/\/blumenmeet\/?$/, "").replace(/\/$/, ""),
              forcePathStyle: true,
            }
          : {}),
      }),
    },
  });

  const client = getEgressClient();
  const info = await client.startRoomCompositeEgress(roomName, {
    file: fileOutput,
  });

  return {
    recordingId,
    egressId: info.egressId,
    filepath,
    status: "active",
    hostUserId,
    hostName,
  };
}

export async function stopRoomRecording(egressId) {
  const client = getEgressClient();
  return client.stopEgress(egressId);
}
