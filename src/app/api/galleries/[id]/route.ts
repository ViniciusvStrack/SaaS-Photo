import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, photos } from "@/db/schema";
import { eq, and, count, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { galleryUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/galleries/[id] - Get gallery details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [gallery] = await db
      .select()
      .from(galleries)
      .where(and(
        eq(galleries.id, id),
        eq(galleries.studioId, user.studioId),
        isNull(galleries.deletedAt)
      ))
      .limit(1);

    if (!gallery) {
      return apiError("Galeria não encontrada", 404);
    }

    // Get photos
    const galleryPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.galleryId, id))
      .orderBy(photos.order);

    // Get photo count
    const [photoCountResult] = await db
      .select({ count: count() })
      .from(photos)
      .where(eq(photos.galleryId, id));

    return apiSuccess({
      ...gallery,
      photos: galleryPhotos,
      photoCount: photoCountResult?.count || 0,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching gallery:", error);
    return apiError("Erro ao buscar galeria", 500);
  }
}

// PATCH /api/galleries/[id] - Update gallery
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    // Verify gallery belongs to studio
    const [existing] = await db
      .select({ id: galleries.id })
      .from(galleries)
      .where(and(
        eq(galleries.id, id),
        eq(galleries.studioId, user.studioId),
        isNull(galleries.deletedAt)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Galeria não encontrada", 404);
    }

    const validation = await validateBody(req, galleryUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.allowDownload !== undefined) updateData.allowDownload = data.allowDownload;
    if (data.allowFavorites !== undefined) updateData.allowFavorites = data.allowFavorites;
    if (data.maxSelections !== undefined) updateData.maxSelections = data.maxSelections;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.welcomeMessage !== undefined) updateData.message = data.welcomeMessage;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;

    const [updated] = await db
      .update(galleries)
      .set(updateData)
      .where(eq(galleries.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "gallery", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error updating gallery:", error);
    return apiError("Erro ao atualizar galeria", 500);
  }
}

// DELETE /api/galleries/[id] - Soft delete gallery
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    // Verify gallery belongs to studio
    const [existing] = await db
      .select({ id: galleries.id, name: galleries.name })
      .from(galleries)
      .where(and(
        eq(galleries.id, id),
        eq(galleries.studioId, user.studioId),
        isNull(galleries.deletedAt)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Galeria não encontrada", 404);
    }

    // Soft delete
    await db
      .update(galleries)
      .set({ deletedAt: new Date() })
      .where(eq(galleries.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "gallery", id, { name: existing.name }, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error deleting gallery:", error);
    return apiError("Erro ao excluir galeria", 500);
  }
}
