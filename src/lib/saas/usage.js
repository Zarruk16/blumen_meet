import { PLAN_LIMITS, PLANS } from "./constants";

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS[PLANS.FREE];
}

export function checkUsageLimits(reseller, subscription) {
  const plan = subscription?.plan || reseller?.subscriptionPlan || PLANS.FREE;
  const limits = getPlanLimits(plan);
  const minutesUsed = reseller?.minutesUsed || 0;
  const roomsCreated = reseller?.roomsCreated || 0;

  const bonusMinutes = reseller?.freeCreditsMinutes || 0;
  const effectiveMinuteLimit = limits.minutesPerMonth + bonusMinutes;

  if (reseller?.isSuspended) {
    return { allowed: false, reason: "account_suspended", limits };
  }

  if (minutesUsed >= effectiveMinuteLimit) {
    return { allowed: false, reason: "minutes_exceeded", limits, effectiveMinuteLimit };
  }

  if (roomsCreated >= limits.roomsPerMonth) {
    return { allowed: false, reason: "rooms_exceeded", limits };
  }

  if (
    reseller?.freeCreditsExpiresAt &&
    new Date(reseller.freeCreditsExpiresAt) < new Date() &&
    minutesUsed >= limits.minutesPerMonth
  ) {
    return { allowed: false, reason: "free_credits_expired", limits };
  }

  return { allowed: true, limits, effectiveMinuteLimit };
}

export function usagePercent(used, limit) {
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}
