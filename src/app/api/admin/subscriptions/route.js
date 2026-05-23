import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription";
import Reseller from "@/models/Reseller";
import { requireAdminSession } from "@/lib/saas/session";
import { PLAN_LIMITS } from "@/lib/saas/constants";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const subs = await Subscription.find().sort({ createdAt: -1 }).lean();
    const resellerIds = subs.map((s) => s.resellerId);
    const resellers = await Reseller.find({ _id: { $in: resellerIds } }).lean();
    const map = Object.fromEntries(resellers.map((r) => [r._id.toString(), r]));

    return NextResponse.json({
      subscriptions: subs.map((s) => ({
        id: s._id.toString(),
        plan: s.plan,
        status: s.status,
        expiresAt: s.expiresAt,
        trialEndsAt: s.trialEndsAt,
        reseller: map[s.resellerId.toString()],
        limits: PLAN_LIMITS[s.plan],
      })),
      plans: PLAN_LIMITS,
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
