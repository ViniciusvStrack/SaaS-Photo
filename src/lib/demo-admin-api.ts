const now = new Date();
const month = (offset: number) => {
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
};

const metrics = {
  users: { total: 1284, active: 1196, new30d: 84, byRole: { admin: 4, photographer: 312, client: 968 } },
  studios: { total: 312 },
  clients: { total: 968 },
  shoots: { total: 2471 },
  revenue: {
    total: 18942000,
    paid: 16478000,
    pending: 1976000,
    overdue: 488000,
    byMonth: [-5, -4, -3, -2, -1, 0].map((offset, index) => ({
      month: month(offset),
      total: 2100000 + index * 238000,
      paid: 1870000 + index * 221000,
    })),
  },
};

const users = [
  { id: "demo-owner", name: "Vinicius Strack", email: "viniciuvstrack@gmail.com", role: "admin", isActive: true, createdAt: "2026-01-12T10:00:00Z" },
  { id: "demo-photographer", name: "Ana Luísa Rodrigues", email: "ana@studiolumiere.com", role: "photographer", isActive: true, createdAt: "2026-02-03T10:00:00Z" },
  { id: "demo-client", name: "Marina Oliveira", email: "marina@example.com", role: "client", isActive: true, createdAt: "2026-03-18T10:00:00Z" },
];

const studios = [
  { id: "studio-1", name: "Studio Lumière", slug: "studio-lumiere", city: "São Paulo, SP", planId: "pro", storageUsedMb: 46200, storageLimitMb: 204800, createdAt: "2026-01-10T10:00:00Z" },
  { id: "studio-2", name: "Olhar Autoral", slug: "olhar-autoral", city: "Curitiba, PR", planId: "starter", storageUsedMb: 12800, storageLimitMb: 51200, createdAt: "2026-03-22T10:00:00Z" },
];

const auditLogs = [
  { id: "log-1", action: "login", entity: "user", userId: "demo-owner", createdAt: now.toISOString() },
  { id: "log-2", action: "created", entity: "studio", entityId: "studio-2", userId: "demo-owner", createdAt: new Date(now.getTime() - 3600000).toISOString() },
];

let originalFetch: typeof window.fetch | null = null;

function response(data: unknown) {
  return Promise.resolve(new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));
}

export function installDemoAdminApi() {
  if (typeof window === "undefined" || originalFetch) return;
  originalFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(rawUrl, window.location.origin);
    if (!url.pathname.startsWith("/api/admin/")) return originalFetch!(input, init);

    if (url.pathname === "/api/admin/metrics") return response(metrics);
    if (url.pathname === "/api/admin/users") return response(users);
    if (url.pathname === "/api/admin/studios") return response(studios);
    if (url.pathname === "/api/admin/audit-logs") return response(auditLogs);
    if (url.pathname.startsWith("/api/admin/users/") && init?.method === "PATCH") {
      return response({ updated: true });
    }

    return response([]);
  }) as typeof window.fetch;
}

export function uninstallDemoAdminApi() {
  if (typeof window !== "undefined" && originalFetch) window.fetch = originalFetch;
  originalFetch = null;
}
