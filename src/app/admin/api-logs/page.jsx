"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminApiLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    adminApi.apiLogs().then((d) => setLogs(d.logs || []));
  }, []);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="API logs"
      subtitle="Reseller API request history"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <DataTable
        columns={[
          { key: "endpoint", label: "Endpoint" },
          { key: "method", label: "Method" },
          { key: "status", label: "Status", render: (l) => l.statusCode },
          { key: "minutes", label: "Minutes", render: (l) => l.minutesConsumed || "—" },
          {
            key: "time",
            label: "Time",
            render: (l) => new Date(l.createdAt).toLocaleString(),
          },
        ]}
        rows={logs}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
