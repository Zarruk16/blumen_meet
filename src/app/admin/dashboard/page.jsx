"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Video, Clock, Activity } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .stats()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const s = data?.stats;

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Platform overview"
      subtitle="Monitor resellers, usage, and live meetings"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resellers" value={s?.resellers ?? "—"} icon={Users} accent="violet" />
        <StatCard label="Active meetings" value={s?.activeMeetings ?? "—"} icon={Video} accent="sky" />
        <StatCard
          label="Minutes consumed"
          value={s?.totalMinutes?.toLocaleString() ?? "—"}
          icon={Clock}
          accent="emerald"
        />
        <StatCard
          label="API requests today"
          value={s?.apiRequestsToday ?? "—"}
          icon={Activity}
          accent="amber"
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Recent resellers</h2>
        <DataTable
          columns={[
            { key: "company", label: "Company", render: (r) => r.companyName || r.user?.name },
            { key: "email", label: "Email", render: (r) => r.user?.email },
            { key: "plan", label: "Plan" },
            { key: "minutes", label: "Minutes", render: (r) => r.minutesUsed },
            {
              key: "status",
              label: "Status",
              render: (r) => (r.isSuspended ? "Suspended" : "Active"),
            },
          ]}
          rows={data?.recentResellers || []}
          emptyMessage="No resellers yet"
        />
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
