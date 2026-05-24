import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { hashPassword } from "@/lib/saas/password";
import { ROLES } from "@/lib/saas/constants";
import { signMobileToken, userToMobileProfile } from "@/lib/mobileAuth";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and password (min 8 chars) required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      role: ROLES.CUSTOMER,
      status: "active",
      isVerified: false,
    });

    const token = await signMobileToken(user);
    return NextResponse.json({
      token,
      user: userToMobileProfile(user),
    });
  } catch (error) {
    console.error("[mobile/register]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
