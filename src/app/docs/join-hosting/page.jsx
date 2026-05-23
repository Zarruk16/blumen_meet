import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsCallout } from "@/components/docs/DocsCallout";

const base = "https://your-domain.com";

export default function JoinHostingPage() {
  return (
    <>
      <h1>Join & hosting</h1>
      <p className="docs-lead">
        How participants enter meetings, how host privileges work, and how to integrate join links in
        your product.
      </p>

      <h2>Join URL</h2>
      <p>
        When you create a meeting via the API, the response includes <code>joinUrl</code>:
      </p>
      <CodeBlock code={`${base}/join/{roomId}`} />

      <p>Guests open this page, enter their display name, and enter the video room. No API key is required to join.</p>

      <h2>Host key</h2>
      <p>
        The <code>hostKey</code> from the create-meeting response grants host controls: mute
        participants, end meeting for everyone, recording, layout, and more.
      </p>
      <DocsCallout variant="warning" title="Keep hostKey private">
        Pass the host key only to trusted users — via your app&apos;s authenticated session, email,
        or admin UI. Do not append it to public join links.
      </DocsCallout>

      <h2>Recommended integration pattern</h2>
      <ol>
        <li>Your server calls <code>POST /api/v1/meetings</code> and stores <code>roomId</code> + <code>hostKey</code>.</li>
        <li>Send <code>joinUrl</code> to all participants (email, SMS, in-app button).</li>
        <li>
          For the meeting owner, link to join with host privileges — e.g. your app opens{" "}
          <code>{base}/join/[roomId]?hostKey=...</code> only after the user logs into your product
          (if you add host-key query support) or instruct hosts to paste the key on the join screen
          when prompted.
        </li>
      </ol>

      <h2>In-app meetings (Blumen Meet UI)</h2>
      <p>
        Logged-in users can also start meetings from the{" "}
        <Link href="/#workspace">homepage workspace</Link> without the API. Those rooms use the same
        underlying LiveKit infrastructure.
      </p>

      <h2>Video room URL</h2>
      <p>After joining, participants are routed to the meeting experience:</p>
      <CodeBlock code={`${base}/video-meeting/{roomId}`} />

      <h2>Recordings & AI summaries</h2>
      <p>
        Hosts can start cloud recording from the meeting controls (when enabled for your deployment).
        Summaries are available at <code>/meetings/[roomId]/summary</code> for authenticated users
        with access.
      </p>

      <h2>Ending meetings</h2>
      <ul>
        <li>
          <strong>Leave</strong> — host leaves but meeting continues; host role can transfer.
        </li>
        <li>
          <strong>End meeting</strong> — ends the session for everyone and expires the join link.
        </li>
      </ul>
    </>
  );
}
