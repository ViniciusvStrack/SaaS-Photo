import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, photos, photoFavorites, studios } from "@/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { apiSuccess, apiError, getQueryParam } from "@/lib/api-utils";

type Params = { params: Promise<{ slug: string }> };

// GET /api/public/gallery/[slug] — Public gallery access (no auth required)
// Access: anyone with the link (+ optional password)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const password = getQueryParam(req, "password");

    // Find gallery by slug
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(and(
        eq(galleries.slug, slug),
        isNull(galleries.deletedAt)
      ))
      .limit(1);

    if (!gallery) {
      return apiError("Galeria não encontrada", 404);
    }

    // Check if gallery is accessible (must be sent or later status)
    const accessibleStatuses = ["sent", "viewed", "selection_received", "delivered"];
    if (!accessibleStatuses.includes(gallery.status)) {
      return apiError("Esta galeria ainda não está disponível", 403);
    }

    // Check expiration
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return apiError("Esta galeria expirou", 410);
    }

    // Check password if gallery is password-protected
    if (gallery.password && gallery.password !== password) {
      return apiSuccess({
        requiresPassword: true,
        galleryName: gallery.name,
        clientName: gallery.clientName,
        coverUrl: gallery.coverUrl,
      });
    }

    // Get photos
    const galleryPhotos = await db
      .select({
        id: photos.id,
        url: photos.url,
        thumbnailUrl: photos.thumbnailUrl,
        filename: photos.filename,
        width: photos.width,
        height: photos.height,
        order: photos.order,
      })
      .from(photos)
      .where(eq(photos.galleryId, gallery.id))
      .orderBy(photos.order);

    // Get studio info for branding
    const [studio] = await db
      .select({
        name: studios.name,
        brandColor: studios.brandColor,
        instagram: studios.instagram,
        website: studios.website,
      })
      .from(studios)
      .where(eq(studios.id, gallery.studioId))
      .limit(1);

    // Increment view count & update status to "viewed" if "sent"
    const updates: Record<string, unknown> = {
      viewCount: sql`${galleries.viewCount} + 1`,
    };
    if (gallery.status === "sent") {
      updates.status = "viewed";
    }
    await db.update(galleries).set(updates).where(eq(galleries.id, gallery.id));

    return apiSuccess({
      gallery: {
        id: gallery.id,
        name: gallery.name,
        clientName: gallery.clientName,
        coverUrl: gallery.coverUrl,
        message: gallery.message,
        allowDownload: gallery.allowDownload,
        allowFavorites: gallery.allowFavorites,
        maxSelections: gallery.maxSelections,
        watermark: gallery.watermark,
        photoCount: galleryPhotos.length,
        viewCount: (gallery.viewCount || 0) + 1,
      },
      photos: galleryPhotos,
      studio: studio || null,
    });
  } catch (error) {
    console.error("Public gallery error:", error);
    return apiError("Erro ao carregar galeria", 500);
  }
}

// POST /api/public/gallery/[slug] — Submit selection or favorite (no auth)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const [gallery] = await db
      .select()
      .from(galleries)
      .where(and(eq(galleries.slug, slug), isNull(galleries.deletedAt)))
      .limit(1);

    if (!gallery) {
      return apiError("Galeria não encontrada", 404);
    }

    // Verify password if needed
    if (gallery.password && body.password !== gallery.password) {
      return apiError("Senha incorreta", 401);
    }

    // Handle favorite toggle
    if (body.action === "favorite" && body.photoId) {
      if (!gallery.allowFavorites) {
        return apiError("Favoritos não permitidos nesta galeria", 400);
      }

      if (body.isFavorite) {
        await db.insert(photoFavorites).values({
          photoId: body.photoId,
          galleryId: gallery.id,
          clientId: gallery.clientId,
        });
      } else {
        await db.delete(photoFavorites).where(and(
          eq(photoFavorites.photoId, body.photoId),
          eq(photoFavorites.galleryId, gallery.id)
        ));
      }

      return apiSuccess({ photoId: body.photoId, isFavorited: body.isFavorite });
    }

    // Handle selection submission
    if (body.action === "selection" && Array.isArray(body.photoIds)) {
      if (gallery.maxSelections && body.photoIds.length > gallery.maxSelections) {
        return apiError(`Máximo de ${gallery.maxSelections} fotos permitidas`, 400);
      }

      // Save favorites for selected photos
      for (const photoId of body.photoIds) {
        const [existing] = await db.select({ id: photoFavorites.id })
          .from(photoFavorites)
          .where(and(
            eq(photoFavorites.photoId, photoId),
            eq(photoFavorites.galleryId, gallery.id)
          ))
          .limit(1);

        if (!existing) {
          await db.insert(photoFavorites).values({
            photoId,
            galleryId: gallery.id,
            clientId: gallery.clientId,
          });
        }
      }

      // Update gallery status
      await db.update(galleries).set({
        status: "selection_received",
        updatedAt: new Date(),
      }).where(eq(galleries.id, gallery.id));

      return apiSuccess({
        message: "Seleção enviada com sucesso!",
        count: body.photoIds.length,
      });
    }

    return apiError("Ação não reconhecida", 400);
  } catch (error) {
    console.error("Public gallery action error:", error);
    return apiError("Erro ao processar ação", 500);
  }
}
