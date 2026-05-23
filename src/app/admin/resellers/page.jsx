"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminResellersPage() {
  const { data: session } = useSession();
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi
      .resellers()
      .then((d) => setResellers(d.resellers || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSuspend = async (r) => {
    try {
      await adminApi.updateReseller(r.id, { isSuspended: !r.isSuspended });
      toast.success(r.isSuspended ? "Reseller activated" : "Reseller suspended");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Resellers"
      subtitle="Create, manage, and monitor reseller accounts"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <a
          href="/saas/register"
          className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Invite reseller (register link)
        </a>
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading…</p>
      ) : (
        <DataTable
          columns={[
            { key: "company", label: "Company", render: (r) => r.companyName || r.user?.name },
            { key: "email", label: "Email", render: (r) => r.user?.email },
            { key: "plan", label: "Plan" },
            { key: "minutes", label: "Minutes", render: (r) => r.minutesUsed },
            { key: "rooms", label: "Rooms", render: (r) => r.roomsCreated },
            { key: "apiKey", label: "API Key", render: (r) => r.apiKey },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <button
                  type="button"
                  onClick={() => toggleSuspend(r)}
                  className="text-xs font-medium text-amber-300 hover:text-amber-200"
                >
                  {r.isSuspended ? "Activate" : "Suspend"}
                </button>
              ),
            },
          ]}
          rows={resellers}
        />
      )}
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
