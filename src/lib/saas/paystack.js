import crypto from "crypto";
import { PLAN_LIMITS } from "./constants";

const PAYSTACK_BASE = "https://api.paystack.co";

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function getPaystackPublicKey() {
  return (
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() ||
    process.env.PAYSTACK_PUBLIC_KEY?.trim() ||
    ""
  );
}

export function verifyPaystackSignature(rawBody, signature) {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export function planAmountMinor(plan) {
  const price = PLAN_LIMITS[plan]?.price ?? 0;
  if (!price) return 0;

  const currency = (process.env.PAYSTACK_CURRENCY || "NGN").toUpperCase();
  if (currency === "NGN") {
    const rate = Number(process.env.PAYSTACK_NGN_PER_USD || 1600);
    return Math.round(price * rate * 100);
  }
  return Math.round(price * 100);
}

export function planCurrency() {
  return (process.env.PAYSTACK_CURRENCY || "NGN").toUpperCase();
}

export async function paystackRequest(path, options = {}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!data.status) {
    throw new Error(data.message || "Paystack request failed");
  }
  return data;
}

export async function initializeTransaction({
  email,
  amount,
  currency,
  reference,
  callbackUrl,
  metadata,
}) {
  const data = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount,
      currency: currency || planCurrency(),
      reference,
      callback_url: callbackUrl,
      metadata,
    }),
  });
  return data.data;
}

export async function verifyTransaction(reference) {
  const data = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data;
}
