import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export const metadata = {
  title: "Admin | Blumen Meet",
};

export default function AdminLayout({ children }) {
  return <DashboardGuard allowedRoles={["super_admin"]}>{children}</DashboardGuard>;
}
