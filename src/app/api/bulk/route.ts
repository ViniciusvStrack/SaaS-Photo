import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients, shoots, invoices, tasks, galleries, notifications } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, createAuditLog } from "@/lib/api-utils";

const bulkSchema = z.object({
  entity: z.enum(["clients", "shoots", "invoices", "tasks", "galleries"]),
  action: z.enum(["update_status", "delete", "archive"]),
  ids: z.array(z.string()).min(1, "Selecione pelo menos um item").max(100, "Máximo 100 itens por vez"),
  data: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/bulk - Bulk actions on entities
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const body = await req.json();
    const { entity, action, ids, data } = bulkSchema.parse(body);

    let affected = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        switch (entity) {
          case "clients": {
            if (action === "update_status" && data?.status) {
              await db.update(clients).set({
                status: data.status as string,
                updatedAt: new Date(),
              }).where(and(eq(clients.id, id), eq(clients.studioId, studioId)));
              affected++;
            } else if (action === "delete") {
              await db.update(clients).set({ deletedAt: new Date() })
                .where(and(eq(clients.id, id), eq(clients.studioId, studioId)));
              affected++;
            }
            break;
          }
          case "shoots": {
            if (action === "update_status" && data?.status) {
              await db.update(shoots).set({
                status: data.status as "lead" | "confirmed" | "photographed" | "editing" | "delivered" | "paid" | "cancelled",
                updatedAt: new Date(),
              }).where(and(eq(shoots.id, id), eq(shoots.studioId, studioId)));
              affected++;
            } else if (action === "delete") {
              await db.update(shoots).set({ deletedAt: new Date() })
                .where(and(eq(shoots.id, id), eq(shoots.studioId, studioId)));
              affected++;
            }
            break;
          }
          case "invoices": {
            if (action === "update_status" && data?.status) {
              const updateData: Record<string, unknown> = {
                status: data.status as string,
                updatedAt: new Date(),
              };
              if (data.status === "paid") {
                updateData.paidAt = new Date();
              }
              await db.update(invoices).set(updateData)
                .where(and(eq(invoices.id, id), eq(invoices.studioId, studioId)));
              affected++;
            }
            break;
          }
          case "tasks": {
            if (action === "update_status" && data?.status) {
              const updateData: Record<string, unknown> = {
                status: data.status as string,
                updatedAt: new Date(),
              };
              if (data.status === "done") {
                updateData.completedAt = new Date();
              }
              await db.update(tasks).set(updateData)
                .where(and(eq(tasks.id, id), eq(tasks.studioId, studioId)));
              affected++;
            } else if (action === "delete") {
              await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.studioId, studioId)));
              affected++;
            }
            break;
          }
          case "galleries": {
            if (action === "update_status" && data?.status) {
              await db.update(galleries).set({
                status: data.status as "draft" | "sent" | "viewed" | "selection_received" | "delivered",
                updatedAt: new Date(),
              }).where(and(eq(galleries.id, id), eq(galleries.studioId, studioId)));
              affected++;
            } else if (action === "delete") {
              await db.update(galleries).set({ deletedAt: new Date() })
                .where(and(eq(galleries.id, id), eq(galleries.studioId, studioId)));
              affected++;
            }
            break;
          }
        }
      } catch (err) {
        errors.push(`${id}: ${(err as Error).message}`);
      }
    }

    await createAuditLog(user.userId, studioId, "update", entity, "bulk", {
      action, count: affected, ids: ids.slice(0, 10),
    }, req);

    // Create notification
    const entityLabels: Record<string, string> = {
      clients: "clientes", shoots: "ensaios", invoices: "faturas",
      tasks: "tarefas", galleries: "galerias",
    };
    const actionLabels: Record<string, string> = {
      update_status: "atualizados", delete: "excluídos", archive: "arquivados",
    };

    await db.insert(notifications).values({
      userId: user.userId,
      type: "success",
      title: `Ação em lote concluída`,
      message: `${affected} ${entityLabels[entity] || entity} ${actionLabels[action] || action}`,
      link: `/app/${entity}`,
    });

    return apiSuccess({
      affected,
      total: ids.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${affected} de ${ids.length} ${entityLabels[entity]} ${actionLabels[action]}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
