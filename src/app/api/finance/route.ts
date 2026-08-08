import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc, asc, ilike, count, sum, sql, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams, handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studioId = session.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(invoices.studioId, studioId)];
    if (search) {
      conditions.push(ilike(invoices.clientName, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(invoices.status, status as "pending" | "paid" | "overdue" | "cancelled" | "refunded"));
    }

    // Get summary via SQL aggregation (much faster than JS)
    const [summary] = await db
      .select({
        totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
        totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END), 0)`,
        totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END), 0)`,
        count: count(),
        paidCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN 1 ELSE 0 END)`,
        pendingCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN 1 ELSE 0 END)`,
        overdueCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN 1 ELSE 0 END)`,
      })
      .from(invoices)
      .where(eq(invoices.studioId, studioId));

    // Get paginated invoices
    const [countResult] = await db
      .select({ total: count() })
      .from(invoices)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(invoices.dueDate) : desc(invoices.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalPaid = Number(summary?.totalPaid) || 0;
    const totalPending = Number(summary?.totalPending) || 0;
    const totalOverdue = Number(summary?.totalOverdue) || 0;
    const paidCount = Number(summary?.paidCount) || 0;

    return apiSuccess({
      invoices: data,
      summary: {
        totalPaid,
        totalPending,
        totalOverdue,
        totalRevenue: totalPaid + totalPending,
        count: summary?.count || 0,
        paidCount,
        pendingCount: Number(summary?.pendingCount) || 0,
        overdueCount: Number(summary?.overdueCount) || 0,
        avgTicket: paidCount > 0 ? Math.round(totalPaid / paidCount) : 0,
      },
      pagination: {
        total: countResult?.total || 0,
        page,
        pageSize,
        totalPages: Math.ceil((countResult?.total || 0) / pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
