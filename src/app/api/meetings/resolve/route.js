import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

/** Resolve short meeting code or partial id → full roomId */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("code") || "").trim();
    if (!raw) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    await dbConnect();

    const exact = await Meeting.findOne({ roomId: raw }).lean();
    if (exact) {
      return NextResponse.json({ roomId: exact.roomId });
    }

    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefix = await Meeting.findOne({
      roomId: { $regex: new RegExp(`^${escaped}`, "i") },
      cancelled: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (prefix) {
      return NextResponse.json({ roomId: prefix.roomId });
    }

    const compact = raw.replace(/-/g, "").toLowerCase();
    if (compact.length >= 6 && compact.length <= 12) {
      const candidates = await Meeting.find({
        cancelled: { $ne: true },
        status: { $in: ["scheduled", "active"] },
      })
        .select("roomId createdAt")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

      const match = candidates.find((m) => {
        const head = m.roomId.replace(/-/g, "").slice(0, compact.length).toLowerCase();
        return head === compact || m.roomId.slice(0, raw.length).toLowerCase() === raw.toLowerCase();
      });

      if (match) {
        return NextResponse.json({ roomId: match.roomId });
      }
    }

    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  } catch (error) {
    console.error("[meetings/resolve]", error);
    return NextResponse.json({ error: "Failed to resolve meeting" }, { status: 500 });
  }
}
