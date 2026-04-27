import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

export async function POST(req, { params }) {
  try {
    const { action, participantId } = await req.json();
    if (!action || !participantId) {
      return NextResponse.json({ error: "action and participantId are required" }, { status: 400 });
    }

    await dbConnect();
    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const current = new Set(meeting.activeParticipantIds || []);
    if (action === "join") {
      current.add(participantId);
      meeting.status = "active";
      meeting.endedAt = null;
    } else if (action === "leave") {
      current.delete(participantId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    meeting.activeParticipantIds = Array.from(current);

    if (action === "leave" && meeting.activeParticipantIds.length === 0) {
      if (meeting.kind === "scheduled") {
        // Scheduled meetings remain reusable until explicitly cancelled.
        meeting.status = "scheduled";
        meeting.endedAt = null;
      } else {
        meeting.status = "ended";
        meeting.endedAt = new Date();
      }
    }

    await meeting.save();
    return NextResponse.json({
      ok: true,
      activeCount: meeting.activeParticipantIds.length,
      status: meeting.status,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }
}

