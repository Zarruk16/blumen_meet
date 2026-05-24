import { NextResponse } from "next/server";
import {
  authenticateMobileUser,
  signMobileToken,
  userToMobileProfile,
} from "@/lib/mobileAuth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await authenticateMobileUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signMobileToken(user);
    return NextResponse.json({
      token,
      user: userToMobileProfile(user),
    });
  } catch (error) {
    console.error("[mobile/login]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
