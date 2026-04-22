import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

export async function POST(req, { params }) {
  try {
    const { hostKey } = await req.json();
    if (!hostKey) {
      return NextResponse.json({ error: "hostKey is required" }, { status: 400 });
    }

    await dbConnect();
    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    if (meeting.hostKey !== hostKey) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    meeting.cancelled = true;
    meeting.status = "ended";
    meeting.endedAt = new Date();
    meeting.activeParticipantIds = [];
    await meeting.save();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel meeting" }, { status: 500 });
  }
}

