import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import Recording from "@/models/Recording";
import { requireResellerSession } from "@/lib/saas/session";

export async function GET() {
  try {
    const session = await requireResellerSession();
    await dbConnect();
    const reseller = await Reseller.findOne({ userId: session.userId });
    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
    }

    const recordings = await Recording.find({ resellerId: reseller._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      recordings: recordings.map((r) => ({
        id: r._id.toString(),
        recordingId: r.recordingId,
        roomName: r.roomName,
        status: r.status,
        duration: r.duration,
        createdAt: r.createdAt,
        downloadUrl: r.filePath ? `/api/recordings/${r.recordingId}/download` : null,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
