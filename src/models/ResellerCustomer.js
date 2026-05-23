const mongoose = require("mongoose");

const resellerCustomerSchema = new mongoose.Schema(
  {
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    meetingsCount: { type: Number, default: 0 },
    minutesUsed: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

resellerCustomerSchema.index({ resellerId: 1, email: 1 }, { unique: true });

module.exports =
  mongoose.models.ResellerCustomer ||
  mongoose.model("ResellerCustomer", resellerCustomerSchema);
