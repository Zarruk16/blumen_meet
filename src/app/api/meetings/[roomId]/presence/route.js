import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import { stopActiveRecordingsForRoom } from "@/lib/finalizeRecording";

function upsertParticipant(meeting, { participantId, userId, name }) {
  const roster = [...(meeting.activeParticipants || [])];
  const idx = roster.findIndex((p) => p.presenceId === participantId);
  const entry = {
    presenceId: participantId,
    userId: userId || participantId,
    name: name || "Guest",
  };
  if (idx >= 0) roster[idx] = { ...roster[idx], ...entry };
  else roster.push(entry);
  meeting.activeParticipants = roster;
}

function removeParticipant(meeting, participantId) {
  meeting.activeParticipants = (meeting.activeParticipants || []).filter(
    (p) => p.presenceId !== participantId
  );
}

export async function POST(req, { params }) {
  try {
    const { action, participantId, userId, name } = await req.json();
    if (!action || !participantId) {
      return NextResponse.json({ error: "action and participantId are required" }, { status: 400 });
    }

    await dbConnect();
    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    if (meeting.cancelled) {
      return NextResponse.json({ error: "Meeting ended" }, { status: 410 });
    }

    const current = new Set(meeting.activeParticipantIds || []);
    if (action === "join") {
      current.add(participantId);
      upsertParticipant(meeting, { participantId, userId, name });
      meeting.status = "active";
      meeting.endedAt = null;
    } else if (action === "leave") {
      current.delete(participantId);
      removeParticipant(meeting, participantId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    meeting.activeParticipantIds = Array.from(current);

    if (action === "leave" && meeting.startedAt && !meeting.duration) {
      const started = meeting.createdAt;
      const durationSec = Math.floor((Date.now() - new Date(started)) / 1000);
      meeting.duration = durationSec;
    }

    let meetingEnded = false;
    if (action === "leave" && meeting.activeParticipantIds.length === 0) {
      meetingEnded = true;
      if (meeting.kind === "scheduled") {
        meeting.status = "scheduled";
        meeting.endedAt = null;
      } else {
        meeting.status = "ended";
        meeting.endedAt = new Date();
      }
      if (meeting.resellerId && meeting.duration) {
        const { trackMeetingDuration } = await import("@/lib/saas/trackUsage");
        await trackMeetingDuration(
          meeting.resellerId,
          Math.ceil(meeting.duration / 60)
        );
      }
    }

    await meeting.save();

    if (meetingEnded) {
      try {
        await stopActiveRecordingsForRoom(params.roomId);
      } catch (err) {
        console.error("[presence] stop recordings", err);
      }
    }

    return NextResponse.json({
      ok: true,
      activeCount: meeting.activeParticipantIds.length,
      status: meeting.status,
      currentHostUserId: meeting.currentHostUserId || "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }
}
