const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    hostKey: { type: String, required: true },
    hostUserId: { type: String },
    hostName: { type: String },
    ownerUserId: { type: String },
    currentHostUserId: { type: String },
    activeParticipants: [
      {
        presenceId: { type: String },
        userId: { type: String },
        name: { type: String },
      },
    ],
    kind: { type: String, enum: ["instant", "scheduled"], default: "instant" },
    recurrence: { type: String, enum: ["none", "daily", "weekly"], default: "none" },
    cancelled: { type: Boolean, default: false },
    startAt: { type: Date },
    status: { type: String, enum: ["scheduled", "active", "ended"], default: "active" },
    activeParticipantIds: [{ type: String }],
    endedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

