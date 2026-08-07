import { NextRequest } from "next/server";
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { contractUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/contracts/[id] - Get contract details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [contract] = await db
      .select()
      .from(contracts)
      .where(and(
        eq(contracts.id, id),
        eq(contracts.studioId, user.studioId)
      ))
      .limit(1);

    if (!contract) {
      return apiError("Contrato não encontrado", 404);
    }

    return apiSuccess(contract);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar contrato", 500);
  }
}

// PATCH /api/contracts/[id] - Update contract
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: contracts.id, status: contracts.status })
      .from(contracts)
      .where(and(
        eq(contracts.id, id),
        eq(contracts.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Contrato não encontrado", 404);
    }

    // Don't allow editing signed contracts
    if (existing.status === "signed" || existing.status === "completed") {
      return apiError("Contrato assinado não pode ser editado", 400);
    }

    const validation = await validateBody(req, contractUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.service !== undefined) updateData.service = data.service;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.clauses !== undefined) updateData.clauses = data.clauses;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "sent") {
        updateData.sentAt = new Date();
      }
    }

    const [updated] = await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "contract", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar contrato", 500);
  }
}

// DELETE /api/contracts/[id] - Delete contract
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: contracts.id, status: contracts.status })
      .from(contracts)
      .where(and(
        eq(contracts.id, id),
        eq(contracts.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Contrato não encontrado", 404);
    }

    // Don't allow deleting signed contracts
    if (existing.status === "signed" || existing.status === "completed") {
      return apiError("Contrato assinado não pode ser excluído", 400);
    }

    await db.delete(contracts).where(eq(contracts.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "contract", id, {}, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir contrato", 500);
  }
}
