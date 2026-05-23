const mongoose = require("mongoose");

const apiUsageSchema = new mongoose.Schema(
  {
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    endpoint: { type: String, required: true, index: true },
    method: { type: String, default: "POST" },
    statusCode: { type: Number, default: 200 },
    requests: { type: Number, default: 1 },
    bandwidth: { type: Number, default: 0 },
    minutesConsumed: { type: Number, default: 0 },
    roomName: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

apiUsageSchema.index({ createdAt: -1 });
apiUsageSchema.index({ resellerId: 1, createdAt: -1 });

module.exports = mongoose.models.ApiUsage || mongoose.model("ApiUsage", apiUsageSchema);
