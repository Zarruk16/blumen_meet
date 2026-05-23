const mongoose = require("mongoose");

const resellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    companyName: { type: String, default: "" },
    apiKey: { type: String, unique: true, index: true },
    apiSecretHash: { type: String, select: false },
    usageLimit: { type: Number, default: 500 },
    minutesUsed: { type: Number, default: 0 },
    roomsCreated: { type: Number, default: 0 },
    recordingsCount: { type: Number, default: 0 },
    aiSummariesCount: { type: Number, default: 0 },
    subscriptionPlan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },
    credits: { type: Number, default: 0 },
    freeCreditsMinutes: { type: Number, default: 10000 },
    freeCreditsExpiresAt: { type: Date },
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedReason: { type: String, default: "" },
    lastApiRequestAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Reseller || mongoose.model("Reseller", resellerSchema);
