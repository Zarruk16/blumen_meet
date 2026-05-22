/**
 * Phone testing via Cloudflare Tunnel (works better than localtunnel on hotspot/cellular).
 */
import { spawn } from "child_process";
import { resolvePort } from "./resolve-port.mjs";
import { waitForServer } from "./wait-for-server.mjs";
import { getPrimaryLanIp, getLanIPv4Addresses } from "./get-lan-ip.mjs";

const port = resolvePort(3000);
const localUrl = `http://127.0.0.1:${port}`;

const nextProcess = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  env: process.env,
});

nextProcess.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

nextProcess.on("exit", (code) => {
  if (code && code !== 0) process.exit(code);
});

const lanIp = getPrimaryLanIp();
const hotspotIp = getLanIPv4Addresses().find((ip) => ip.startsWith("172.20.10."));

if (hotspotIp) {
  console.log("\n📶 iPhone hotspot detected — prefer direct URL on your phone:\n");
  console.log(`   http://${hotspotIp}:${port}/join/<room-id>`);
  console.log("   (For camera/mic use: npm run dev:phone:hotspot)\n");
} else if (lanIp) {
  console.log(`\n📡 LAN: http://${lanIp}:${port}\n`);
}

async function startTunnel() {
  const ready = await waitForServer(localUrl);
  if (!ready) {
    console.error("\n❌ Next.js did not start. Check errors above.\n");
    process.exit(1);
  }

  console.log("Starting Cloudflare tunnel (HTTPS for your phone)…\n");

  const tunnelProcess = spawn(
    "npx",
    ["cloudflared", "tunnel", "--url", localUrl, "--no-autoupdate"],
    { stdio: ["ignore", "pipe", "inherit"], env: process.env }
  );

  tunnelProcess.stdout?.on("data", (chunk) => {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (match) {
      const url = match[0];
      console.log("\n📱 Open on your phone:\n");
      console.log(`   ${url}`);
      console.log(`   ${url}/join/<room-id>\n`);
      console.log("   Google login — add this redirect URI in Google Cloud Console:\n");
      console.log(`   ${url}/api/auth/callback/google\n`);
      console.log("   (Google blocks sign-in on private IPs like 172.20.10.x)\n");
    }
    process.stdout.write(chunk);
  });

  tunnelProcess.on("error", (err) => {
    console.error("Tunnel failed:", err.message);
    console.error("\nOn hotspot, try instead: npm run dev:phone:hotspot\n");
    process.exit(1);
  });

  tunnelProcess.on("exit", (code) => {
    if (code) process.exit(code);
  });

  process.on("SIGINT", () => {
    tunnelProcess.kill("SIGTERM");
    nextProcess.kill("SIGTERM");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    tunnelProcess.kill("SIGTERM");
    nextProcess.kill("SIGTERM");
    process.exit(0);
  });
}

startTunnel().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
