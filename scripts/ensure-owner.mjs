/**
 * One-time: create or update platform owner (super_admin) with email/password.
 * Usage: OWNER_EMAIL=... OWNER_PASSWORD=... node scripts/ensure-owner.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const email = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
const password = process.env.OWNER_PASSWORD || "";

if (!email || !password) {
  console.error("Set OWNER_EMAIL and OWNER_PASSWORD environment variables.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["super_admin", "reseller", "team_member", "customer"],
      default: "customer",
    },
    company: { type: String, default: "" },
    avatar: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended", "pending"], default: "active" },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "google-meet" });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: "Platform Owner",
        email,
        password: hash,
        role: "super_admin",
        status: "active",
        isVerified: true,
      },
    },
    { upsert: true, new: true }
  );
  console.log("Owner ready:", user.email, "role:", user.role, "id:", user._id.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
