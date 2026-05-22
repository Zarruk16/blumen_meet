export async function generateSummary(roomId, body = {}) {
  const res = await fetch(`/api/meetings/${roomId}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to generate summary");
  return data;
}

export async function getSummary(roomId) {
  const res = await fetch(`/api/meetings/${roomId}/summary`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load summary");
  return data.summary ?? data;
}
