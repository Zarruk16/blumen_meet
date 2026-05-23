import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import { requireAdminSession } from "@/lib/saas/session";
import { hashPassword } from "@/lib/saas/password";
import { createResellerForUser } from "@/lib/saas/resellerService";
import { maskApiKey } from "@/lib/saas/apiKeys";
import { PLANS, ROLES } from "@/lib/saas/constants";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const resellers = await Reseller.find().sort({ createdAt: -1 }).lean();
    const userIds = resellers.map((r) => r.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      resellers: resellers.map((r) => ({
        id: r._id.toString(),
        companyName: r.companyName,
        apiKey: maskApiKey(r.apiKey),
        plan: r.subscriptionPlan,
        minutesUsed: r.minutesUsed,
        roomsCreated: r.roomsCreated,
        usageLimit: r.usageLimit,
        credits: r.credits,
        isSuspended: r.isSuspended,
        freeCreditsMinutes: r.freeCreditsMinutes,
        freeCreditsExpiresAt: r.freeCreditsExpiresAt,
        user: userMap[r.userId.toString()],
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req) {
  try {
    await requireAdminSession();
    const { name, email, password, companyName, plan = PLANS.FREE } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, password required" }, { status: 400 });
    }

    await dbConnect();
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return NextResponse.json({ error: "Email exists" }, { status: 409 });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: await hashPassword(password),
      role: ROLES.RESELLER,
      company: companyName || "",
      status: "active",
      isVerified: true,
    });

    const { reseller, apiSecret } = await createResellerForUser(user._id, {
      companyName: companyName || name,
      plan,
    });

    await Reseller.findByIdAndUpdate(reseller._id, { subscriptionPlan: plan });
    await Subscription.findOneAndUpdate(
      { resellerId: reseller._id },
      { plan, status: "active" },
      { upsert: true }
    );

    return NextResponse.json({
      ok: true,
      resellerId: reseller._id.toString(),
      apiKey: reseller.apiKey,
      apiSecret,
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
