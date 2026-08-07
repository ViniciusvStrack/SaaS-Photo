import { NextRequest } from "next/server";
import { db } from "@/db";
import { photos, galleries } from "@/db/schema";
import { eq, and, desc, asc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, getQueryParam, createAuditLog, validateBody } from "@/lib/api-utils";
import { photoSchema, photoBulkSchema } from "@/lib/validations";

// GET /api/photos - List photos
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    // Get filters from query params
    const galleryId = getQueryParam(req, "galleryId");
    const isPortfolio = getQueryParam(req, "isPortfolio");

    // Build conditions
    const conditions = [eq(photos.studioId, user.studioId)];
    
    if (galleryId) {
      conditions.push(eq(photos.galleryId, galleryId));
    }
    
    if (isPortfolio === "true") {
      conditions.push(eq(photos.isPortfolio, true));
    }

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(photos)
      .where(and(...conditions));

    const total = countResult?.total || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(photos)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(photos.order) : desc(photos.uploadedAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, total, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching photos:", error);
    return apiError("Erro ao buscar fotos", 500);
  }
}

// POST /api/photos - Create photo
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    // Check if it's a bulk upload
    const body = await req.clone().json();
    
    if (body.photos && Array.isArray(body.photos)) {
      // Bulk upload
      const validation = photoBulkSchema.safeParse(body);
      if (!validation.success) {
        return apiError(validation.error.issues[0]?.message || "Dados inválidos", 422);
      }

      const data = validation.data;

      // Verify gallery belongs to studio
      const [gallery] = await db
        .select({ id: galleries.id, clientId: galleries.clientId })
        .from(galleries)
        .where(and(
          eq(galleries.id, data.galleryId),
          eq(galleries.studioId, user.studioId)
        ))
        .limit(1);

      if (!gallery) {
        return apiError("Galeria não encontrada", 404);
      }

      // Get max order
      const [maxOrder] = await db
        .select({ max: count() })
        .from(photos)
        .where(eq(photos.galleryId, data.galleryId));

      let order = maxOrder?.max || 0;

      const photosToInsert = data.photos.map(photo => ({
        studioId: user.studioId!,
        galleryId: data.galleryId,
        clientId: gallery.clientId,
        url: photo.url,
        filename: photo.filename || null,
        order: ++order,
      }));

      const inserted = await db
        .insert(photos)
        .values(photosToInsert)
        .returning();

      await createAuditLog(user.userId, user.studioId, "create", "photos", data.galleryId, { count: inserted.length }, req);

      return apiCreated({ photos: inserted, count: inserted.length });
    } else {
      // Single photo upload
      const validation = photoSchema.safeParse(body);
      if (!validation.success) {
        return apiError(validation.error.issues[0]?.message || "Dados inválidos", 422);
      }

      const data = validation.data;

      // Verify gallery belongs to studio
      const [gallery] = await db
        .select({ id: galleries.id, clientId: galleries.clientId })
        .from(galleries)
        .where(and(
          eq(galleries.id, data.galleryId),
          eq(galleries.studioId, user.studioId)
        ))
        .limit(1);

      if (!gallery) {
        return apiError("Galeria não encontrada", 404);
      }

      const [photo] = await db
        .insert(photos)
        .values({
          studioId: user.studioId,
          galleryId: data.galleryId,
          clientId: gallery.clientId,
          url: data.url,
          filename: data.filename || null,
          width: data.width || null,
          height: data.height || null,
          sizeBytes: data.sizeMb ? Math.round(data.sizeMb * 1024 * 1024) : null,
          tags: data.tags || [],
          isPortfolio: data.isPortfolio || false,
          order: data.order || 0,
        })
        .returning();

      await createAuditLog(user.userId, user.studioId, "create", "photo", photo.id, { url: data.url }, req);

      return apiCreated(photo);
    }
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating photo:", error);
    return apiError("Erro ao criar foto", 500);
  }
}
