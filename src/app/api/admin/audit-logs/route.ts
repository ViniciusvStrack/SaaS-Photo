import { NextRequest } from "next/server";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, ilike, count, and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams, getQueryParam } from "@/lib/api-utils";

// GET /api/admin/audit-logs - List all audit logs (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { page, pageSize } = getQueryParams(req);
    const offset = (page - 1) * pageSize;
    const action = getQueryParam(req, "action");
    const entity = getQueryParam(req, "entity");

    const conditions = [];
    if (action) conditions.push(eq(auditLogs.action, action));
    if (entity) conditions.push(eq(auditLogs.entity, entity));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ total: count() }).from(auditLogs).where(whereClause);

    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        studioId: auditLogs.studioId,
        action: auditLogs.action,
        entity: auditLogs.entity,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(logs, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao buscar logs", 500);
  }
}
