const mongoose = require("mongoose");

const voipDeviceSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    platform: { type: String, enum: ["ios", "android"], required: true },
    expoPushToken: { type: String, index: true },
    voipToken: { type: String },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

voipDeviceSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.models.VoipDevice || mongoose.model("VoipDevice", voipDeviceSchema);
