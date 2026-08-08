import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, photos } from "@/db/schema";
import { eq, and, desc, count, isNull, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/client/galleries - List galleries for logged-in client
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get galleries where clientId matches
    const data = await db
      .select()
      .from(galleries)
      .where(and(
        eq(galleries.clientId, user.userId),
        isNull(galleries.deletedAt)
      ))
      .orderBy(desc(galleries.createdAt));

    // Get photo counts
    const galleryIds = data.map(g => g.id);
    const photoCounts = galleryIds.length > 0 ? await db
      .select({ galleryId: photos.galleryId, count: count() })
      .from(photos)
      .where(sql`${photos.galleryId} IN (${sql.join(galleryIds.map(id => sql`${id}`), sql`, `)})`)
      .groupBy(photos.galleryId) : [];

    const photoCountMap = new Map(photoCounts.map(p => [p.galleryId, p.count]));

    const result = data.map(g => ({
      ...g,
      photoCount: photoCountMap.get(g.id) || 0,
    }));

    return apiSuccess(result);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar galerias", 500);
  }
}
