import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ApiUsage from "@/models/ApiUsage";
import { requireAdminSession } from "@/lib/saas/session";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const logs = await ApiUsage.find().sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l._id.toString(),
        endpoint: l.endpoint,
        method: l.method,
        statusCode: l.statusCode,
        minutesConsumed: l.minutesConsumed,
        roomName: l.roomName,
        resellerId: l.resellerId?.toString(),
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
