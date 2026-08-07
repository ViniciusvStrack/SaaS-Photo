import { NextRequest } from "next/server";
import { db } from "@/db";
import { automations } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { automationUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/automations/[id] - Get automation details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [automation] = await db
      .select()
      .from(automations)
      .where(and(
        eq(automations.id, id),
        eq(automations.studioId, user.studioId)
      ))
      .limit(1);

    if (!automation) {
      return apiError("Automação não encontrada", 404);
    }

    return apiSuccess(automation);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar automação", 500);
  }
}

// PATCH /api/automations/[id] - Update automation
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: automations.id })
      .from(automations)
      .where(and(
        eq(automations.id, id),
        eq(automations.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Automação não encontrada", 404);
    }

    const validation = await validateBody(req, automationUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.trigger !== undefined) updateData.trigger = data.trigger;
    if (data.triggerConfig !== undefined) updateData.triggerConfig = data.triggerConfig;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(automations)
      .set(updateData)
      .where(eq(automations.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "automation", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar automação", 500);
  }
}

// DELETE /api/automations/[id] - Delete automation
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: automations.id })
      .from(automations)
      .where(and(
        eq(automations.id, id),
        eq(automations.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Automação não encontrada", 404);
    }

    await db.delete(automations).where(eq(automations.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "automation", id, {}, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir automação", 500);
  }
}

// POST /api/automations/[id] - Toggle automation (for /api/automations/[id]/toggle)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: automations.id, isActive: automations.isActive })
      .from(automations)
      .where(and(
        eq(automations.id, id),
        eq(automations.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Automação não encontrada", 404);
    }

    const [updated] = await db
      .update(automations)
      .set({ isActive: !existing.isActive })
      .where(eq(automations.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "automation", id, { isActive: updated.isActive }, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao alternar automação", 500);
  }
}
