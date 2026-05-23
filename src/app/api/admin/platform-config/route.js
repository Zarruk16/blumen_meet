import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/saas/session";
import { isPaystackConfigured, getPaystackPublicKey } from "@/lib/saas/paystack";
import { isEmailConfigured } from "@/lib/saas/email";
export async function GET() {
  try {
    await requireAdminSession();

    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    return NextResponse.json({
      superAdmin: {
        configured: superAdminEmails.length > 0,
        count: superAdminEmails.length,
      },
      paystack: {
        configured: isPaystackConfigured(),
        publicKeySet: Boolean(getPaystackPublicKey()),
        currency: process.env.PAYSTACK_CURRENCY || "NGN",
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/billing/paystack/webhook`,
      },
      email: {
        configured: isEmailConfigured(),
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
