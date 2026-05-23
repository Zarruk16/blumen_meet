import {
  LayoutDashboard,
  Users,
  Video,
  BarChart3,
  Film,
  CreditCard,
  Settings,
} from "lucide-react";

export const RESELLER_NAV = [
  { href: "/reseller/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/reseller/customers", label: "Customers", icon: Users },
  { href: "/reseller/meetings", label: "Meetings", icon: Video },
  { href: "/reseller/recordings", label: "Recordings", icon: Film },
  { href: "/reseller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reseller/billing", label: "Billing", icon: CreditCard },
  { href: "/reseller/settings", label: "Settings", icon: Settings },
];
