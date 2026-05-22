const mongoose = require("mongoose");

const meetingSummarySchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    recordingId: { type: String },
    title: { type: String },
    summary: { type: String },
    keyPoints: [{ type: String }],
    actionItems: [{ type: String }],
    decisions: [{ type: String }],
    speakerHighlights: [
      {
        speaker: String,
        contribution: String,
      },
    ],
    timestamps: [
      {
        time: String,
        label: String,
        note: String,
      },
    ],
    transcript: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    generatedAt: { type: Date },
    error: { type: String },
    summaryNote: { type: String },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.MeetingSummary || mongoose.model("MeetingSummary", meetingSummarySchema);
