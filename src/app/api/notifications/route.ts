import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams } from "@/lib/api-utils";

// GET /api/notifications - List notifications for current user
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { page, pageSize } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const [countResult] = await db
      .select({ total: count() })
      .from(notifications)
      .where(eq(notifications.userId, user.userId));

    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get unread count
    const [unreadResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.userId), eq(notifications.isRead, false)));

    return apiSuccess({
      notifications: data,
      pagination: {
        total: countResult?.total || 0,
        page,
        pageSize,
        totalPages: Math.ceil((countResult?.total || 0) / pageSize),
      },
      unreadCount: unreadResult?.count || 0,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar notificações", 500);
  }
}

// POST /api/notifications - Mark all as read
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, user.userId));

    return apiSuccess({ message: "Todas as notificações foram marcadas como lidas" });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao marcar notificações como lidas", 500);
  }
}
