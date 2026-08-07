import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, validateBody, createAuditLog } from "@/lib/api-utils";
import { invoiceUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/invoices/[id] - Get invoice details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.id, id),
        eq(invoices.studioId, user.studioId)
      ))
      .limit(1);

    if (!invoice) {
      return apiError("Fatura não encontrada", 404);
    }

    return apiSuccess(invoice);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar fatura", 500);
  }
}

// PATCH /api/invoices/[id] - Update invoice (mark as paid, etc)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(
        eq(invoices.id, id),
        eq(invoices.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Fatura não encontrada", 404);
    }

    const validation = await validateBody(req, invoiceUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "paid") {
        updateData.paidAt = new Date();
      }
    }
    if (data.notes !== undefined) updateData.description = data.notes;

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "invoice", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar fatura", 500);
  }
}
