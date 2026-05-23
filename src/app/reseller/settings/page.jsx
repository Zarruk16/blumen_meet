"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerSettingsPage() {
  const { data: session } = useSession();
  const [me, setMe] = useState(null);
  const [newSecret, setNewSecret] = useState(null);

  useEffect(() => {
    resellerApi.me().then(setMe);
  }, []);

  const rotateKeys = async () => {
    try {
      const data = await resellerApi.rotateKeys();
      setNewSecret(data.apiSecret);
      toast.success("API keys rotated");
      resellerApi.me().then(setMe);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Settings"
      subtitle="API credentials and account"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      <div className="space-y-6 max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase text-zinc-500 mb-2">API Key (public)</p>
          <code className="block break-all text-sm text-sky-300">{me?.reseller?.apiKey}</code>
        </div>
        {newSecret && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <p className="text-xs text-amber-200 mb-2">New secret — copy now</p>
            <code className="block break-all text-sm text-white">{newSecret}</code>
          </div>
        )}
        <button
          type="button"
          onClick={rotateKeys}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          Rotate API keys
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
          <p className="font-medium text-white mb-2">API usage</p>
          <p>Header: <code className="text-sky-300">x-api-key</code> and <code className="text-sky-300">x-api-secret</code></p>
          <p className="mt-2">POST /api/v1/meetings — create meetings</p>
          <p>GET /api/v1/usage — check limits</p>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
