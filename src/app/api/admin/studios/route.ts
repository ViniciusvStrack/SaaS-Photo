import { NextRequest } from "next/server";
import { db } from "@/db";
import { studios, users } from "@/db/schema";
import { desc, ilike, count, and } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams } from "@/lib/api-utils";

// GET /api/admin/studios - List all studios (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { page, pageSize, search } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (search) {
      conditions.push(ilike(studios.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ total: count() }).from(studios).where(whereClause);

    const data = await db
      .select({
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        ownerId: studios.ownerId,
        specialty: studios.specialty,
        city: studios.city,
        email: studios.email,
        phone: studios.phone,
        planId: studios.planId,
        storageUsedMb: studios.storageUsedMb,
        storageLimitMb: studios.storageLimitMb,
        brandColor: studios.brandColor,
        createdAt: studios.createdAt,
      })
      .from(studios)
      .where(whereClause)
      .orderBy(desc(studios.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao buscar estúdios", 500);
  }
}
