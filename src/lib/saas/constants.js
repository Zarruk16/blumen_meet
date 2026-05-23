export const ROLES = {
  SUPER_ADMIN: "super_admin",
  RESELLER: "reseller",
  TEAM_MEMBER: "team_member",
  CUSTOMER: "customer",
};

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

export const PLANS = {
  FREE: "free",
  STARTER: "starter",
  PRO: "pro",
  ENTERPRISE: "enterprise",
};

export const PLAN_LIMITS = {
  free: {
    minutesPerMonth: 500,
    roomsPerMonth: 20,
    maxParticipants: 10,
    recordingsPerMonth: 5,
    aiSummariesPerMonth: 3,
    label: "Free",
    price: 0,
  },
  starter: {
    minutesPerMonth: 5000,
    roomsPerMonth: 200,
    maxParticipants: 25,
    recordingsPerMonth: 50,
    aiSummariesPerMonth: 25,
    label: "Starter",
    price: 49,
  },
  pro: {
    minutesPerMonth: 25000,
    roomsPerMonth: 1000,
    maxParticipants: 100,
    recordingsPerMonth: 250,
    aiSummariesPerMonth: 100,
    label: "Pro",
    price: 149,
  },
  enterprise: {
    minutesPerMonth: 100000,
    roomsPerMonth: 10000,
    maxParticipants: 500,
    recordingsPerMonth: 2000,
    aiSummariesPerMonth: 500,
    label: "Enterprise",
    price: 499,
  },
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  TRIAL: "trial",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const FREE_CREDITS_DEFAULT = {
  minutes: 10000,
  expiresInDays: 30,
};
