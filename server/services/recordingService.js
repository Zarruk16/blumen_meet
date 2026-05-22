import { EgressClient, EncodedFileOutput, EncodedFileType } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";

function getClient() {
  const host = process.env.LIVEKIT_URL?.replace("wss://", "https://").replace("ws://", "http://");
  return new EgressClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
}

export async function startRecording(roomName, meta = {}) {
  const recordingId = uuidv4();
  const filepath = `recordings/${roomName}/${recordingId}.mp4`;

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath,
    ...(process.env.LIVEKIT_S3_BUCKET && {
      s3: {
        bucket: process.env.LIVEKIT_S3_BUCKET,
        region: process.env.LIVEKIT_S3_REGION || "us-east-1",
        accessKey: process.env.LIVEKIT_S3_ACCESS_KEY,
        secret: process.env.LIVEKIT_S3_SECRET,
      },
    }),
  });

  const client = getClient();
  const info = await client.startRoomCompositeEgress(roomName, { file: fileOutput });

  return {
    recordingId,
    egressId: info.egressId,
    filepath,
    status: "active",
    ...meta,
  };
}

export async function stopRecording(egressId) {
  const client = getClient();
  return client.stopEgress(egressId);
}
