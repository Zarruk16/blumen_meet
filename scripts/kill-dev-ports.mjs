import { execSync } from "child_process";

const ports = [3000, 3001, 3002];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);

    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`Stopped PID ${pid} on port ${port}`);
      } catch {
        // already gone
      }
    }
  } catch {
    // no process on this port
  }
}

try {
  execSync('pkill -f "next dev" 2>/dev/null || true', { shell: true, stdio: "ignore" });
} catch {
  /* ignore */
}

console.log("Ports 3000–3002 cleared.");
