async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const adminApi = {
  stats: () => fetchJson("/api/admin/stats"),
  resellers: () => fetchJson("/api/admin/resellers"),
  createReseller: (body) =>
    fetchJson("/api/admin/resellers", { method: "POST", body: JSON.stringify(body) }),
  updateReseller: (id, body) =>
    fetchJson(`/api/admin/resellers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  meetings: () => fetchJson("/api/admin/meetings"),
  recordings: () => fetchJson("/api/admin/recordings"),
  apiLogs: () => fetchJson("/api/admin/api-logs"),
  subscriptions: () => fetchJson("/api/admin/subscriptions"),
  platformConfig: () => fetchJson("/api/admin/platform-config"),
};

export const resellerApi = {
  stats: () => fetchJson("/api/reseller/stats"),
  me: () => fetchJson("/api/reseller/me"),
  customers: () => fetchJson("/api/reseller/customers"),
  createCustomer: (body) =>
    fetchJson("/api/reseller/customers", { method: "POST", body: JSON.stringify(body) }),
  meetings: () => fetchJson("/api/reseller/meetings"),
  recordings: () => fetchJson("/api/reseller/recordings"),
  rotateKeys: () => fetchJson("/api/reseller/keys/rotate", { method: "POST" }),
  register: (body) =>
    fetchJson("/api/saas/auth/register", { method: "POST", body: JSON.stringify(body) }),
  initializePaystack: (plan) =>
    fetchJson("/api/billing/paystack/initialize", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  verifyPaystack: (reference) =>
    fetchJson(`/api/billing/paystack/verify?reference=${encodeURIComponent(reference)}`),
};
