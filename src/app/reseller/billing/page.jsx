"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";
import { PLAN_LIMITS, PLANS } from "@/lib/saas/constants";
import Loader from "@/app/components/Loader";

function BillingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState("free");
  const [paystackReady, setPaystackReady] = useState(false);
  const [upgrading, setUpgrading] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const verifiedRef = useRef(null);

  const loadStats = () => {
    resellerApi.stats().then((d) => {
      setPlan(d.reseller?.plan || "free");
      setPaystackReady(Boolean(d.paystack?.configured));
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference || verifiedRef.current === reference) return;

    verifiedRef.current = reference;
    setVerifying(true);
    resellerApi
      .verifyPaystack(reference)
      .then(() => {
        toast.success("Payment successful — plan updated");
        loadStats();
        window.history.replaceState({}, "", "/reseller/billing");
      })
      .catch((err) => toast.error(err.message || "Payment verification failed"))
      .finally(() => setVerifying(false));
  }, [searchParams]);

  const handleUpgrade = async (planKey) => {
    if (planKey === PLANS.FREE) return;
    if (!paystackReady) {
      toast.error("Paystack is not configured. Add keys in server environment.");
      return;
    }
    setUpgrading(planKey);
    try {
      const { authorizationUrl } = await resellerApi.initializePaystack(planKey);
      window.location.href = authorizationUrl;
    } catch (err) {
      toast.error(err.message || "Could not start checkout");
      setUpgrading(null);
    }
  };

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Billing"
      subtitle="Plans and subscription via Paystack"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      {verifying && (
        <p className="mb-4 text-sm text-sky-300">Confirming your payment…</p>
      )}
      <p className="mb-6 text-sm text-zinc-400">
        Current plan: <strong className="text-white">{plan}</strong>
        {!paystackReady && (
          <span className="ml-2 text-amber-400">(Paystack keys not configured yet)</span>
        )}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PLAN_LIMITS).map(([key, p]) => (
          <div
            key={key}
            className={`flex flex-col rounded-2xl border p-5 ${
              key === plan ? "border-sky-500/50 bg-sky-500/10" : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <p className="font-semibold text-white">{p.label}</p>
            <p className="mt-2 text-2xl font-bold">
              ${p.price}
              <span className="text-sm font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-4 flex-1 space-y-1 text-xs text-zinc-400">
              <li>{p.minutesPerMonth.toLocaleString()} minutes</li>
              <li>{p.roomsPerMonth} rooms</li>
              <li>{p.maxParticipants} participants</li>
            </ul>
            {key !== PLANS.FREE && key !== plan && (
              <button
                type="button"
                disabled={!paystackReady || upgrading === key}
                onClick={() => handleUpgrade(key)}
                className="mt-4 w-full rounded-xl bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {upgrading === key ? "Redirecting…" : "Upgrade with Paystack"}
              </button>
            )}
            {key === plan && key !== PLANS.FREE && (
              <p className="mt-4 text-center text-xs text-emerald-400">Current plan</p>
            )}
          </div>
        ))}
      </div>
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}

export default function ResellerBillingPage() {
  return (
    <Suspense fallback={<Loader />}>
      <BillingContent />
    </Suspense>
  );
}
