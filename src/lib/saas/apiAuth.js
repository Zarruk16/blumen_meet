import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import Subscription from "@/models/Subscription";
import { verifyApiSecret } from "./apiKeys";
import { checkUsageLimits } from "./usage";

export async function authenticateApiRequest(req) {
  const apiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.split(":")[0];
  const apiSecret =
    req.headers.get("x-api-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.split(":")[1];

  if (!apiKey) {
    return { ok: false, status: 401, error: "Missing API key" };
  }

  await dbConnect();
  const reseller = await Reseller.findOne({ apiKey }).select("+apiSecretHash");
  if (!reseller) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  if (apiSecret && !verifyApiSecret(apiSecret, reseller.apiSecretHash)) {
    return { ok: false, status: 401, error: "Invalid API secret" };
  }

  const subscription = await Subscription.findOne({ resellerId: reseller._id }).lean();
  const usageCheck = checkUsageLimits(reseller, subscription);
  if (!usageCheck.allowed) {
    return {
      ok: false,
      status: 429,
      error: `Usage limit exceeded: ${usageCheck.reason}`,
      reason: usageCheck.reason,
    };
  }

  return { ok: true, reseller, subscription };
}
