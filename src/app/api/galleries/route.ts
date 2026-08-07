import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, clients, photos } from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { gallerySchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";

// GET /api/galleries - List galleries
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [
      eq(galleries.studioId, user.studioId),
      isNull(galleries.deletedAt),
    ];
    
    if (search) {
      conditions.push(ilike(galleries.name, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(galleries.status, status as "draft" | "sent" | "viewed" | "selection_received" | "delivered"));
    }

    // Get total count
    const [countResult] = await db
      .select({ total: count() })
      .from(galleries)
      .where(and(...conditions));

    const total = countResult?.total || 0;

    // Get paginated data with photo count
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

    // Get photo counts for each gallery
    const galleryIds = data.map(g => g.id);
    const photoCounts = galleryIds.length > 0 ? await db
      .select({
        galleryId: photos.galleryId,
        count: count(),
      })
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
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching galleries:", error);
    return apiError("Erro ao buscar galerias", 500);
  }
}

// POST /api/galleries - Create gallery
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

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

    // Generate unique slug
    const baseSlug = slugify(data.name);
    const timestamp = Date.now().toString(36);
    const uniqueSlug = `${baseSlug}-${timestamp}`;

    const [gallery] = await db
      .insert(galleries)
      .values({
        studioId: user.studioId,
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

    await createAuditLog(user.userId, user.studioId, "create", "gallery", gallery.id, { name: data.name }, req);

    return apiCreated(gallery);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating gallery:", error);
    return apiError("Erro ao criar galeria", 500);
  }
}
