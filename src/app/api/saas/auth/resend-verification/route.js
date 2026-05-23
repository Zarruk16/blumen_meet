import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requirePlatformSession } from "@/lib/saas/session";
import { createEmailVerificationToken } from "@/lib/saas/authTokens";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/saas/email";

export async function POST() {
  try {
    const session = await requirePlatformSession();

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: "Email is not configured" }, { status: 503 });
    }

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.isVerified) {
      return NextResponse.json({ ok: true, message: "Email already verified" });
    }

    const token = await createEmailVerificationToken(user._id);
    await sendVerificationEmail(user.email, token, user.name);

    return NextResponse.json({ ok: true, message: "Verification email sent" });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status });
  }
}
