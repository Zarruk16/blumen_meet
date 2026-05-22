import { NextResponse } from "next/server";
import { createLiveKitToken } from "@/lib/livekitToken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomName, userName, identity, isHost } = body || {};

    if (!roomName || !userName) {
      return NextResponse.json(
        { error: "roomName and userName are required." },
        { status: 400 }
      );
    }

    const payload = await createLiveKitToken({
      roomName,
      userName,
      identity,
      isHost: Boolean(isHost),
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[livekit/get-token]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate LiveKit token." },
      { status: 500 }
    );
  }
}
