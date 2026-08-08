import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, ilike, count, and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams } from "@/lib/api-utils";

// GET /api/admin/users - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { page, pageSize, search, status } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (search) {
      conditions.push(ilike(users.name, `%${search}%`));
    }
    if (status === "active") {
      conditions.push(eq(users.isActive, true));
    } else if (status === "inactive") {
      conditions.push(eq(users.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ total: count() }).from(users).where(whereClause);

    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        phone: users.phone,
        studioId: users.studioId,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao buscar usuários", 500);
  }
}
