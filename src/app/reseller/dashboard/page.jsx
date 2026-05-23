"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Video, Clock, Film } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);

  useEffect(() => {
    resellerApi.stats().then(setData).catch(console.error);
  }, []);

  const r = data?.reseller;
  const s = data?.stats;

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title={r?.companyName || "Reseller dashboard"}
      subtitle={`${r?.plan || "free"} plan · ${data?.minutesPercent ?? 0}% minutes used`}
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      {!data?.usage?.allowed && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Usage limit reached ({data?.usage?.reason}). Upgrade your plan or wait for reset.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers" value={s?.customers ?? "—"} icon={Users} accent="violet" />
        <StatCard label="Meetings" value={s?.meetings ?? "—"} icon={Video} accent="sky" />
        <StatCard
          label="Minutes used"
          value={r?.minutesUsed?.toLocaleString() ?? "—"}
          icon={Clock}
          accent="emerald"
        />
        <StatCard label="Recordings" value={s?.recordings ?? "—"} icon={Film} accent="amber" />
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Free credits</h3>
        <p className="text-2xl font-bold text-white">
          {(r?.freeCreditsMinutes ?? 0).toLocaleString()} bonus minutes
        </p>
        {r?.freeCreditsExpiresAt && (
          <p className="mt-1 text-xs text-zinc-500">
            Expires {new Date(r.freeCreditsExpiresAt).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
