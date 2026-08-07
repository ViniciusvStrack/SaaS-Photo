import { NextRequest } from "next/server";
import { db } from "@/db";
import { messages, messageReplies } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { messageSchema } from "@/lib/validations";

// GET /api/messages - List messages
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const [countResult] = await db
      .select({ total: count() })
      .from(messages)
      .where(eq(messages.studioId, user.studioId));

    const data = await db
      .select()
      .from(messages)
      .where(eq(messages.studioId, user.studioId))
      .orderBy(desc(messages.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar mensagens", 500);
  }
}

// POST /api/messages - Create message (for testing/internal use)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, messageSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const [message] = await db
      .insert(messages)
      .values({
        studioId: user.studioId,
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        clientEmail: data.clientEmail || null,
        subject: data.subject || null,
        content: data.content,
        type: data.type || "general",
        galleryId: data.galleryId || null,
      })
      .returning();

    await createAuditLog(user.userId, user.studioId, "create", "message", message.id, {}, req);

    return apiCreated(message);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao criar mensagem", 500);
  }
}
