import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { createPasswordResetToken } from "@/lib/saas/authTokens";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/saas/email";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (user?.password) {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          { error: "Password reset email is not configured yet. Contact support." },
          { status: 503 }
        );
      }
      const token = await createPasswordResetToken(user._id);
      await sendPasswordResetEmail(user.email, token, user.name);
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we sent reset instructions.",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
