import { NextRequest } from "next/server";
import { db } from "@/db";
import { messages, messageReplies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiCreated, validateBody, createAuditLog } from "@/lib/api-utils";
import { messageReplySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/messages/[id] - Get message with replies
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [message] = await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.id, id),
        eq(messages.studioId, user.studioId)
      ))
      .limit(1);

    if (!message) {
      return apiError("Mensagem não encontrada", 404);
    }

    // Get replies
    const replies = await db
      .select()
      .from(messageReplies)
      .where(eq(messageReplies.messageId, id))
      .orderBy(messageReplies.createdAt);

    return apiSuccess({
      ...message,
      replies,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar mensagem", 500);
  }
}

// PATCH /api/messages/[id] - Mark as read
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(
        eq(messages.id, id),
        eq(messages.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Mensagem não encontrada", 404);
    }

    const [updated] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar mensagem", 500);
  }
}

// POST /api/messages/[id] - Add reply
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(
        eq(messages.id, id),
        eq(messages.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Mensagem não encontrada", 404);
    }

    const validation = await validateBody(req, messageReplySchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const [reply] = await db
      .insert(messageReplies)
      .values({
        messageId: id,
        content: data.content,
        isFromPhotographer: true,
      })
      .returning();

    // Mark original message as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));

    await createAuditLog(user.userId, user.studioId, "create", "message_reply", reply.id, {}, req);

    return apiCreated(reply);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao responder mensagem", 500);
  }
}
