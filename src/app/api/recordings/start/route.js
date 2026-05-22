import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import { startRoomRecording, isRecordingConfigured, getRecordingSetupMessage } from "@/lib/livekitEgress";

export async function POST(req) {
  try {
    const { roomName, hostUserId, hostName } = await req.json();
    if (!roomName) {
      return NextResponse.json({ error: "roomName is required" }, { status: 400 });
    }

    if (!isRecordingConfigured()) {
      return NextResponse.json({ error: getRecordingSetupMessage() }, { status: 422 });
    }

    const egress = await startRoomRecording(roomName, { hostUserId, hostName });
    await dbConnect();

    await Recording.create({
      recordingId: egress.recordingId,
      egressId: egress.egressId,
      roomName,
      hostUserId,
      hostName,
      status: egress.status,
      filePath: egress.filepath,
      startedAt: new Date(),
    });

    return NextResponse.json({
      recordingId: egress.recordingId,
      egressId: egress.egressId,
      status: egress.status,
    });
  } catch (error) {
    console.error("[recordings/start]", error);
    const message = error.message || "Failed to start recording.";
    const status = message.includes("not configured") ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
