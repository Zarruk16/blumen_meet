import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import { PLANS } from "./constants";

export async function activateResellerPlan(resellerId, plan, paystack = {}) {
  if (!Object.values(PLANS).includes(plan) || plan === PLANS.FREE) {
    throw new Error("Invalid plan");
  }

  await dbConnect();

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await Reseller.findByIdAndUpdate(resellerId, {
    subscriptionPlan: plan,
    isSuspended: false,
  });

  await Subscription.findOneAndUpdate(
    { resellerId },
    {
      plan,
      status: "active",
      expiresAt,
      billingCycle: "monthly",
      paystackReference: paystack.reference || "",
      paystackCustomerCode: paystack.customerCode || "",
      lastPaymentAt: paystack.paidAt || new Date(),
    },
    { upsert: true }
  );

  return { plan, expiresAt };
}
