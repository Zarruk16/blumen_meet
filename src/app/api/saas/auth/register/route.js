import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { hashPassword } from "@/lib/saas/password";
import { ROLES } from "@/lib/saas/constants";
import { createResellerForUser } from "@/lib/saas/resellerService";
import { createEmailVerificationToken } from "@/lib/saas/authTokens";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/saas/email";

export async function POST(req) {
  try {
    const { name, email, password, company, accountType = "reseller" } = await req.json();

    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and password (min 8 chars) are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const role = accountType === "customer" ? ROLES.CUSTOMER : ROLES.RESELLER;
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      company: company?.trim() || "",
      role,
      status: "active",
      isVerified: false,
    });

    if (isEmailConfigured()) {
      try {
        const verifyToken = await createEmailVerificationToken(user._id);
        await sendVerificationEmail(user.email, verifyToken, user.name);
      } catch (emailErr) {
        console.warn("[register] verification email failed:", emailErr.message);
      }
    }

    let apiCredentials = null;
    if (role === ROLES.RESELLER) {
      const { reseller, apiSecret } = await createResellerForUser(user._id, {
        companyName: company?.trim() || name.trim(),
      });
      apiCredentials = {
        apiKey: reseller.apiKey,
        apiSecret,
      };
    }

    return NextResponse.json({
      ok: true,
      userId: user._id.toString(),
      role,
      apiCredentials,
      message: "Account created. Sign in to access your dashboard.",
    });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
