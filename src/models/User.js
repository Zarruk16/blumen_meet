const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, index: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["super_admin", "reseller", "team_member", "customer"],
      default: "customer",
    },
    company: { type: String, default: "" },
    avatar: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false },
    resellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Reseller", index: true },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
