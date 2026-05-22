import os from "os";

export function getLanIPv4Addresses() {
  const nets = os.networkInterfaces();
  const addresses = [];

  for (const entries of Object.values(nets)) {
    for (const net of entries || []) {
      const isIPv4 = net.family === "IPv4" || net.family === 4;
      if (isIPv4 && !net.internal && !net.address.startsWith("169.254.")) {
        addresses.push(net.address);
      }
    }
  }

  return [...new Set(addresses)];
}

export function getPrimaryLanIp() {
  const ips = getLanIPv4Addresses();
  return ips.find((ip) => ip.startsWith("192.168.")) || ips[0] || null;
}
