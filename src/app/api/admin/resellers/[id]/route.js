import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { requireAdminSession } from "@/lib/saas/session";

export async function PATCH(req, { params }) {
  try {
    await requireAdminSession();
    const body = await req.json();
    await dbConnect();

    const reseller = await Reseller.findById(params.id);
    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
    }

    if (body.isSuspended != null) {
      reseller.isSuspended = body.isSuspended;
      reseller.suspendedAt = body.isSuspended ? new Date() : null;
      reseller.suspendedReason = body.suspendedReason || "";
      await User.findByIdAndUpdate(reseller.userId, {
        status: body.isSuspended ? "suspended" : "active",
      });
    }
    if (body.subscriptionPlan) {
      reseller.subscriptionPlan = body.subscriptionPlan;
      await Subscription.findOneAndUpdate(
        { resellerId: reseller._id },
        { plan: body.subscriptionPlan },
        { upsert: true }
      );
    }
    if (body.usageLimit != null) reseller.usageLimit = body.usageLimit;
    if (body.credits != null) reseller.credits = body.credits;
    if (body.freeCreditsMinutes != null) reseller.freeCreditsMinutes = body.freeCreditsMinutes;
    if (body.minutesUsed != null) reseller.minutesUsed = body.minutesUsed;
    if (body.companyName) reseller.companyName = body.companyName;

    await reseller.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
