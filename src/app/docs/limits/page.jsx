import Link from "next/link";
import { DocsCallout } from "@/components/docs/DocsCallout";

const plans = [
  { name: "Free", key: "free", minutes: "500", rooms: "20", participants: "10", price: "$0" },
  { name: "Starter", key: "starter", minutes: "5,000", rooms: "200", participants: "25", price: "$49/mo" },
  { name: "Pro", key: "pro", minutes: "25,000", rooms: "1,000", participants: "100", price: "$149/mo" },
  { name: "Enterprise", key: "enterprise", minutes: "100,000", rooms: "10,000", participants: "500", price: "$499/mo" },
];

export default function LimitsPage() {
  return (
    <>
      <h1>Plans & limits</h1>
      <p className="docs-lead">
        API usage is metered per reseller account. Limits depend on your subscription plan and trial
        credits.
      </p>

      <h2>Plan comparison</h2>
      <div className="not-prose overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="px-4 py-3 text-zinc-300">Plan</th>
              <th className="px-4 py-3 text-zinc-300">Minutes / month</th>
              <th className="px-4 py-3 text-zinc-300">Rooms / month</th>
              <th className="px-4 py-3 text-zinc-300">Max participants</th>
              <th className="px-4 py-3 text-zinc-300">Price</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.key} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3 text-zinc-400">{p.minutes}</td>
                <td className="px-4 py-3 text-zinc-400">{p.rooms}</td>
                <td className="px-4 py-3 text-zinc-400">{p.participants}</td>
                <td className="px-4 py-3 text-zinc-400">{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4">
        Upgrade via <Link href="/reseller/billing">Reseller → Billing</Link> (Paystack). New accounts
        start on a trial with free credits.
      </p>

      <h2>HTTP status codes</h2>
      <ul>
        <li><code>200</code> — success</li>
        <li><code>400</code> — invalid request body or parameters</li>
        <li><code>401</code> — missing or invalid API credentials</li>
        <li><code>409</code> — registration conflict (email already exists)</li>
        <li><code>429</code> — usage limit exceeded</li>
        <li><code>500</code> — internal server error</li>
        <li><code>503</code> — feature not configured (e.g. Paystack, SMTP)</li>
      </ul>

      <h2>Checking limits before calls</h2>
      <p>
        Call <Link href="/docs/api/usage">GET /api/v1/usage</Link> and inspect{" "}
        <code>usage.allowed</code>. If <code>false</code>, <code>usage.reason</code> describes which
        limit was hit.
      </p>

      <DocsCallout variant="info" title="API logging">
        All API calls are logged in your reseller dashboard for debugging and analytics.
      </DocsCallout>
    </>
  );
}
