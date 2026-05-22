import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import { hostCanAccessRecording } from "@/lib/recordingAccess";
import { getRecordingDownloadUrl } from "@/lib/recordingStorage";

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    await dbConnect();
    const recording = await Recording.findOne({ recordingId: params.recordingId }).lean();
    if (!recording) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    const allowed = await hostCanAccessRecording(recording, {
      hostUserId: session.user.id,
      hostName: session.user.name,
    });
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!recording.filePath) {
      return NextResponse.json(
        { error: "Recording file is not ready yet. Try again in a minute." },
        { status: 409 }
      );
    }

    const url = await getRecordingDownloadUrl(recording.filePath);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[recordings/download]", error);
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 }
    );
  }
}
