import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/saas/apiAuth";
import { getPlanLimits, checkUsageLimits } from "@/lib/saas/usage";
import { logApiUsage } from "@/lib/saas/trackUsage";

export async function GET(req) {
  const auth = await authenticateApiRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { reseller, subscription } = auth;
  const limits = getPlanLimits(reseller.subscriptionPlan);
  const usage = checkUsageLimits(reseller, subscription);

  await logApiUsage({
    resellerId: reseller._id,
    endpoint: "/api/v1/usage",
    method: "GET",
  });

  return NextResponse.json({
    minutesUsed: reseller.minutesUsed,
    roomsCreated: reseller.roomsCreated,
    recordingsCount: reseller.recordingsCount,
    plan: reseller.subscriptionPlan,
    limits,
    usage,
    freeCreditsMinutes: reseller.freeCreditsMinutes,
    freeCreditsExpiresAt: reseller.freeCreditsExpiresAt,
  });
}
