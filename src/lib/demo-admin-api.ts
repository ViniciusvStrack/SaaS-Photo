import { clearConversation, processMessage } from "@/lib/ai/conversation-engine";

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
  { id: "studio-1", name: "Studio Lumière", slug: "studio-lumiere", city: "São Paulo, SP", planId: "completo", storageUsedMb: 46200, storageLimitMb: 1024000, createdAt: "2026-01-10T10:00:00Z" },
  { id: "studio-2", name: "Olhar Autoral", slug: "olhar-autoral", city: "Curitiba, PR", planId: "completo", storageUsedMb: 12800, storageLimitMb: 1024000, createdAt: "2026-03-22T10:00:00Z" },
];

const auditLogs = [
  { id: "log-1", action: "login", entity: "user", userId: "demo-owner", createdAt: now.toISOString() },
  { id: "log-2", action: "created", entity: "studio", entityId: "studio-2", userId: "demo-owner", createdAt: new Date(now.getTime() - 3600000).toISOString() },
];

const clients = [
  { id: "client-1", name: "Marina Oliveira", email: "marina@example.com", phone: "(11) 99999-1001", city: "São Paulo, SP", type: "Casamento", status: "active", tags: ["premium"] },
  { id: "client-2", name: "Lucas Martins", email: "lucas@example.com", phone: "(41) 99999-1002", city: "Curitiba, PR", type: "Corporativo", status: "lead", tags: ["novo"] },
];
const shoots = [
  { id: "shoot-1", name: "Casamento Marina & Rafael", clientId: "client-1", clientName: "Marina Oliveira", type: "Casamento", date: new Date(now.getTime() + 86400000 * 5).toISOString(), startTime: "15:00", location: "Villa Bisutti", value: 890000, status: "confirmed" },
  { id: "shoot-2", name: "Retratos corporativos", clientId: "client-2", clientName: "Lucas Martins", type: "Corporativo", date: new Date(now.getTime() + 86400000 * 12).toISOString(), startTime: "09:00", location: "Studio Lumière", value: 240000, status: "lead" },
];
const tasks = [
  { id: "task-1", title: "Selecionar prévias do casamento", status: "in_progress", priority: "high", dueDate: new Date(now.getTime() + 86400000).toISOString(), clientId: "client-1", clientName: "Marina Oliveira" },
  { id: "task-2", title: "Confirmar locação do ensaio", status: "backlog", priority: "medium", dueDate: new Date(now.getTime() + 86400000 * 3).toISOString(), clientId: "client-2", clientName: "Lucas Martins" },
];
const galleries = [
  { id: "gallery-1", name: "Prévia — Marina & Rafael", clientId: "client-1", clientName: "Marina Oliveira", shootId: "shoot-1", status: "published", photoCount: 86, viewCount: 24, createdAt: "2026-07-18T10:00:00Z" },
];
const photos = [
  { id: "photo-1", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80", filename: "casamento-01.jpg", galleryId: "gallery-1", isPortfolio: true, tags: ["casamento"] },
  { id: "photo-2", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", filename: "casamento-02.jpg", galleryId: "gallery-1", isPortfolio: true, tags: ["cerimônia"] },
];
const proposals = [{ id: "proposal-1", clientName: "Marina Oliveira", service: "Cobertura de casamento", total: 890000, status: "sent", validUntil: "2026-09-30T10:00:00Z", createdAt: "2026-08-01T10:00:00Z", items: [{ id: "item-1", description: "Cobertura fotográfica", quantity: 1, unitPrice: 890000 }] }];
const contracts = [{ id: "contract-1", clientName: "Marina Oliveira", title: "Contrato de cobertura fotográfica", service: "Casamento", value: 890000, status: "sent", terms: "Cobertura fotográfica do evento conforme proposta aprovada.", createdAt: "2026-08-02T10:00:00Z" }];
const invoices = [{ id: "invoice-1", clientName: "Marina Oliveira", description: "Entrada — cobertura de casamento", total: 267000, status: "pending", dueDate: "2026-09-10T10:00:00Z" }];
const notifications = [{ id: "notification-1", title: "Nova galeria publicada", message: "Sua prévia já está disponível.", createdAt: now.toISOString(), isRead: false }];
const messages = [{ id: "message-1", clientName: "Marina Oliveira", clientEmail: "marina@example.com", subject: "Escolha das fotografias", content: "Olá! Quando posso enviar minha seleção?", type: "question", isRead: false, createdAt: now.toISOString() }];
const automations = [{ id: "automation-1", name: "Lembrete de sessão", trigger: "shoot_reminder", channel: "email", message: "Lembrete automático enviado 24 horas antes.", isActive: true, triggerCount: 42 }];
const blog = [{ id: "post-1", title: "Como se preparar para seu ensaio", slug: "como-se-preparar", excerpt: "Dicas para aproveitar cada momento.", content: "Conteúdo demonstrativo", category: "Dicas", tags: ["ensaio"], status: "published", publishedAt: "2026-07-12T10:00:00Z", createdAt: "2026-07-10T10:00:00Z" }];
const analytics = { clients: { total: 128, new: 14 }, shoots: { total: 42, byStatus: { lead: 8, confirmed: 17, completed: 17 } }, galleries: { total: 31 }, revenue: { paid: 4820000, pending: 1260000, overdue: 185000, byMonth: metrics.revenue.byMonth }, tasks: { byStatus: { backlog: 7, in_progress: 4, done: 23 } }, proposals: { conversionRate: 68 } };

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
    if (!url.pathname.startsWith("/api/")) return originalFetch!(input, init);

    if (url.pathname === "/api/admin/metrics") return response(metrics);
    if (url.pathname === "/api/admin/users") return response(users);
    if (url.pathname === "/api/admin/studios") return response(studios);
    if (url.pathname === "/api/admin/audit-logs") return response(auditLogs);
    if (url.pathname.startsWith("/api/admin/users/") && init?.method === "PATCH") {
      return response({ updated: true });
    }
    if (url.pathname === "/api/auth/me") return response({ user: { name: "Usuário Demo", email: "demo@noirframe.com", role: "photographer" }, studio: { name: "Studio Lumière", slug: "studio-lumiere", city: "São Paulo, SP", plan: "pro", brandColor: "#c9a96e" } });
    if (url.pathname === "/api/analytics" || url.pathname === "/api/dashboard") return response(analytics);
    if (url.pathname === "/api/clients") return response(clients);
    if (url.pathname === "/api/shoots") return response(shoots);
    if (url.pathname === "/api/tasks") return response(tasks);
    if (url.pathname === "/api/galleries") return response(galleries);
    if (url.pathname === "/api/photos") return response(photos);
    if (url.pathname === "/api/proposals") return response(proposals);
    if (url.pathname === "/api/contracts") return response(contracts);
    if (url.pathname === "/api/invoices") return response(invoices);
    if (url.pathname === "/api/notifications") return response(notifications);
    if (url.pathname === "/api/messages") return response(messages);
    if (url.pathname.startsWith("/api/messages/")) return response({ message: messages[0], replies: [] });
    if (url.pathname === "/api/automations") return response(automations);
    if (url.pathname === "/api/blog") return response(blog);
    if (url.pathname === "/api/client/dashboard") return response({ galleries, pendingProposals: proposals, pendingContracts: contracts, pendingInvoices: invoices, notifications, unreadNotifications: 1 });
    if (url.pathname === "/api/client/galleries") return response(galleries);
    if (url.pathname.startsWith("/api/client/galleries/")) return response({ gallery: galleries[0], photos });
    if (url.pathname === "/api/client/proposals") return response(proposals);
    if (url.pathname === "/api/client/contracts") return response(contracts);
    if (url.pathname === "/api/assistant/parse") return response({ summary: "Solicitação analisada no modo demonstração.", confidence: 0.94, suggestedActions: [], warnings: [], missingFields: [] });
    if (url.pathname === "/api/assistant/conversation" && init?.method === "POST") {
      const body = init.body ? JSON.parse(String(init.body)) as { text?: string; action?: string } : {};
      if (body.action === "clear") {
        clearConversation("demo-session");
        return response({ message: "Conversa limpa!", cleared: true });
      }
      if (!body.text?.trim()) {
        return Promise.resolve(new Response(JSON.stringify({ success: false, error: "Texto obrigatório" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }));
      }
      const result = processMessage("demo-session", body.text);
      return response({
        message: result.message,
        action: result.action,
        event: result.state.event,
        step: result.state.step,
        suggestedActions: result.suggestedActions || [],
        historyLength: result.state.history.length,
        confidence: result.state.event.confidence,
      });
    }
    if (url.pathname === "/api/assistant/execute" && init?.method === "POST") {
      const body = init.body ? JSON.parse(String(init.body)) as { actions?: unknown[] } : {};
      const total = body.actions?.length || 0;
      clearConversation("demo-session");
      return response({
        results: (body.actions || []).map((_, index) => ({ type: "demo", success: true, id: `demo-ai-${index + 1}` })),
        summary: { total, success: total, failed: 0, message: `✅ ${total} ${total === 1 ? "ação executada" : "ações executadas"} no modo demonstração!` },
      });
    }

    // Mutations stay interactive in demo mode without reaching an unavailable backend.
    if (init?.method && init.method !== "GET") return response({ id: `demo-${Date.now()}`, updated: true });
    return response([]);
  }) as typeof window.fetch;
}

export function uninstallDemoAdminApi() {
  if (typeof window !== "undefined" && originalFetch) window.fetch = originalFetch;
  originalFetch = null;
}

const demoUserIds = new Set(["user-admin", "user-photographer", "user-client", "local-owner"]);

export function ensureDemoApiForUser(userId?: string | null) {
  if (userId && demoUserIds.has(userId)) installDemoAdminApi();
}
