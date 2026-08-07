import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { proposalUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/proposals/[id] - Get proposal details with items
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [proposal] = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.id, id),
        eq(proposals.studioId, user.studioId)
      ))
      .limit(1);

    if (!proposal) {
      return apiError("Proposta não encontrada", 404);
    }

    // Get items
    const items = await db
      .select()
      .from(proposalItems)
      .where(eq(proposalItems.proposalId, id))
      .orderBy(proposalItems.order);

    return apiSuccess({
      ...proposal,
      items,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar proposta", 500);
  }
}

// PATCH /api/proposals/[id] - Update proposal
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: proposals.id, status: proposals.status })
      .from(proposals)
      .where(and(
        eq(proposals.id, id),
        eq(proposals.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Proposta não encontrada", 404);
    }

    const validation = await validateBody(req, proposalUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.service !== undefined) updateData.service = data.service;
    if (data.package !== undefined) updateData.packageName = data.package;
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.discount !== undefined) updateData.discount = data.discount;

    // Recalculate totals if items are provided
    if (data.items) {
      const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      updateData.subtotal = subtotal;
      updateData.total = subtotal - (data.discount || 0);

      // Delete old items and insert new ones
      await db.delete(proposalItems).where(eq(proposalItems.proposalId, id));
      await db.insert(proposalItems).values(
        data.items.map((item, index) => ({
          proposalId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          order: index,
        }))
      );
    }

    const [updated] = await db
      .update(proposals)
      .set(updateData)
      .where(eq(proposals.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "proposal", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar proposta", 500);
  }
}

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: proposals.id })
      .from(proposals)
      .where(and(
        eq(proposals.id, id),
        eq(proposals.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Proposta não encontrada", 404);
    }

    // Delete items first
    await db.delete(proposalItems).where(eq(proposalItems.proposalId, id));
    // Delete proposal
    await db.delete(proposals).where(eq(proposals.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "proposal", id, {}, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir proposta", 500);
  }
}
