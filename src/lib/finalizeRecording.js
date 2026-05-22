import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import { stopRoomRecording } from "@/lib/livekitEgress";
import { buildRecordingPublicUrl } from "@/lib/recordingStorage";

export async function finalizeRecordingDoc(doc) {
  if (!doc) return null;
  if (!["active", "starting"].includes(doc.status)) return doc;

  if (doc.egressId) {
    try {
      await stopRoomRecording(doc.egressId);
    } catch (err) {
      console.warn("[recording] egress stop", err.message);
    }
  }

  const endedAt = new Date();
  const duration = doc.startedAt
    ? Math.floor((endedAt - doc.startedAt) / 1000)
    : null;

  doc.status = "processing";
  doc.endedAt = endedAt;
  doc.duration = duration;
  if (doc.filePath) {
    doc.fileUrl = buildRecordingPublicUrl(doc.filePath);
  }
  await doc.save();
  return doc;
}

export async function stopActiveRecordingsForRoom(roomName) {
  if (!roomName) return [];
  await dbConnect();
  const active = await Recording.find({
    roomName,
    status: { $in: ["active", "starting"] },
  });
  const stopped = [];
  for (const doc of active) {
    stopped.push(await finalizeRecordingDoc(doc));
  }
  return stopped;
}
