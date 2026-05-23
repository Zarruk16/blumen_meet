import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsCallout } from "@/components/docs/DocsCallout";

export default function AuthenticationPage() {
  return (
    <>
      <h1>Authentication</h1>
      <p className="docs-lead">
        Every request to the public API must include your reseller API key. Sensitive operations
        also require the API secret.
      </p>

      <h2>API credentials</h2>
      <p>
        Credentials are issued when you{" "}
        <Link href="/saas/register">register as a reseller</Link>. Find your API key anytime in{" "}
        <Link href="/reseller/settings">Reseller → Settings</Link>. The secret can only be viewed at
        creation or after a key rotation.
      </p>

      <h2>Request headers (recommended)</h2>
      <p>Send the key and secret as separate headers:</p>
      <CodeBlock
        code={`X-Api-Key: your_api_key
X-Api-Secret: your_api_secret
Content-Type: application/json`}
      />

      <h2>Authorization header (alternative)</h2>
      <p>You may pass credentials as a Bearer token in <code>key:secret</code> format:</p>
      <CodeBlock
        code={`Authorization: Bearer YOUR_API_KEY:YOUR_API_SECRET`}
      />

      <DocsCallout variant="warning" title="Server-side only">
        Never embed the API secret in frontend JavaScript, mobile apps, or public repositories. Proxy
        requests through your backend.
      </DocsCallout>

      <h2>Key rotation</h2>
      <p>
        Rotate compromised or expired keys from the reseller dashboard. Rotation invalidates the
        previous secret immediately. Update your environment variables before deploying.
      </p>

      <h2>Session auth (dashboard)</h2>
      <p>
        The web app uses NextAuth (Google, GitHub, or email/password) for human users accessing the
        reseller or admin dashboards. That is separate from the REST API — use API keys for
        machine-to-machine integration.
      </p>

      <h2>Failed authentication</h2>
      <p>Typical responses:</p>
      <ul>
        <li>
          <code>401</code> — missing key, invalid key, or invalid secret
        </li>
        <li>
          <code>429</code> — usage limit exceeded for your plan (see{" "}
          <Link href="/docs/limits">Plans & limits</Link>)
        </li>
      </ul>
      <CodeBlock
        title="401 example"
        language="json"
        code={`{ "error": "Invalid API key" }`}
      />
    </>
  );
}
