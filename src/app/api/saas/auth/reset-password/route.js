import { NextResponse } from "next/server";
import {
  findUserByPasswordResetToken,
  clearPasswordResetToken,
} from "@/lib/saas/authTokens";
import { hashPassword } from "@/lib/saas/password";

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Token and password (min 8 chars) are required" },
        { status: 400 }
      );
    }

    const user = await findUserByPasswordResetToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    user.password = await hashPassword(password);
    await user.save();
    await clearPasswordResetToken(user._id);

    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
