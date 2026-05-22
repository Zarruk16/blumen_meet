import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import {
  getCurrentHostUserId,
  getOwnerUserId,
  pickNextHostUserId,
  resolveHostAccess,
} from "@/lib/meetingHost";

export async function POST(req, { params }) {
  try {
    const { hostKey, hostUserId, nextHostUserId, nextHostName } = await req.json();
    await dbConnect();

    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    if (meeting.cancelled) {
      return NextResponse.json({ error: "Meeting has ended" }, { status: 410 });
    }

    const { isHost } = resolveHostAccess(meeting, { hostKey, hostUserId });
    if (!isHost) {
      return NextResponse.json({ error: "Only the host can transfer host" }, { status: 403 });
    }

    const leavingUserId = (hostUserId || "").trim();
    const ownerId = getOwnerUserId(meeting);
    let nextId = (nextHostUserId || "").trim();

    if (!nextId) {
      nextId = pickNextHostUserId(meeting.activeParticipants, leavingUserId);
    }

    if (!nextId) {
      return NextResponse.json({
        ok: true,
        transferred: false,
        reason: "no_other_participants",
      });
    }

    meeting.currentHostUserId = nextId;
    if (nextHostName) {
      const roster = meeting.activeParticipants || [];
      const idx = roster.findIndex((p) => p.userId === nextId);
      if (idx >= 0) roster[idx].name = nextHostName;
      meeting.activeParticipants = roster;
    }
    await meeting.save();

    const nextParticipant = (meeting.activeParticipants || []).find((p) => p.userId === nextId);

    return NextResponse.json({
      ok: true,
      transferred: true,
      currentHostUserId: meeting.currentHostUserId,
      ownerUserId: ownerId,
      nextHostName: nextParticipant?.name || nextHostName || "Participant",
    });
  } catch (error) {
    console.error("[leave-host]", error);
    return NextResponse.json({ error: "Failed to transfer host" }, { status: 500 });
  }
}
