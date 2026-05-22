import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const certDir = "certificates";
export const certFile = `${certDir}/localhost.pem`;
export const keyFile = `${certDir}/localhost-key.pem`;

function hasMkcert() {
  try {
    execSync("mkcert -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasOpenSsl() {
  try {
    execSync("openssl version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function ensureWithMkcert(ips) {
  if (!existsSync(certDir)) mkdirSync(certDir, { recursive: true });
  try {
    execSync("mkcert -install", { stdio: "inherit" });
  } catch {
    /* may already be installed */
  }
  const hosts = ["localhost", "127.0.0.1", "::1", ...ips].join(" ");
  execSync(
    `mkcert -key-file "${keyFile}" -cert-file "${certFile}" ${hosts}`,
    { stdio: "inherit" }
  );
}

function ensureWithOpenSsl(ips) {
  if (!existsSync(certDir)) mkdirSync(certDir, { recursive: true });

  const san = ["DNS:localhost", "IP:127.0.0.1", ...ips.map((ip) => `IP:${ip}`)].join(",");

  const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
${ips.map((ip, i) => `IP.${i + 2} = ${ip}`).join("\n")}
`;

  const configPath = `${certDir}/openssl.cnf`;
  writeFileSync(configPath, opensslConfig.trim());

  execSync(
    `openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes ` +
      `-keyout "${keyFile}" -out "${certFile}" ` +
      `-config "${configPath}" -extensions v3_req`,
    { stdio: "inherit" }
  );

  console.log("   (Self-signed cert via OpenSSL — tap through warning on iPhone)\n");
}

/**
 * Create HTTPS certs for localhost + LAN/hotspot IPs. No Homebrew required.
 */
export function ensureLocalCertificates(ips) {
  if (hasMkcert()) {
    console.log("Using mkcert for local HTTPS…\n");
    ensureWithMkcert(ips);
    return;
  }

  if (hasOpenSsl()) {
    console.log("Using OpenSSL for local HTTPS (built into macOS)…\n");
    ensureWithOpenSsl(ips);
    return;
  }

  throw new Error("Neither mkcert nor openssl found. Cannot create HTTPS certificates.");
}
