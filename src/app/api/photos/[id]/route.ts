import { NextRequest } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { photoUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/photos/[id] - Get photo details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [photo] = await db
      .select()
      .from(photos)
      .where(and(
        eq(photos.id, id),
        eq(photos.studioId, user.studioId)
      ))
      .limit(1);

    if (!photo) {
      return apiError("Foto não encontrada", 404);
    }

    return apiSuccess(photo);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching photo:", error);
    return apiError("Erro ao buscar foto", 500);
  }
}

// PATCH /api/photos/[id] - Update photo
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    // Verify photo belongs to studio
    const [existing] = await db
      .select({ id: photos.id })
      .from(photos)
      .where(and(
        eq(photos.id, id),
        eq(photos.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Foto não encontrada", 404);
    }

    const validation = await validateBody(req, photoUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = {};

    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPortfolio !== undefined) updateData.isPortfolio = data.isPortfolio;
    if (data.order !== undefined) updateData.order = data.order;

    const [updated] = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "photo", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error updating photo:", error);
    return apiError("Erro ao atualizar foto", 500);
  }
}

// DELETE /api/photos/[id] - Delete photo
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    // Verify photo belongs to studio
    const [existing] = await db
      .select({ id: photos.id, url: photos.url })
      .from(photos)
      .where(and(
        eq(photos.id, id),
        eq(photos.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Foto não encontrada", 404);
    }

    await db.delete(photos).where(eq(photos.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "photo", id, { url: existing.url }, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error deleting photo:", error);
    return apiError("Erro ao excluir foto", 500);
  }
}
