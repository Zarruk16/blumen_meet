import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3Client;

function getS3Client() {
  if (s3Client) return s3Client;
  const endpoint = process.env.LIVEKIT_S3_ENDPOINT?.replace(/\/$/, "");
  if (!endpoint || !process.env.LIVEKIT_S3_ACCESS_KEY || !process.env.LIVEKIT_S3_SECRET) {
    return null;
  }
  s3Client = new S3Client({
    region: process.env.LIVEKIT_S3_REGION || "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.LIVEKIT_S3_ACCESS_KEY,
      secretAccessKey: process.env.LIVEKIT_S3_SECRET,
    },
    forcePathStyle: true,
  });
  return s3Client;
}

/** Public URL when R2 dev/public URL is enabled (optional). */
export function buildRecordingPublicUrl(filePath) {
  if (!filePath) return null;
  const base = process.env.LIVEKIT_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${filePath.replace(/^\//, "")}`;
  return null;
}

export async function fetchRecordingBytes(filePath) {
  const client = getS3Client();
  const bucket = process.env.LIVEKIT_S3_BUCKET;
  if (!client || !bucket || !filePath) {
    throw new Error("R2 storage is not configured.");
  }
  const res = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: filePath.replace(/^\//, ""),
    })
  );
  return res.Body.transformToByteArray();
}

export async function getRecordingDownloadUrl(filePath, expiresIn = 3600) {
  const client = getS3Client();
  const bucket = process.env.LIVEKIT_S3_BUCKET;
  if (!client || !bucket || !filePath) {
    throw new Error("R2 storage is not configured.");
  }
  const key = filePath.replace(/^\//, "");
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split("/").pop() || "recording.mp4"}"`,
    }),
    { expiresIn }
  );
}
