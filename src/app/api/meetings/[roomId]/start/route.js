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
    if (meeting.cancelled) {
      return NextResponse.json({ error: "Meeting is cancelled" }, { status: 410 });
    }

    meeting.status = "active";
    meeting.endedAt = null;
    await meeting.save();

    return NextResponse.json({ ok: true, roomId: meeting.roomId });
  } catch {
    return NextResponse.json({ error: "Failed to start meeting" }, { status: 500 });
  }
}

