/**
 * HTTPS on your LAN IP (OpenSSL or mkcert — no Homebrew required).
 */
import { spawn } from "child_process";
import { resolvePort } from "./resolve-port.mjs";
import { getPrimaryLanIp, getLanIPv4Addresses } from "./get-lan-ip.mjs";
import { ensureLocalCertificates, certFile, keyFile } from "./ensure-local-certs.mjs";

const port = resolvePort(3000);
const ip = getPrimaryLanIp();

if (!ip) {
  console.error("No LAN IP found. Connect to Wi‑Fi first.");
  process.exit(1);
}

ensureLocalCertificates(getLanIPv4Addresses());

console.log("\n📱 On your phone (same Wi‑Fi), open:\n");
console.log(`   https://${ip}:${port}`);
console.log(`   https://${ip}:${port}/join/<room-id>\n`);
console.log("   Use https:// (not http://). Trust the certificate if prompted.\n");

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
