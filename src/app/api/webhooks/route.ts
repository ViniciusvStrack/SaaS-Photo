import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

// Webhook configuration store (in production, use DB)
const webhookStore = new Map<string, WebhookConfig[]>();

interface WebhookConfig {
  id: string;
  studioId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
  failCount: number;
}

const webhookSchema = z.object({
  url: z.string().url("URL inválida"),
  events: z.array(z.enum([
    "client.created",
    "client.updated",
    "shoot.created",
    "shoot.status_changed",
    "gallery.sent",
    "gallery.selection_received",
    "proposal.sent",
    "proposal.accepted",
    "proposal.declined",
    "contract.signed",
    "invoice.created",
    "invoice.paid",
    "invoice.overdue",
    "task.completed",
    "message.received",
  ])).min(1, "Selecione pelo menos um evento"),
});

// GET /api/webhooks — List configured webhooks
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const webhooks = webhookStore.get(user.studioId) || [];

    return apiSuccess({
      webhooks: webhooks.map(w => ({
        ...w,
        secret: w.secret.slice(0, 8) + "..." // Mask secret
      })),
      availableEvents: [
        { event: "client.created", label: "Cliente criado" },
        { event: "client.updated", label: "Cliente atualizado" },
        { event: "shoot.created", label: "Ensaio criado" },
        { event: "shoot.status_changed", label: "Status do ensaio alterado" },
        { event: "gallery.sent", label: "Galeria enviada" },
        { event: "gallery.selection_received", label: "Seleção recebida" },
        { event: "proposal.sent", label: "Proposta enviada" },
        { event: "proposal.accepted", label: "Proposta aceita" },
        { event: "proposal.declined", label: "Proposta recusada" },
        { event: "contract.signed", label: "Contrato assinado" },
        { event: "invoice.created", label: "Fatura criada" },
        { event: "invoice.paid", label: "Pagamento confirmado" },
        { event: "invoice.overdue", label: "Fatura em atraso" },
        { event: "task.completed", label: "Tarefa concluída" },
        { event: "message.received", label: "Mensagem recebida" },
      ],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/webhooks — Create webhook
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const body = await req.json();
    const { url, events } = webhookSchema.parse(body);

    // Generate webhook secret
    const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      studioId: user.studioId,
      url,
      events,
      secret,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
      failCount: 0,
    };

    const existing = webhookStore.get(user.studioId) || [];
    existing.push(webhook);
    webhookStore.set(user.studioId, existing);

    return apiSuccess({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret, // Show full secret only on creation
        isActive: webhook.isActive,
      },
      message: "Webhook criado! Guarde o secret — ele não será mostrado novamente.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ====== Webhook Dispatcher (used internally by other APIs) ======
export async function dispatchWebhook(
  studioId: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = webhookStore.get(studioId) || [];
  const activeWebhooks = webhooks.filter(w => w.isActive && w.events.includes(event));

  for (const webhook of activeWebhooks) {
    try {
      const timestamp = Date.now().toString();
      const body = JSON.stringify({
        event,
        timestamp,
        data: payload,
      });

      // Fire and forget — don't block the main request
      fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NoirFrame-Event": event,
          "X-NoirFrame-Timestamp": timestamp,
          "X-NoirFrame-Signature": webhook.secret,
        },
        body,
        signal: AbortSignal.timeout(5000), // 5s timeout
      }).then(res => {
        webhook.lastTriggeredAt = new Date().toISOString();
        if (!res.ok) webhook.failCount++;
      }).catch(() => {
        webhook.failCount++;
        // Disable after 10 consecutive failures
        if (webhook.failCount >= 10) {
          webhook.isActive = false;
        }
      });
    } catch {
      // Silent fail for webhook dispatch
    }
  }
}
