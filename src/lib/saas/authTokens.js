import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const RESET_TTL_MS = 60 * 60 * 1000;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generatePlainToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPasswordResetToken(userId) {
  await dbConnect();
  const token = generatePlainToken();
  await User.findByIdAndUpdate(userId, {
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: new Date(Date.now() + RESET_TTL_MS),
  });
  return token;
}

export async function findUserByPasswordResetToken(token) {
  if (!token) return null;
  await dbConnect();
  return User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");
}

export async function clearPasswordResetToken(userId) {
  await dbConnect();
  await User.findByIdAndUpdate(userId, {
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
}

export async function createEmailVerificationToken(userId) {
  await dbConnect();
  const token = generatePlainToken();
  await User.findByIdAndUpdate(userId, {
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: new Date(Date.now() + VERIFY_TTL_MS),
  });
  return token;
}

export async function findUserByEmailVerificationToken(token) {
  if (!token) return null;
  await dbConnect();
  return User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");
}

export async function markEmailVerified(userId) {
  await dbConnect();
  await User.findByIdAndUpdate(userId, {
    isVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });
}
