"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminSubscriptionsPage() {
  const { data: session } = useSession();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    adminApi.subscriptions().then((d) => setSubs(d.subscriptions || []));
  }, []);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Subscriptions"
      subtitle="Reseller plans and billing status"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <DataTable
        columns={[
          { key: "company", label: "Reseller", render: (s) => s.reseller?.companyName },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status" },
          {
            key: "expires",
            label: "Expires",
            render: (s) => (s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"),
          },
        ]}
        rows={subs}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
