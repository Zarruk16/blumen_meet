import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import {
  getOwnerUserId,
  isMeetingLinkExpired,
  resolveHostAccess,
} from "@/lib/meetingHost";

const getCurrentOccurrenceStart = (startAt, recurrence, now) => {
  const base = new Date(startAt);
  if (Number.isNaN(base.getTime())) return null;
  if (recurrence === "none") return base;
  const stepMs = recurrence === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  if (now <= base) return base;
  const diff = now.getTime() - base.getTime();
  const steps = Math.floor(diff / stepMs);
  return new Date(base.getTime() + steps * stepMs);
};

export async function POST(req, { params }) {
  try {
    const { hostKey, hostUserId } = await req.json();
    await dbConnect();

    const meeting = await Meeting.findOne({ roomId: params.roomId });
    if (!meeting) {
      return NextResponse.json({ allowed: false, error: "Meeting not found" }, { status: 404 });
    }

    if (isMeetingLinkExpired(meeting)) {
      return NextResponse.json({ allowed: false, reason: "ended" }, { status: 410 });
    }

    const uid = (hostUserId || "").trim();
    const ownerId = getOwnerUserId(meeting);

    if (uid && ownerId && uid === ownerId) {
      meeting.currentHostUserId = ownerId;
      if (!meeting.ownerUserId) meeting.ownerUserId = ownerId;
      await meeting.save();
    }

    const { isHost, currentHostId } = resolveHostAccess(meeting, { hostKey, hostUserId });

    if (meeting.kind === "scheduled" && meeting.status !== "active") {
      const now = new Date();
      const occurrenceStart = meeting.startAt
        ? getCurrentOccurrenceStart(meeting.startAt, meeting.recurrence || "none", now)
        : null;
      const startReached = occurrenceStart ? now >= occurrenceStart : false;

      if (!startReached) {
        return NextResponse.json(
          { allowed: false, reason: "scheduled_not_started_time", startAt: occurrenceStart || meeting.startAt },
          { status: 403 }
        );
      }

      if (isHost) {
        meeting.status = "active";
        meeting.endedAt = null;
        await meeting.save();
      } else {
        return NextResponse.json(
          { allowed: false, reason: "waiting_for_host", startAt: occurrenceStart || meeting.startAt },
          { status: 403 }
        );
      }
    }

    if (meeting.kind === "scheduled" && meeting.status === "ended" && meeting.recurrence !== "none") {
      const now = new Date();
      const occurrenceStart = meeting.startAt
        ? getCurrentOccurrenceStart(meeting.startAt, meeting.recurrence || "none", now)
        : null;
      const startReached = occurrenceStart ? now >= occurrenceStart : false;

      if (!startReached) {
        return NextResponse.json(
          { allowed: false, reason: "scheduled_not_started_time", startAt: occurrenceStart || meeting.startAt },
          { status: 403 }
        );
      }

      if (isHost) {
        meeting.status = "active";
        meeting.endedAt = null;
        await meeting.save();
      } else {
        return NextResponse.json(
          { allowed: false, reason: "waiting_for_host", startAt: occurrenceStart || meeting.startAt },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      allowed: true,
      isHost,
      isOwner: Boolean(uid && ownerId && uid === ownerId),
      ownerUserId: ownerId,
      currentHostUserId: currentHostId,
      status: meeting.status,
      startAt: meeting.startAt,
      kind: meeting.kind,
      recurrence: meeting.recurrence || "none",
    });
  } catch {
    return NextResponse.json({ allowed: false, error: "Failed to authorize" }, { status: 500 });
  }
}
