import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const [existing] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.userId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Notificação não encontrada", 404);
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar notificação", 500);
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const [existing] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.id, id),
        eq(notifications.userId, user.userId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Notificação não encontrada", 404);
    }

    await db.delete(notifications).where(eq(notifications.id, id));

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir notificação", 500);
  }
}
