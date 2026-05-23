import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export const metadata = {
  title: "Reseller | Blumen Meet",
};

export default function ResellerLayout({ children }) {
  return (
    <DashboardGuard allowedRoles={["reseller", "team_member", "super_admin"]}>
      {children}
    </DashboardGuard>
  );
}
