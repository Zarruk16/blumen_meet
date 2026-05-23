import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import Meeting from "@/models/Meeting";
import Recording from "@/models/Recording";
import ResellerCustomer from "@/models/ResellerCustomer";
import { requireResellerSession } from "@/lib/saas/session";
import { getPlanLimits, usagePercent, checkUsageLimits } from "@/lib/saas/usage";
import { isPaystackConfigured } from "@/lib/saas/paystack";

export async function GET() {
  try {
    const session = await requireResellerSession();
    await dbConnect();

    const reseller = await Reseller.findOne({ userId: session.userId }).lean();
    if (!reseller) {
      return NextResponse.json({ error: "Reseller account not found" }, { status: 404 });
    }

    const subscription = await Subscription.findOne({ resellerId: reseller._id }).lean();
    const limits = getPlanLimits(reseller.subscriptionPlan);
    const usage = checkUsageLimits(reseller, subscription);

    const [customers, meetings, recordings] = await Promise.all([
      ResellerCustomer.countDocuments({ resellerId: reseller._id }),
      Meeting.countDocuments({ resellerId: reseller._id }),
      Recording.countDocuments({ resellerId: reseller._id }),
    ]);

    const activeMeetings = await Meeting.countDocuments({
      resellerId: reseller._id,
      status: "active",
    });

    return NextResponse.json({
      reseller: {
        id: reseller._id.toString(),
        companyName: reseller.companyName,
        plan: reseller.subscriptionPlan,
        minutesUsed: reseller.minutesUsed,
        roomsCreated: reseller.roomsCreated,
        freeCreditsMinutes: reseller.freeCreditsMinutes,
        freeCreditsExpiresAt: reseller.freeCreditsExpiresAt,
        isSuspended: reseller.isSuspended,
      },
      usage,
      limits,
      minutesPercent: usagePercent(
        reseller.minutesUsed,
        usage.effectiveMinuteLimit || limits.minutesPerMonth
      ),
      stats: {
        customers,
        meetings,
        activeMeetings,
        recordings,
        aiSummaries: reseller.aiSummariesCount,
      },
      paystack: { configured: isPaystackConfigured() },
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
