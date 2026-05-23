import { ROLES } from "@/lib/saas/constants";

export function getDashboardPathForRole(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/admin/dashboard";
    case ROLES.RESELLER:
    case ROLES.TEAM_MEMBER:
      return "/reseller/dashboard";
    default:
      return "/#workspace";
  }
}
