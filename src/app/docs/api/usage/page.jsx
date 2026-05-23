import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ParamTable } from "@/components/docs/ParamTable";

const base = "https://your-domain.com";

export default function ApiUsagePage() {
  return (
    <>
      <h1>Usage API</h1>
      <p className="docs-lead">
        Check your current plan, consumption, and whether you can create more meetings before
        billing cycle resets.
      </p>

      <h2>Get usage</h2>
      <p>
        <span className="docs-method get">GET</span>
        <code className="docs-endpoint">/api/v1/usage</code>
      </p>

      <CodeBlock
        title="Request"
        code={`curl ${base}/api/v1/usage \\
  -H "X-Api-Key: YOUR_KEY" \\
  -H "X-Api-Secret: YOUR_SECRET"`}
      />

      <h3>Response fields</h3>
      <ParamTable
        rows={[
          { name: "minutesUsed", type: "number", required: true, description: "Total minutes consumed this period." },
          { name: "roomsCreated", type: "number", required: true, description: "Rooms created this period." },
          { name: "recordingsCount", type: "number", required: true, description: "Recordings stored." },
          { name: "plan", type: "string", required: true, description: "free | starter | pro | enterprise" },
          { name: "limits", type: "object", required: true, description: "Plan limits (minutes, rooms, participants, etc.)." },
          { name: "usage", type: "object", required: true, description: "Includes allowed flag and reason if blocked." },
          { name: "freeCreditsMinutes", type: "number", required: false, description: "Trial/free credit balance." },
          { name: "freeCreditsExpiresAt", type: "string", required: false, description: "ISO date when trial credits expire." },
        ]}
      />

      <CodeBlock
        title="Example"
        language="json"
        code={`{
  "minutesUsed": 120,
  "roomsCreated": 8,
  "recordingsCount": 2,
  "plan": "starter",
  "limits": {
    "minutesPerMonth": 5000,
    "roomsPerMonth": 200,
    "maxParticipants": 25,
    "recordingsPerMonth": 50,
    "aiSummariesPerMonth": 25,
    "label": "Starter",
    "price": 49
  },
  "usage": {
    "allowed": true,
    "reason": null,
    "effectiveMinuteLimit": 5000
  },
  "freeCreditsMinutes": 0,
  "freeCreditsExpiresAt": null
}`}
      />

      <h2>When usage is blocked</h2>
      <p>
        Creating a meeting while over limit returns <code>429</code> with a message such as{" "}
        <code>Usage limit exceeded: minutes</code>. Upgrade your plan in the{" "}
        <Link href="/reseller/billing">reseller billing</Link> page or wait for the next cycle.
      </p>
      <p>
        See <Link href="/docs/limits">Plans & limits</Link> for per-plan quotas.
      </p>
    </>
  );
}
