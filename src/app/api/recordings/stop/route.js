import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import { finalizeRecordingDoc } from "@/lib/finalizeRecording";

export async function POST(req) {
  try {
    const { recordingId } = await req.json();
    if (!recordingId) {
      return NextResponse.json({ error: "recordingId is required" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Recording.findOne({ recordingId });
    if (!doc) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    await finalizeRecordingDoc(doc);

    return NextResponse.json({
      recordingId,
      status: doc.status,
      duration: doc.duration,
    });
  } catch (error) {
    console.error("[recordings/stop]", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop recording" },
      { status: 500 }
    );
  }
}
