import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import { generateApiKeyPair, hashApiSecret } from "./apiKeys";
import { FREE_CREDITS_DEFAULT, PLANS, ROLES } from "./constants";

export async function createResellerForUser(userId, { companyName = "", plan = PLANS.FREE } = {}) {
  await dbConnect();
  const existing = await Reseller.findOne({ userId });
  if (existing) return existing;

  const { apiKey, apiSecret } = generateApiKeyPair();
  const freeCreditsExpiresAt = new Date();
  freeCreditsExpiresAt.setDate(freeCreditsExpiresAt.getDate() + FREE_CREDITS_DEFAULT.expiresInDays);

  const reseller = await Reseller.create({
    userId,
    companyName,
    apiKey,
    apiSecretHash: hashApiSecret(apiSecret),
    subscriptionPlan: plan,
    freeCreditsMinutes: FREE_CREDITS_DEFAULT.minutes,
    freeCreditsExpiresAt,
    usageLimit: 500,
  });

  await Subscription.create({
    resellerId: reseller._id,
    plan,
    status: "trial",
    trialEndsAt: freeCreditsExpiresAt,
    expiresAt: freeCreditsExpiresAt,
  });

  await User.findByIdAndUpdate(userId, {
    role: ROLES.RESELLER,
    resellerId: reseller._id,
    company: companyName,
  });

  return { reseller, apiSecret };
}

export async function getResellerByUserId(userId) {
  await dbConnect();
  return Reseller.findOne({ userId }).lean();
}

export async function getResellerByApiKey(apiKey) {
  await dbConnect();
  return Reseller.findOne({ apiKey }).select("+apiSecretHash").lean();
}

export async function rotateResellerKeys(resellerId) {
  await dbConnect();
  const { apiKey, apiSecret } = generateApiKeyPair();
  await Reseller.findByIdAndUpdate(resellerId, {
    apiKey,
    apiSecretHash: hashApiSecret(apiSecret),
  });
  return { apiKey, apiSecret };
}
