import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients, shoots, invoices, tasks, notifications } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, createAuditLog } from "@/lib/api-utils";
import { clearConversation } from "@/lib/ai/conversation-engine";

const executeSchema = z.object({
  actions: z.array(z.object({
    type: z.enum(["create_client", "create_shoot", "create_invoice", "create_task"]),
    data: z.record(z.string(), z.unknown()),
  })),
});

// POST /api/assistant/execute - Execute suggested actions from AI conversation
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const body = await req.json();
    const { actions } = executeSchema.parse(body);

    const results: { type: string; success: boolean; id?: string; error?: string }[] = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case "create_client": {
            const data = action.data as { name: string; email?: string; phone?: string; status?: string; type?: string };
            
            // Check if client already exists
            const existing = await db.select({ id: clients.id })
              .from(clients)
              .where(and(
                eq(clients.studioId, studioId),
                eq(clients.name, data.name),
                isNull(clients.deletedAt)
              ))
              .limit(1);

            if (existing.length > 0) {
              results.push({ type: "create_client", success: true, id: existing[0].id, error: "Cliente já existente (ignorado)" });
              continue;
            }

            const [client] = await db.insert(clients).values({
              studioId,
              name: data.name,
              email: (data.email as string) || null,
              phone: (data.phone as string) || null,
              status: (data.status as string) || "lead",
              type: (data.type as string) || null,
            }).returning();

            await createAuditLog(user.userId, studioId, "create", "client", client.id, { source: "ai_assistant" }, req);
            results.push({ type: "create_client", success: true, id: client.id });

            // Create notification
            await db.insert(notifications).values({
              userId: user.userId,
              type: "success",
              title: "Cliente criado via Assistente",
              message: `${data.name} foi adicionado(a) como cliente`,
              link: "/app/clients",
            });
            break;
          }

          case "create_shoot": {
            const data = action.data as {
              name: string; clientName?: string; clientId?: string; type?: string;
              date?: string; time?: string; location?: string; value?: number;
              packageName?: string; notes?: string; status?: string;
            };

            // Try to find client by name if clientId not provided
            let clientId = data.clientId || null;
            if (!clientId && data.clientName) {
              const [found] = await db.select({ id: clients.id })
                .from(clients)
                .where(and(
                  eq(clients.studioId, studioId),
                  eq(clients.name, data.clientName),
                  isNull(clients.deletedAt)
                ))
                .limit(1);
              if (found) clientId = found.id;
            }

            const [shoot] = await db.insert(shoots).values({
              studioId,
              clientId,
              clientName: data.clientName || null,
              name: data.name,
              type: data.type || null,
              date: data.date || null,
              time: data.time || null,
              location: data.location || null,
              value: data.value ? Math.round(data.value) : 0,
              packageName: data.packageName || null,
              notes: data.notes || null,
              status: (data.status as "confirmed") || "confirmed",
            }).returning();

            await createAuditLog(user.userId, studioId, "create", "shoot", shoot.id, { source: "ai_assistant" }, req);
            results.push({ type: "create_shoot", success: true, id: shoot.id });

            // Create notification
            await db.insert(notifications).values({
              userId: user.userId,
              type: "success",
              title: "Ensaio criado via Assistente",
              message: `${data.name} agendado${data.date ? ` para ${data.date}` : ""}`,
              link: "/app/shoots",
            });
            break;
          }

          case "create_invoice": {
            const data = action.data as {
              clientName?: string; clientId?: string; description: string;
              amount: number; dueDate?: string; status?: string;
            };

            // Try to find client by name
            let clientId = data.clientId || null;
            if (!clientId && data.clientName) {
              const [found] = await db.select({ id: clients.id })
                .from(clients)
                .where(and(
                  eq(clients.studioId, studioId),
                  eq(clients.name, data.clientName),
                  isNull(clients.deletedAt)
                ))
                .limit(1);
              if (found) clientId = found.id;
            }

            const [invoice] = await db.insert(invoices).values({
              studioId,
              clientId,
              clientName: data.clientName || null,
              description: data.description,
              total: data.amount ? Math.round(data.amount) : 0,
              dueDate: data.dueDate || new Date().toISOString().split("T")[0],
              status: (data.status as "pending") || "pending",
              paidAt: data.status === "paid" ? new Date() : null,
            }).returning();

            await createAuditLog(user.userId, studioId, "create", "invoice", invoice.id, { source: "ai_assistant" }, req);
            results.push({ type: "create_invoice", success: true, id: invoice.id });
            break;
          }

          case "create_task": {
            const data = action.data as {
              title: string; description?: string; priority?: string; dueDate?: string;
            };

            const [task] = await db.insert(tasks).values({
              studioId,
              title: data.title,
              description: data.description || null,
              status: "today",
              priority: (data.priority as "medium") || "medium",
              dueDate: data.dueDate || null,
            }).returning();

            await createAuditLog(user.userId, studioId, "create", "task", task.id, { source: "ai_assistant" }, req);
            results.push({ type: "create_task", success: true, id: task.id });
            break;
          }
        }
      } catch (error) {
        results.push({
          type: action.type,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    // Clear conversation after execution
    clearConversation(user.userId);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return apiSuccess({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount,
        message: failCount === 0
          ? `✅ ${successCount} ações executadas com sucesso!`
          : `⚠️ ${successCount} sucesso, ${failCount} erro(s)`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
