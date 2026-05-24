import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyMobileToken } from "@/lib/mobileAuth";
import { userToMobileProfile } from "@/lib/mobileAuth";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyMobileToken(token);
    await dbConnect();
    const user = await User.findById(payload.id);
    if (!user || user.status === "suspended") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: userToMobileProfile(user) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
