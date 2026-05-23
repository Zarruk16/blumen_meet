"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

function StatusBadge({ ok, label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
      }`}
    >
      {ok ? "Configured" : "Not set"} — {label}
    </span>
  );
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    adminApi.platformConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Settings"
      subtitle="Platform configuration"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <div className="space-y-6">
        {config && (
          <div className="flex flex-wrap gap-2">
            <StatusBadge ok={config.superAdmin?.configured} label="Super admin emails" />
            <StatusBadge ok={config.paystack?.configured} label="Paystack" />
            <StatusBadge ok={config.email?.configured} label="SMTP email" />
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 text-sm text-zinc-400">
          <h2 className="text-base font-semibold text-white">Super admin access</h2>
          <p>
            Set <code className="text-sky-300">SUPER_ADMIN_EMAILS</code> in{" "}
            <code className="text-zinc-500">.env.local</code> (comma-separated). Those emails
            receive <code className="text-sky-300">super_admin</code> on OAuth or credentials
            sign-in.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">
            SUPER_ADMIN_EMAILS=you@company.com,other@company.com
          </pre>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 text-sm text-zinc-400">
          <h2 className="text-base font-semibold text-white">Paystack billing</h2>
          <p>
            Resellers upgrade plans from <strong className="text-zinc-200">Billing</strong> in the
            reseller dashboard. Add keys from your Paystack dashboard (Test or Live).
          </p>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">
{`PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_CURRENCY=NGN
PAYSTACK_NGN_PER_USD=1600`}
          </pre>
          {config?.paystack?.webhookUrl && (
            <p>
              Webhook URL (charge.success):{" "}
              <code className="break-all text-sky-300">{config.paystack.webhookUrl}</code>
            </p>
          )}
          <p className="text-xs">
            Plan prices in the app are in USD; for NGN, amounts use{" "}
            <code className="text-sky-300">PAYSTACK_NGN_PER_USD</code> × plan price × 100 (kobo).
            Override currency with <code className="text-sky-300">PAYSTACK_CURRENCY=USD</code> for
            dollar charges.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 text-sm text-zinc-400">
          <h2 className="text-base font-semibold text-white">Email (SMTP)</h2>
          <p>
            Password reset and email verification use the token fields on the User model. When
            SMTP is configured, register sends a verification link; forgot-password sends reset
            links.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-zinc-300">
{`SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@yourdomain.com`}
          </pre>
          <p className="text-xs">
            In development without SMTP, email content is logged to the server console.
          </p>
        </section>
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
