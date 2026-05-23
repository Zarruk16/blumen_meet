import {
  LayoutDashboard,
  Users,
  Video,
  Film,
  BarChart3,
  CreditCard,
  Settings,
  ScrollText,
} from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/resellers", label: "Resellers", icon: Users },
  { href: "/admin/meetings", label: "Meetings", icon: Video },
  { href: "/admin/recordings", label: "Recordings", icon: Film },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/api-logs", label: "API Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
