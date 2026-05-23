const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "trial", "cancelled", "expired"],
      default: "trial",
    },
    expiresAt: { type: Date },
    trialEndsAt: { type: Date },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "pay_as_you_go"],
      default: "monthly",
    },
    stripeCustomerId: { type: String, default: "" },
    stripeSubscriptionId: { type: String, default: "" },
    paystackCustomerCode: { type: String, default: "" },
    paystackSubscriptionCode: { type: String, default: "" },
    paystackReference: { type: String, default: "", index: true },
    lastPaymentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
