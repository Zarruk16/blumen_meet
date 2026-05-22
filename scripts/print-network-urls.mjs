import { getLanIPv4Addresses } from "./get-lan-ip.mjs";

const PORT = process.env.PORT || "3000";
const protocol = process.env.USE_HTTPS === "1" ? "https" : "http";
const ips = getLanIPv4Addresses();

console.log("\n📱 LAN URLs (same Wi‑Fi)\n");

if (ips.length === 0) {
  console.log("  Could not detect a LAN IP. Check Wi‑Fi is connected.\n");
} else {
  ips.forEach((ip) => {
    console.log(`  ${protocol}://${ip}:${PORT}`);
    console.log(`  ${protocol}://${ip}:${PORT}/join/<room-id>\n`);
  });
}

console.log("  For phone camera/mic, run: npm run dev:phone\n");
