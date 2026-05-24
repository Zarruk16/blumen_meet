import { NextResponse } from "next/server";
import { ANDROID_PACKAGE, DEFAULT_HOST } from "@/lib/appLinks";

/** EAS preview/production keystore for @zarruk/blumen-meet (update if keystore rotates). */
const DEFAULT_EAS_SHA256 =
  "46:8c:e3:a6:9f:7a:42:b3:c7:63:12:80:a1:4d:24:ae:dc:bf:43:28:fa:44:b8:aa:d1:20:a0:47:9a:2a:16:28";

/** Colon-separated SHA-256 cert fingerprints (EAS / Play signing). Comma-separated for multiple. */
function getSha256Fingerprints() {
  const raw = process.env.ANDROID_APP_LINK_SHA256 || DEFAULT_EAS_SHA256;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const fingerprints = getSha256Fingerprints();
  const host =
    process.env.NEXT_PUBLIC_APP_LINK_HOST ||
    (process.env.VERCEL_URL ? process.env.VERCEL_URL.replace(/^https?:\/\//, "") : null) ||
    DEFAULT_HOST;

  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "X-Blumen-App-Link-Host": host,
    },
  });
}
