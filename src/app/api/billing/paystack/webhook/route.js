import { NextResponse } from "next/server";
import { verifyPaystackSignature, verifyTransaction } from "@/lib/saas/paystack";
import { activateResellerPlan } from "@/lib/saas/billingService";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = event.data?.reference;
    if (!reference) {
      return NextResponse.json({ received: true });
    }

    const tx = await verifyTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.json({ received: true });
    }

    const plan = tx.metadata?.plan;
    const resellerId = tx.metadata?.resellerId;
    if (plan && resellerId) {
      await activateResellerPlan(resellerId, plan, {
        reference: tx.reference,
        customerCode: tx.customer?.customer_code || "",
        paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paystack/webhook]", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
