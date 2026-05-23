import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import { authenticateApiRequest } from "@/lib/saas/apiAuth";
import { trackRoomCreated, logApiUsage } from "@/lib/saas/trackUsage";

export async function POST(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.reason }, { status: auth.status });
  }

  try {
    const { title, hostName, kind = "instant" } = await req.json();
    const { reseller } = auth;

    await dbConnect();
    const roomId = uuidv4();
    const hostKey = uuidv4();

    await Meeting.create({
      roomId,
      hostKey,
      hostUserId: reseller.userId.toString(),
      hostName: hostName || title || reseller.companyName || "API Host",
      ownerUserId: reseller.userId.toString(),
      currentHostUserId: reseller.userId.toString(),
      resellerId: reseller._id,
      kind: kind === "scheduled" ? "scheduled" : "instant",
      status: "active",
    });

    await trackRoomCreated(reseller._id);
    await logApiUsage({
      resellerId: reseller._id,
      endpoint: "/api/v1/meetings",
      method: "POST",
      roomName: roomId,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";

    return NextResponse.json({
      ok: true,
      roomId,
      hostKey,
      joinUrl: `${baseUrl}/join/${roomId}`,
    });
  } catch (error) {
    console.error("[v1/meetings]", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await dbConnect();
    const meetings = await Meeting.find({ resellerId: auth.reseller._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    await logApiUsage({
      resellerId: auth.reseller._id,
      endpoint: "/api/v1/meetings",
      method: "GET",
    });

    return NextResponse.json({
      meetings: meetings.map((m) => ({
        roomId: m.roomId,
        status: m.status,
        duration: m.duration,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to list meetings" }, { status: 500 });
  }
}
