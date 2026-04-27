import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const meeting = await Meeting.findOne({ roomId: params.roomId }).lean();

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({
      roomId: meeting.roomId,
      kind: meeting.kind,
      status: meeting.status,
      startAt: meeting.startAt,
      hostName: meeting.hostName || "",
      hostUserId: meeting.hostUserId || "",
      endedAt: meeting.endedAt || null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load meeting" }, { status: 500 });
  }
}

