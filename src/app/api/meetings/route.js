import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hostUserId = (searchParams.get("hostUserId") || "").trim();
    const hostName = (searchParams.get("hostName") || "").trim();

    if (!hostUserId && !hostName) {
      return NextResponse.json({ error: "hostUserId or hostName is required" }, { status: 400 });
    }

    await dbConnect();

    const meetings = await Meeting.find({
      ...(hostUserId && hostName
        ? { $or: [{ hostUserId }, { hostName }] }
        : hostUserId
          ? { hostUserId }
          : { hostName }),
      kind: "scheduled",
      cancelled: { $ne: true },
      // Scheduled meetings remain visible until explicitly cancelled.
      status: { $in: ["scheduled", "active", "ended"] },
    })
      // Newest created scheduled meetings first.
      .sort({ createdAt: -1, startAt: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      meetings: meetings.map((m) => ({
        roomId: m.roomId,
        startAt: m.startAt,
        createdAt: m.createdAt,
        recurrence: m.recurrence || "none",
        status: m.status,
        hostKey: m.hostKey,
      })),
    });
  } catch (error) {
    console.error("GET /api/meetings failed", error);
    return NextResponse.json({ error: "Failed to load meetings" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, hostKey, hostUserId, hostName, kind, startAt, recurrence } = body || {};

    if (!roomId || !hostKey) {
      return NextResponse.json({ error: "roomId and hostKey are required" }, { status: 400 });
    }

    await dbConnect();

    const meetingKind = kind === "scheduled" ? "scheduled" : "instant";
    const scheduledAt = meetingKind === "scheduled" && startAt ? new Date(startAt) : null;
    const normalizedRecurrence =
      meetingKind === "scheduled" && (recurrence === "daily" || recurrence === "weekly")
        ? recurrence
        : "none";

    const meeting = await Meeting.findOneAndUpdate(
      { roomId },
      {
        roomId,
        hostKey,
        hostUserId: hostUserId || "",
        hostName: hostName || "",
        ownerUserId: hostUserId || "",
        currentHostUserId: hostUserId || "",
        kind: meetingKind,
        recurrence: normalizedRecurrence,
        cancelled: false,
        startAt: scheduledAt,
        status: meetingKind === "scheduled" ? "scheduled" : "active",
        endedAt: null,
        activeParticipantIds: [],
        activeParticipants: [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      roomId: meeting.roomId,
      kind: meeting.kind,
      recurrence: meeting.recurrence,
      status: meeting.status,
      startAt: meeting.startAt,
    });
  } catch (error) {
    console.error("POST /api/meetings failed", error);
    return NextResponse.json(
      {
        error: "Failed to create meeting",
        detail: process.env.NODE_ENV === "development" ? String(error?.message || error) : undefined,
      },
      { status: 500 }
    );
  }
}

