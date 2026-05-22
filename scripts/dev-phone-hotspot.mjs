/**
 * iPhone Personal Hotspot: direct https://172.20.10.x — no Homebrew/mkcert required.
 */
import { spawn } from "child_process";
import { resolvePort } from "./resolve-port.mjs";
import { getLanIPv4Addresses } from "./get-lan-ip.mjs";
import { ensureLocalCertificates, certFile, keyFile } from "./ensure-local-certs.mjs";

const port = resolvePort(3000);
const ips = getLanIPv4Addresses();
const hotspotIp = ips.find((ip) => ip.startsWith("172.20.10.")) || ips[0];

if (!hotspotIp) {
  console.error("No hotspot/LAN IP found. Turn on iPhone Personal Hotspot first.");
  process.exit(1);
}

try {
  ensureLocalCertificates(ips);
} catch (err) {
  console.error(err.message);
  console.error("\nFallback: npm run dev:phone:hotspot:http (no camera on phone)\n");
  process.exit(1);
}

const base = `https://${hotspotIp}:${port}`;

console.log("\n📶 iPhone hotspot — open on your phone:\n");
console.log(`   ${base}`);
console.log(`   ${base}/join/<room-id>\n`);
console.log("   Use https:// (not http). Accept the certificate warning once.\n");
console.log("   ⚠️  Google login does NOT work on 172.20.10.x (Google policy).");
console.log("   For Google sign-in on phone: npm run dev:phone");
console.log("   For meetings without login: use /join/<room-id> on the URL above.\n");

const nextProcess = spawn(
  "npx",
  [
    "next",
    "dev",
    "-H",
    "0.0.0.0",
    "-p",
    String(port),
    "--experimental-https",
    "--experimental-https-key",
    keyFile,
    "--experimental-https-cert",
    certFile,
  ],
  { stdio: "inherit", env: process.env }
);

nextProcess.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGINT", () => {
  nextProcess.kill("SIGTERM");
  process.exit(0);
});
