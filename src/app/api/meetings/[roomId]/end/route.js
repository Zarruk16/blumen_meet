import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import { deleteLiveKitRoom } from "@/lib/livekitRoomService";
import { resolveHostAccess } from "@/lib/meetingHost";
import { stopActiveRecordingsForRoom } from "@/lib/finalizeRecording";

export async function POST(req, { params }) {
  try {
    const { hostKey, hostUserId } = await req.json();
    await dbConnect();

    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const { isHost } = resolveHostAccess(meeting, { hostKey, hostUserId });
    if (!isHost) {
      return NextResponse.json({ error: "Only the host can end the meeting" }, { status: 403 });
    }

    meeting.cancelled = true;
    meeting.status = "ended";
    meeting.endedAt = new Date();
    meeting.activeParticipantIds = [];
    meeting.activeParticipants = [];
    await meeting.save();

    try {
      await stopActiveRecordingsForRoom(params.roomId);
    } catch (err) {
      console.error("[end-meeting] stop recordings", err);
    }

    await deleteLiveKitRoom(params.roomId);

    return NextResponse.json({ ok: true, ended: true });
  } catch (error) {
    console.error("[end-meeting]", error);
    return NextResponse.json({ error: "Failed to end meeting" }, { status: 500 });
  }
}
