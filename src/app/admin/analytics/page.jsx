"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats().then(setStats);
  }, []);

  const chartData = [
    { name: "Resellers", value: stats?.stats?.resellers || 0 },
    { name: "Meetings", value: stats?.stats?.meetings || 0 },
    { name: "Recordings", value: stats?.stats?.recordings || 0 },
    { name: "API today", value: stats?.stats?.apiRequestsToday || 0 },
  ];

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Analytics"
      subtitle="Platform growth and usage"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total minutes" value={stats?.stats?.totalMinutes?.toLocaleString() ?? "—"} />
        <StatCard label="Users" value={stats?.stats?.users ?? "—"} accent="violet" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 h-80">
        <h3 className="mb-4 text-sm font-medium text-zinc-400">Platform snapshot</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
            <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
