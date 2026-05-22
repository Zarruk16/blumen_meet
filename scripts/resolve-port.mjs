import { execSync } from "child_process";

export function getPidOnPort(port) {
  try {
    const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
    return out.split("\n").filter(Boolean)[0] || null;
  } catch {
    return null;
  }
}

export function resolvePort(preferred = 3000) {
  const envPort = Number(process.env.PORT);
  if (envPort && !getPidOnPort(envPort)) {
    return envPort;
  }

  let port = preferred;
  for (let i = 0; i < 10; i++) {
    const candidate = preferred + i;
    const pid = getPidOnPort(candidate);
    if (!pid) return candidate;
    if (i === 0) {
      console.warn(
        `\n⚠️  Port ${candidate} is in use (PID ${pid}). Trying next port…`
      );
      console.warn(`   To free it: kill ${pid}\n`);
    }
  }

  throw new Error(`No free port found from ${preferred} to ${preferred + 9}`);
}
