"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerAnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    resellerApi.stats().then(setData);
  }, []);

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Analytics"
      subtitle="Usage and growth"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs text-zinc-500 uppercase">Minutes</p>
          <p className="mt-2 text-3xl font-bold">
            {data?.reseller?.minutesUsed ?? 0} /{" "}
            {data?.usage?.effectiveMinuteLimit ?? data?.limits?.minutesPerMonth}
          </p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-500"
              style={{ width: `${data?.minutesPercent ?? 0}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs text-zinc-500 uppercase">Rooms created</p>
          <p className="mt-2 text-3xl font-bold">{data?.reseller?.roomsCreated ?? 0}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Limit: {data?.limits?.roomsPerMonth} / month
          </p>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
