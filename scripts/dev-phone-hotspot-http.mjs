/**
 * Hotspot HTTP only — pages load on phone; camera/mic blocked until HTTPS.
 */
import { spawn } from "child_process";
import { resolvePort } from "./resolve-port.mjs";
import { getLanIPv4Addresses } from "./get-lan-ip.mjs";

const port = resolvePort(3000);
const ips = getLanIPv4Addresses();
const hotspotIp = ips.find((ip) => ip.startsWith("172.20.10.")) || ips[0];

if (!hotspotIp) {
  console.error("No hotspot/LAN IP found.");
  process.exit(1);
}

const base = `http://${hotspotIp}:${port}`;

console.log("\n📶 Hotspot HTTP:\n");
console.log(`   ${base}/join/<room-id>\n`);
console.log("   ⚠️  Google login will NOT work over HTTP on a LAN IP.");
console.log("   Use npm run dev:phone:hotspot (HTTPS) for sign-in, or /join without login.\n");

spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  env: process.env,
});
