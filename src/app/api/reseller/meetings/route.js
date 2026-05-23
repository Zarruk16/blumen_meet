import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import Meeting from "@/models/Meeting";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import { requireResellerSession } from "@/lib/saas/session";
import { checkUsageLimits } from "@/lib/saas/usage";
import { trackRoomCreated, logApiUsage } from "@/lib/saas/trackUsage";

async function getReseller(userId) {
  const reseller = await Reseller.findOne({ userId });
  if (!reseller) throw Object.assign(new Error("Reseller not found"), { status: 404 });
  return reseller;
}

export async function GET() {
  try {
    const session = await requireResellerSession();
    await dbConnect();
    const reseller = await getReseller(session.userId);
    const meetings = await Meeting.find({ resellerId: reseller._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      meetings: meetings.map((m) => ({
        id: m._id.toString(),
        roomId: m.roomId,
        status: m.status,
        hostName: m.hostName,
        duration: m.duration,
        participantCount: m.participantCount,
        createdAt: m.createdAt,
        joinUrl: `/join/${m.roomId}`,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req) {
  try {
    const session = await requireResellerSession();
    const { title, kind = "instant", customerId } = await req.json();

    await dbConnect();
    const reseller = await getReseller(session.userId);
    const subscription = await Subscription.findOne({ resellerId: reseller._id }).lean();
    const usage = checkUsageLimits(reseller, subscription);
    if (!usage.allowed) {
      return NextResponse.json({ error: usage.reason, code: "USAGE_LIMIT" }, { status: 429 });
    }

    const roomId = uuidv4();
    const hostKey = uuidv4();

    const meeting = await Meeting.create({
      roomId,
      hostKey,
      hostUserId: session.userId,
      hostName: title || reseller.companyName || session.name,
      ownerUserId: session.userId,
      currentHostUserId: session.userId,
      resellerId: reseller._id,
      customerId: customerId || undefined,
      kind: kind === "scheduled" ? "scheduled" : "instant",
      status: "active",
    });

    await trackRoomCreated(reseller._id);
    await logApiUsage({
      resellerId: reseller._id,
      userId: session.userId,
      endpoint: "/reseller/meetings",
      roomName: roomId,
    });

    return NextResponse.json({
      ok: true,
      meeting: {
        roomId,
        hostKey,
        joinUrl: `/join/${roomId}`,
        id: meeting._id.toString(),
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
