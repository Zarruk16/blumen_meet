import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MeetingSummary from "@/models/MeetingSummary";

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const doc = await MeetingSummary.findOne({ roomId: params.roomId })
      .select("transcript status")
      .lean();

    return NextResponse.json({
      transcript: doc?.transcript || null,
      status: doc?.status || null,
      segments: [],
    });
  } catch (error) {
    console.error("[transcript GET]", error);
    return NextResponse.json({ transcript: null, segments: [] });
  }
}
