import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { verifyMobileToken } from "@/lib/mobileAuth";

export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import Recording from "@/models/Recording";
import {
  buildHostRecordingsFilter,
  getHostRoomIds,
} from "@/lib/recordingAccess";

async function resolveSessionUser(req) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { id: session.user.id, name: session.user.name || "" };
  }
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const payload = await verifyMobileToken(token);
    return { id: payload.id, name: payload.name || "" };
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const user = await resolveSessionUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get("roomName");

    await dbConnect();

    const hostUserId = user.id || "";
    const hostName = user.name || "";
    const hostRoomIds = await getHostRoomIds(hostUserId, hostName);

    const filter = {
      ...buildHostRecordingsFilter(hostUserId, hostName, hostRoomIds),
      ...(roomName ? { roomName } : {}),
    };

    const recordings = await Recording.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const withDownload = recordings.map((r) => ({
      ...r,
      downloadUrl: r.filePath ? `/api/recordings/${r.recordingId}/download` : null,
    }));

    return NextResponse.json({ recordings: withDownload });
  } catch (error) {
    console.error("[recordings]", error);
    return NextResponse.json({ error: "Failed to load recordings" }, { status: 500 });
  }
}
