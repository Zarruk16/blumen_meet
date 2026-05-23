import crypto from "crypto";

export function generateApiKeyPair() {
  const suffix = crypto.randomBytes(16).toString("hex");
  return {
    apiKey: `pk_live_${suffix}`,
    apiSecret: `sk_live_${crypto.randomBytes(24).toString("hex")}`,
  };
}

export function hashApiSecret(secret) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function verifyApiSecret(secret, hash) {
  if (!secret || !hash) return false;
  return hashApiSecret(secret) === hash;
}

export function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 12) return "••••";
  return `${apiKey.slice(0, 12)}••••••••`;
}
