import * as recordingService from "../services/recordingService.js";

const recordings = new Map();

export async function startRecording(req, res) {
  try {
    const { roomName, hostUserId, hostName } = req.body || {};
    if (!roomName) {
      return res.status(400).json({ error: "roomName is required" });
    }

    const result = await recordingService.startRecording(roomName, {
      hostUserId,
      hostName,
    });

    recordings.set(result.recordingId, {
      ...result,
      roomName,
      startedAt: new Date().toISOString(),
    });

    return res.json({
      recordingId: result.recordingId,
      egressId: result.egressId,
      status: result.status,
    });
  } catch (error) {
    console.error("[start-recording]", error);
    return res.status(500).json({ error: error.message || "Failed to start recording" });
  }
}

export async function stopRecording(req, res) {
  try {
    const { recordingId } = req.body || {};
    const doc = recordings.get(recordingId);
    if (!doc) {
      return res.status(404).json({ error: "Recording not found" });
    }

    if (doc.egressId) {
      await recordingService.stopRecording(doc.egressId);
    }

    doc.status = "processing";
    doc.endedAt = new Date().toISOString();
    recordings.set(recordingId, doc);

    return res.json({ recordingId, status: doc.status });
  } catch (error) {
    console.error("[stop-recording]", error);
    return res.status(500).json({ error: error.message || "Failed to stop recording" });
  }
}

export async function listRecordings(req, res) {
  const roomName = req.query.roomName;
  let list = [...recordings.values()];
  if (roomName) list = list.filter((r) => r.roomName === roomName);
  return res.json({ recordings: list });
}
