import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsCallout } from "@/components/docs/DocsCallout";

const baseUrl = "https://your-domain.com";

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <p className="docs-lead">
        Connect your application to Blumen Meet in four steps: register, store credentials, create
        a meeting, and share the join link.
      </p>

      <h2>1. Create a reseller account</h2>
      <p>
        Visit the{" "}
        <Link href="/saas/register">reseller registration page</Link> and sign up with your company
        details. After registration you receive:
      </p>
      <ul>
        <li>
          <strong>API key</strong> — public identifier (safe to label in config, still treat as
          sensitive)
        </li>
        <li>
          <strong>API secret</strong> — shown only once; store it in your secrets manager
        </li>
        <li>Access to the <Link href="/reseller/dashboard">reseller dashboard</Link></li>
      </ul>

      <DocsCallout variant="warning" title="Save your API secret">
        The secret is displayed a single time at signup. If you lose it, rotate keys under{" "}
        <strong>Reseller → Settings</strong> in the dashboard.
      </DocsCallout>

      <h2>2. Store credentials securely</h2>
      <p>Never expose your API secret in client-side code or mobile apps. Call the API from your server.</p>
      <CodeBlock
        title=".env"
        language="env"
        code={`BLUMEN_API_KEY=bm_live_xxxxxxxx
BLUMEN_API_SECRET=your_secret_here
BLUMEN_API_BASE=${baseUrl}`}
      />

      <h2>3. Create your first meeting</h2>
      <p>Send a POST request to create a room. You get a <code>roomId</code>, <code>hostKey</code>, and <code>joinUrl</code>.</p>
      <CodeBlock
        title="curl"
        code={`curl -X POST ${baseUrl}/api/v1/meetings \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: $BLUMEN_API_KEY" \\
  -H "X-Api-Secret: $BLUMEN_API_SECRET" \\
  -d '{
    "title": "Customer onboarding",
    "hostName": "Support Team",
    "kind": "instant"
  }'`}
      />
      <p>Example response:</p>
      <CodeBlock
        title="JSON"
        language="json"
        code={`{
  "ok": true,
  "roomId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "hostKey": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "joinUrl": "${baseUrl}/join/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}`}
      />

      <h2>4. Send users to the join URL</h2>
      <p>
        Open <code>joinUrl</code> in a browser or redirect your users there. They enter a display
        name and join the LiveKit-powered meeting. See{" "}
        <Link href="/docs/join-hosting">Join & hosting</Link> for host vs guest flows.
      </p>

      <h2>Node.js example</h2>
      <CodeBlock
        title="create-meeting.js"
        language="javascript"
        code={`const res = await fetch(process.env.BLUMEN_API_BASE + "/api/v1/meetings", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.BLUMEN_API_KEY,
    "X-Api-Secret": process.env.BLUMEN_API_SECRET,
  },
  body: JSON.stringify({
    title: "Demo call",
    hostName: "API Host",
    kind: "instant",
  }),
});

const { joinUrl, hostKey, roomId } = await res.json();
console.log({ joinUrl, hostKey, roomId });`}
      />

      <DocsCallout variant="info" title="Next steps">
        Read <Link href="/docs/authentication">Authentication</Link> for header options and{" "}
        <Link href="/docs/api/meetings">Meetings API</Link> for all parameters.
      </DocsCallout>
    </>
  );
}
