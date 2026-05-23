import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import { requireResellerSession } from "@/lib/saas/session";
import {
  initializeTransaction,
  isPaystackConfigured,
  planAmountMinor,
  planCurrency,
} from "@/lib/saas/paystack";
import { PLANS } from "@/lib/saas/constants";

export async function POST(req) {
  try {
    if (!isPaystackConfigured()) {
      return NextResponse.json({ error: "Paystack is not configured" }, { status: 503 });
    }

    const session = await requireResellerSession();
    const { plan } = await req.json();

    if (!plan || plan === PLANS.FREE || !Object.values(PLANS).includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = planAmountMinor(plan);
    if (amount <= 0) {
      return NextResponse.json({ error: "Plan has no price" }, { status: 400 });
    }

    await dbConnect();
    const reseller = await Reseller.findOne({ userId: session.userId }).lean();
    if (!reseller) {
      return NextResponse.json({ error: "Reseller account not found" }, { status: 404 });
    }

    const reference = `bm_${plan}_${uuidv4().replace(/-/g, "").slice(0, 16)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    const data = await initializeTransaction({
      email: session.email,
      amount,
      currency: planCurrency(),
      reference,
      callbackUrl: `${appUrl}/reseller/billing?reference=${reference}`,
      metadata: {
        resellerId: reseller._id.toString(),
        userId: session.userId,
        plan,
      },
    });

    return NextResponse.json({
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
      reference: data.reference,
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message || "Payment init failed" }, { status });
  }
}
