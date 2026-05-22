const backend = () => process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";

export async function startRecording(roomName, { hostUserId, hostName } = {}) {
  const url = backend()
    ? `${backend()}/start-recording`
    : "/api/recordings/start";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, hostUserId, hostName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start recording");
  return data;
}

export async function stopRecording(recordingId, { keepalive = false } = {}) {
  const url = backend()
    ? `${backend()}/stop-recording`
    : "/api/recordings/stop";
  const body = JSON.stringify({ recordingId });

  if (keepalive && typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      url,
      new Blob([body], { type: "application/json" })
    );
    return { recordingId, status: "processing" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to stop recording");
  return data;
}

export async function listMyRecordings(roomName) {
  const params = new URLSearchParams();
  if (roomName) params.set("roomName", roomName);
  const q = params.toString() ? `?${params}` : "";
  const url = backend() ? `${backend()}/recordings${q}` : `/api/recordings${q}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load recordings");
  return data.recordings || [];
}

/** @deprecated use listMyRecordings */
export const listRecordings = listMyRecordings;

export function recordingDownloadUrl(recordingId) {
  return `/api/recordings/${recordingId}/download`;
}
