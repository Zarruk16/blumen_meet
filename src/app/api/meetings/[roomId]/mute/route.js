import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import { muteParticipantMicrophone } from "@/lib/livekitRoomService";
import { resolveHostAccess } from "@/lib/meetingHost";

export async function POST(req, { params }) {
  try {
    const { hostKey, hostUserId, participantIdentity } = await req.json();

    if (!participantIdentity) {
      return NextResponse.json({ error: "participantIdentity is required" }, { status: 400 });
    }

    await dbConnect();
    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const { isHost } = resolveHostAccess(meeting, { hostKey, hostUserId });
    if (!isHost) {
      return NextResponse.json({ error: "Only the host can mute participants" }, { status: 403 });
    }

    const result = await muteParticipantMicrophone(params.roomId, participantIdentity);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[mute-participant]", error);
    return NextResponse.json(
      { error: error.message || "Failed to mute participant" },
      { status: 500 }
    );
  }
}
