const mongoose = require("mongoose");

const recordingSchema = new mongoose.Schema(
  {
    recordingId: { type: String, required: true, unique: true, index: true },
    egressId: { type: String },
    roomName: { type: String, required: true, index: true },
    hostUserId: { type: String },
    hostName: { type: String },
    resellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Reseller", index: true },
    meetingId: { type: String, index: true },
    status: {
      type: String,
      enum: ["starting", "active", "processing", "completed", "failed", "stopped"],
      default: "starting",
    },
    duration: { type: Number },
    fileUrl: { type: String },
    filePath: { type: String },
    startedAt: { type: Date },
    endedAt: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Recording || mongoose.model("Recording", recordingSchema);
