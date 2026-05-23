import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import { requireAdminSession } from "@/lib/saas/session";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const recordings = await Recording.find().sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      recordings: recordings.map((r) => ({
        id: r._id.toString(),
        recordingId: r.recordingId,
        roomName: r.roomName,
        hostName: r.hostName,
        status: r.status,
        duration: r.duration,
        resellerId: r.resellerId?.toString(),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
