import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import { requireAdminSession } from "@/lib/saas/session";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const meetings = await Meeting.find().sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      meetings: meetings.map((m) => ({
        id: m._id.toString(),
        roomId: m.roomId,
        hostName: m.hostName,
        status: m.status,
        kind: m.kind,
        duration: m.duration,
        participantCount: m.participantCount,
        resellerId: m.resellerId?.toString(),
        createdAt: m.createdAt,
        endedAt: m.endedAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
