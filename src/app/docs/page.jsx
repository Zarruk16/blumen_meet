import Link from "next/link";
import { DocsCallout } from "@/components/docs/DocsCallout";

export default function DocsIntroductionPage() {
  return (
    <>
      <h1>Introduction</h1>
      <p className="docs-lead">
        Welcome to the Blumen Meet developer documentation. Integrate HD video meetings, recordings,
        and AI summaries into your application using our reseller API.
      </p>

      <h2>What you can build</h2>
      <ul>
        <li>Create instant or scheduled meeting rooms from your backend</li>
        <li>Send participants a join link — no Blumen Meet account required for guests</li>
        <li>Track minutes, rooms, and plan limits programmatically</li>
        <li>Manage API keys from the reseller dashboard</li>
      </ul>

      <h2>How it works</h2>
      <ol>
        <li>
          <Link href="/saas/register">Register a reseller account</Link> and receive your API key
          and secret (shown once).
        </li>
        <li>
          Call the REST API with your credentials to create a <code>roomId</code> and{" "}
          <code>joinUrl</code>.
        </li>
        <li>
          Redirect users to <code>/join/[roomId]</code> or embed the join flow in your product.
        </li>
        <li>Hosts use the <code>hostKey</code> returned at creation time for host privileges.</li>
      </ol>

      <DocsCallout variant="tip" title="Base URL">
        All API requests use your app URL, e.g.{" "}
        <code>https://your-domain.com/api/v1/...</code>. In development:{" "}
        <code>http://localhost:3000/api/v1/...</code>
      </DocsCallout>

      <h2>Documentation sections</h2>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {[
          { href: "/docs/getting-started", label: "Getting started", desc: "Account setup & first API call" },
          { href: "/docs/authentication", label: "Authentication", desc: "API keys & request headers" },
          { href: "/docs/api/meetings", label: "Meetings API", desc: "Create and list rooms" },
          { href: "/docs/api/usage", label: "Usage API", desc: "Quotas and plan limits" },
          { href: "/docs/join-hosting", label: "Join & hosting", desc: "URLs, host keys, guests" },
          { href: "/docs/limits", label: "Plans & limits", desc: "Rate limits and errors" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/5"
          >
            <p className="font-medium text-white">{card.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
