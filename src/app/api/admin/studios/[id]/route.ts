import { NextRequest } from "next/server";
import { db } from "@/db";
import { studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError, validateBody, createAuditLog } from "@/lib/api-utils";
import { adminStudioUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/studios/[id] - Update studio (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await params;

    const [existing] = await db.select({ id: studios.id }).from(studios).where(eq(studios.id, id)).limit(1);
    if (!existing) {
      return apiError("Estúdio não encontrado", 404);
    }

    const validation = await validateBody(req, adminStudioUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.planId !== undefined) updateData.planId = data.planId;
    if (data.storageLimitMb !== undefined) updateData.storageLimitMb = data.storageLimitMb;

    const [updated] = await db.update(studios).set(updateData).where(eq(studios.id, id)).returning();

    await createAuditLog(admin.userId, null, "update", "studio", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao atualizar estúdio", 500);
  }
}
