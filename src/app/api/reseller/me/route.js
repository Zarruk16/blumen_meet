import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import { requireResellerSession } from "@/lib/saas/session";
import { maskApiKey } from "@/lib/saas/apiKeys";

export async function GET() {
  try {
    const session = await requireResellerSession();
    await dbConnect();

    let reseller = await Reseller.findOne({ userId: session.userId }).lean();
    if (!reseller) {
      const { createResellerForUser } = await import("@/lib/saas/resellerService");
      const created = await createResellerForUser(session.userId, {
        companyName: session.company || session.name,
      });
      reseller = created.reseller.toObject();
    }

    return NextResponse.json({
      user: session,
      reseller: {
        id: reseller._id.toString(),
        companyName: reseller.companyName,
        apiKey: reseller.apiKey,
        apiKeyMasked: maskApiKey(reseller.apiKey),
        plan: reseller.subscriptionPlan,
        minutesUsed: reseller.minutesUsed,
        roomsCreated: reseller.roomsCreated,
        freeCreditsExpiresAt: reseller.freeCreditsExpiresAt,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
