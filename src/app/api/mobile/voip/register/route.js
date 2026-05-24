import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { verifyMobileToken } from "@/lib/mobileAuth";
import VoipDevice from "@/models/VoipDevice";

/**
 * Register mobile device for meeting invites / VoIP pushes.
 * iOS: add voipToken when PushKit is wired in the dev build.
 */
export async function POST(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    const body = await req.json().catch(() => ({}));

    let userId = null;
    if (token) {
      try {
        const payload = await verifyMobileToken(token);
        userId = payload.id;
      } catch {
        // allow anonymous registration for guest devices
      }
    }

    const { expoPushToken, platform, voipToken } = body;
    if (!platform || !["ios", "android"].includes(platform)) {
      return NextResponse.json({ error: "platform required (ios|android)" }, { status: 400 });
    }
    if (!expoPushToken && !voipToken) {
      return NextResponse.json({ error: "expoPushToken or voipToken required" }, { status: 400 });
    }

    await dbConnect();

    const query = expoPushToken
      ? { expoPushToken }
      : { voipToken, platform };

    const device = await VoipDevice.findOneAndUpdate(
      query,
      {
        userId,
        platform,
        expoPushToken: expoPushToken || undefined,
        voipToken: voipToken || undefined,
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      ok: true,
      deviceId: device._id.toString(),
    });
  } catch (error) {
    console.error("[mobile/voip/register]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
