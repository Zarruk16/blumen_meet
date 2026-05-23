import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsCallout } from "@/components/docs/DocsCallout";
import { ParamTable } from "@/components/docs/ParamTable";

const base = "https://your-domain.com";

export default function ApiMeetingsPage() {
  return (
    <>
      <h1>Meetings API</h1>
      <p className="docs-lead">
        Create and list meeting rooms scoped to your reseller account. Each room maps to a LiveKit
        session and a public join page.
      </p>

      <DocsCallout variant="info">
        Requires authentication — see <Link href="/docs/authentication">Authentication</Link>.
      </DocsCallout>

      <h2>Create meeting</h2>
      <p>
        <span className="docs-method post">POST</span>
        <code className="docs-endpoint">/api/v1/meetings</code>
      </p>
      <p>Creates a new room and returns identifiers for hosting and joining.</p>

      <h3>Request body</h3>
      <ParamTable
        rows={[
          {
            name: "title",
            type: "string",
            required: false,
            description: "Display title for the meeting (used in UI and logs).",
          },
          {
            name: "hostName",
            type: "string",
            required: false,
            description: "Default host display name. Falls back to title or company name.",
          },
          {
            name: "kind",
            type: "string",
            required: false,
            description: '"instant" (default) or "scheduled".',
          },
        ]}
      />

      <CodeBlock
        title="Request"
        code={`curl -X POST ${base}/api/v1/meetings \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_KEY" \\
  -H "X-Api-Secret: YOUR_SECRET" \\
  -d '{"title": "Sales call", "hostName": "Alex", "kind": "instant"}'`}
      />

      <h3>Response</h3>
      <ParamTable
        rows={[
          { name: "ok", type: "boolean", required: true, description: "true on success." },
          { name: "roomId", type: "string", required: true, description: "UUID for the room." },
          {
            name: "hostKey",
            type: "string",
            required: true,
            description: "Secret host token — store server-side; used for host privileges.",
          },
          {
            name: "joinUrl",
            type: "string",
            required: true,
            description: "Public URL for participants (/join/[roomId]).",
          },
        ]}
      />
      <CodeBlock
        title="201 / 200"
        language="json"
        code={`{
  "ok": true,
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "hostKey": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "joinUrl": "${base}/join/550e8400-e29b-41d4-a716-446655440000"
}`}
      />

      <h2>List meetings</h2>
      <p>
        <span className="docs-method get">GET</span>
        <code className="docs-endpoint">/api/v1/meetings</code>
      </p>
      <p>Returns the 50 most recent meetings for your reseller account.</p>

      <CodeBlock
        title="Request"
        code={`curl ${base}/api/v1/meetings \\
  -H "X-Api-Key: YOUR_KEY" \\
  -H "X-Api-Secret: YOUR_SECRET"`}
      />

      <CodeBlock
        title="Response"
        language="json"
        code={`{
  "meetings": [
    {
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "duration": 0,
      "createdAt": "2026-05-22T10:00:00.000Z"
    }
  ]
}`}
      />

      <h2>Meeting lifecycle</h2>
      <ul>
        <li>
          <strong>active</strong> — room created; participants can join via join URL.
        </li>
        <li>
          Hosts authenticate with <code>hostKey</code> when joining (see{" "}
          <Link href="/docs/join-hosting">Join & hosting</Link>).
        </li>
        <li>
          Ending a meeting from the UI expires the link for other participants; hosts can leave and
          transfer host.
        </li>
      </ul>

      <h2>Errors</h2>
      <ul>
        <li><code>401</code> — authentication failed</li>
        <li><code>429</code> — monthly room or minute limit reached</li>
        <li><code>500</code> — server error creating the room</li>
      </ul>
    </>
  );
}
