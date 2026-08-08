import { NextRequest } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/messages/unread - Get unread message count
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(
        eq(messages.studioId, user.studioId),
        eq(messages.isRead, false)
      ));

    return apiSuccess({ unreadCount: result?.count || 0 });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar contagem", 500);
  }
}
