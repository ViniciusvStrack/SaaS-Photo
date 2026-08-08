import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, photos, photoFavorites } from "@/db/schema";
import { eq, and, isNull, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiCreated, validateBody } from "@/lib/api-utils";
import { photoFavoriteSchema, gallerySelectionSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/client/galleries/[id] - Get gallery details with photos for client
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const [gallery] = await db
      .select()
      .from(galleries)
      .where(and(
        eq(galleries.id, id),
        eq(galleries.clientId, user.userId),
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

    // Get favorites for this client
    const favorites = await db
      .select({ photoId: photoFavorites.photoId })
      .from(photoFavorites)
      .where(and(
        eq(photoFavorites.galleryId, id),
        eq(photoFavorites.clientId, user.userId)
      ));

    const favoriteSet = new Set(favorites.map(f => f.photoId));

    const photosWithFavorites = galleryPhotos.map(p => ({
      ...p,
      isFavorited: favoriteSet.has(p.id),
    }));

    // Update view count
    await db.update(galleries).set({
      viewCount: gallery.viewCount + 1,
      status: gallery.status === "sent" ? "viewed" : gallery.status,
    }).where(eq(galleries.id, id));

    return apiSuccess({
      ...gallery,
      photos: photosWithFavorites,
      photoCount: galleryPhotos.length,
      favoriteCount: favorites.length,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar galeria", 500);
  }
}

// POST /api/client/galleries/[id] - Favorite photo or send selection
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Verify gallery belongs to client
    const [gallery] = await db
      .select({ id: galleries.id, allowFavorites: galleries.allowFavorites, maxSelections: galleries.maxSelections })
      .from(galleries)
      .where(and(eq(galleries.id, id), eq(galleries.clientId, user.userId)))
      .limit(1);

    if (!gallery) {
      return apiError("Galeria não encontrada", 404);
    }

    const body = await req.json();

    // Handle favorite toggle
    if (body.photoId !== undefined && body.isFavorite !== undefined) {
      if (!gallery.allowFavorites) {
        return apiError("Favoritos não permitidos nesta galeria", 400);
      }

      if (body.isFavorite) {
        await db.insert(photoFavorites).values({
          photoId: body.photoId,
          galleryId: id,
          clientId: user.userId,
        });
      } else {
        await db.delete(photoFavorites).where(and(
          eq(photoFavorites.photoId, body.photoId),
          eq(photoFavorites.galleryId, id),
          eq(photoFavorites.clientId, user.userId)
        ));
      }

      return apiSuccess({ photoId: body.photoId, isFavorited: body.isFavorite });
    }

    // Handle selection submission
    if (body.photoIds) {
      const validation = gallerySelectionSchema.safeParse(body);
      if (!validation.success) {
        return apiError(validation.error.issues[0]?.message || "Dados inválidos", 422);
      }

      if (gallery.maxSelections && body.photoIds.length > gallery.maxSelections) {
        return apiError(`Máximo de ${gallery.maxSelections} fotos permitidas`, 400);
      }

      // Mark selected photos as favorites
      for (const photoId of body.photoIds) {
        const [existing] = await db
          .select({ id: photoFavorites.id })
          .from(photoFavorites)
          .where(and(
            eq(photoFavorites.photoId, photoId),
            eq(photoFavorites.galleryId, id),
            eq(photoFavorites.clientId, user.userId)
          ))
          .limit(1);

        if (!existing) {
          await db.insert(photoFavorites).values({
            photoId,
            galleryId: id,
            clientId: user.userId,
          });
        }
      }

      // Update gallery status to selection_received
      await db.update(galleries).set({
        status: "selection_received",
        updatedAt: new Date(),
      }).where(eq(galleries.id, id));

      return apiSuccess({ message: "Seleção enviada com sucesso", count: body.photoIds.length });
    }

    return apiError("Ação não reconhecida", 400);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Client gallery action error:", error);
    return apiError("Erro ao processar ação", 500);
  }
}
