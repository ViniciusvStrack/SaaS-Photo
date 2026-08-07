import { NextRequest } from "next/server";
import { db } from "@/db";
import { shoots, shootChecklist } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { shootUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/shoots/[id] - Get shoot details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [shoot] = await db
      .select()
      .from(shoots)
      .where(and(
        eq(shoots.id, id),
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt)
      ))
      .limit(1);

    if (!shoot) {
      return apiError("Ensaio não encontrado", 404);
    }

    // Get checklist
    const checklist = await db
      .select()
      .from(shootChecklist)
      .where(eq(shootChecklist.shootId, id))
      .orderBy(shootChecklist.order);

    return apiSuccess({
      ...shoot,
      checklist,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar ensaio", 500);
  }
}

// PATCH /api/shoots/[id] - Update shoot
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: shoots.id })
      .from(shoots)
      .where(and(
        eq(shoots.id, id),
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Ensaio não encontrado", 404);
    }

    const validation = await validateBody(req, shootUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.packageName !== undefined) updateData.packageName = data.packageName;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.briefing !== undefined) updateData.briefing = data.briefing;
    if (data.deliveryDeadline !== undefined) updateData.deliveryDeadline = data.deliveryDeadline;

    const [updated] = await db
      .update(shoots)
      .set(updateData)
      .where(eq(shoots.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "shoot", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar ensaio", 500);
  }
}

// DELETE /api/shoots/[id] - Soft delete shoot
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: shoots.id, name: shoots.name })
      .from(shoots)
      .where(and(
        eq(shoots.id, id),
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Ensaio não encontrado", 404);
    }

    // Soft delete
    await db
      .update(shoots)
      .set({ deletedAt: new Date() })
      .where(eq(shoots.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "shoot", id, { name: existing.name }, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir ensaio", 500);
  }
}
