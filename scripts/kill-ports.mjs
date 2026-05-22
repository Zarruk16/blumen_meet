import { execSync } from "child_process";

const ports = [3000, 3001, 3002, 3003];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);

    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`Stopped PID ${pid} (port ${port})`);
      } catch {
        console.warn(`Could not kill PID ${pid}`);
      }
    }
  } catch {
    // port free
  }
}

console.log("Ports 3000–3003 cleared.");
