import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["backlog", "today", "in_progress", "waiting_client", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.status === "done" && !data.completedAt) {
      updateData.completedAt = new Date();
    }

    const [updated] = await db.update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.studioId, session.studioId || "")))
      .returning();

    if (!updated) return apiError("Tarefa não encontrada", 404);

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [deleted] = await db.delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.studioId, session.studioId || "")))
      .returning();

    if (!deleted) return apiError("Tarefa não encontrada", 404);

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
