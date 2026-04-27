import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

// One-time/backfill helper:
// fills missing hostUserId for legacy meetings by matching hostName.
export async function POST(req) {
  try {
    const { hostUserId, hostName } = await req.json();
    if (!hostUserId || !hostName) {
      return NextResponse.json({ error: "hostUserId and hostName are required" }, { status: 400 });
    }

    await dbConnect();

    const result = await Meeting.updateMany(
      {
        kind: "scheduled",
        cancelled: { $ne: true },
        $or: [{ hostUserId: { $exists: false } }, { hostUserId: "" }, { hostUserId: null }],
        hostName,
      },
      { $set: { hostUserId } }
    );

    return NextResponse.json({
      ok: true,
      matched: result.matchedCount ?? 0,
      updated: result.modifiedCount ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to migrate meetings" }, { status: 500 });
  }
}

