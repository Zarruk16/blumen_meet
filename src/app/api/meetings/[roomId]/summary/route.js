import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MeetingSummary from "@/models/MeetingSummary";
import Recording from "@/models/Recording";
import { buildRecordingPublicUrl } from "@/lib/recordingStorage";

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const summary = await MeetingSummary.findOne({ roomId: params.roomId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ summary: summary || null });
  } catch (error) {
    console.error("[summary GET]", error);
    return NextResponse.json({ summary: null });
  }
}

export async function POST(req, { params }) {
  const roomId = params.roomId;
  try {
    const body = await req.json().catch(() => ({}));
    await dbConnect();

    let recordingUrl = body.recordingUrl;
    let recordingFilePath = body.recordingFilePath;

    if (!recordingUrl && !recordingFilePath) {
      const latest = await Recording.findOne({
        roomName: roomId,
        filePath: { $exists: true, $ne: "" },
      })
        .sort({ endedAt: -1, createdAt: -1 })
        .lean();
      if (latest?.filePath) {
        recordingFilePath = latest.filePath;
        recordingUrl =
          latest.fileUrl || buildRecordingPublicUrl(latest.filePath) || recordingUrl;
      }
    }

    const { generateMeetingSummary } = await import("@/lib/ai/summaryService");
    const result = await generateMeetingSummary({
      roomId,
      transcript: body.transcript,
      recordingUrl,
      recordingFilePath,
    });

    const updated = await MeetingSummary.findOneAndUpdate(
      { roomId },
      {
        roomId,
        title: result.title,
        summary: result.summary,
        keyPoints: result.keyPoints || [],
        actionItems: result.actionItems || [],
        decisions: result.decisions || [],
        speakerHighlights: result.speakerHighlights || [],
        timestamps: result.timestamps || [],
        status: "completed",
        generatedAt: new Date(),
        error: null,
        summaryNote: result.summaryNote || null,
      },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[summary POST]", error);
    try {
      await dbConnect();
      await MeetingSummary.findOneAndUpdate(
        { roomId },
        { status: "failed", error: error.message },
        { upsert: true }
      );
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
