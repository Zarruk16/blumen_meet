import { NextResponse } from "next/server";
import { requireResellerSession } from "@/lib/saas/session";
import { verifyTransaction, isPaystackConfigured } from "@/lib/saas/paystack";
import { activateResellerPlan } from "@/lib/saas/billingService";

export async function GET(req) {
  try {
    if (!isPaystackConfigured()) {
      return NextResponse.json({ error: "Paystack is not configured" }, { status: 503 });
    }

    await requireResellerSession();

    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const tx = await verifyTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 402 });
    }

    const plan = tx.metadata?.plan;
    const resellerId = tx.metadata?.resellerId;
    if (!plan || !resellerId) {
      return NextResponse.json({ error: "Invalid payment metadata" }, { status: 400 });
    }

    const result = await activateResellerPlan(resellerId, plan, {
      reference: tx.reference,
      customerCode: tx.customer?.customer_code || "",
      paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
    });

    return NextResponse.json({ ok: true, plan: result.plan, expiresAt: result.expiresAt });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message || "Verification failed" }, { status });
  }
}
