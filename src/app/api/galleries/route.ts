import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, clients, photos } from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody, handleApiError } from "@/lib/api-utils";
import { gallerySchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";

// GET /api/galleries - List galleries
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId!;

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [
      eq(galleries.studioId, studioId),
      isNull(galleries.deletedAt),
    ];
    
    if (search) {
      conditions.push(ilike(galleries.name, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(galleries.status, status as "draft" | "sent" | "viewed" | "selection_received" | "delivered"));
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(galleries)
      .where(and(...conditions));

    const total = countResult?.total || 0;

    const data = await db
      .select({
        id: galleries.id,
        name: galleries.name,
        slug: galleries.slug,
        clientId: galleries.clientId,
        clientName: galleries.clientName,
        shootId: galleries.shootId,
        status: galleries.status,
        viewCount: galleries.viewCount,
        allowDownload: galleries.allowDownload,
        allowFavorites: galleries.allowFavorites,
        maxSelections: galleries.maxSelections,
        coverUrl: galleries.coverUrl,
        expiresAt: galleries.expiresAt,
        createdAt: galleries.createdAt,
      })
      .from(galleries)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(galleries.createdAt) : desc(galleries.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Batch fetch photo counts
    const galleryIds = data.map(g => g.id);
    const photoCounts = galleryIds.length > 0 ? await db
      .select({ galleryId: photos.galleryId, count: count() })
      .from(photos)
      .where(sql`${photos.galleryId} IN (${sql.join(galleryIds.map(id => sql`${id}`), sql`, `)})`)
      .groupBy(photos.galleryId) : [];

    const photoCountMap = new Map(photoCounts.map(p => [p.galleryId, p.count]));

    const dataWithPhotoCounts = data.map(g => ({
      ...g,
      photoCount: photoCountMap.get(g.id) || 0,
    }));

    return apiPaginated(dataWithPhotoCounts, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/galleries - Create gallery
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId!;

    const validation = await validateBody(req, gallerySchema);
    if (validation.error) return validation.error;
    
    const data = validation.data;

    // Get client name if not provided
    let clientName = data.clientName;
    if (!clientName && data.clientId) {
      const [client] = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, data.clientId))
        .limit(1);
      clientName = client?.name;
    }

    const uniqueSlug = `${slugify(data.name)}-${Date.now().toString(36)}`;

    const [gallery] = await db
      .insert(galleries)
      .values({
        studioId,
        clientId: data.clientId,
        clientName: clientName || "",
        shootId: data.shootId || null,
        name: data.name,
        slug: uniqueSlug,
        status: data.status || "draft",
        password: data.password || null,
        allowDownload: data.allowDownload ?? true,
        allowFavorites: data.allowFavorites ?? true,
        maxSelections: data.maxSelections || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        message: data.welcomeMessage || null,
        coverUrl: data.coverUrl || null,
      })
      .returning();

    await createAuditLog(user.userId, studioId, "create", "gallery", gallery.id, { name: data.name }, req);

    return apiCreated(gallery);
  } catch (error) {
    return handleApiError(error);
  }
}
