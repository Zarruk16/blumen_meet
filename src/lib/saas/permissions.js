import { ROLES } from "./constants";

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN;
}

export function isResellerRole(role) {
  return role === ROLES.RESELLER || role === ROLES.TEAM_MEMBER;
}

export function canAccessAdmin(role) {
  return role === ROLES.SUPER_ADMIN;
}

export function canAccessResellerDashboard(role) {
  return role === ROLES.RESELLER || role === ROLES.TEAM_MEMBER;
}

export function resolveSuperAdminEmail(email) {
  const list = (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes((email || "").toLowerCase());
}
