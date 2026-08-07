import { NextRequest } from "next/server";
import { db } from "@/db";
import { clients, shoots, galleries, invoices, tasks, proposals } from "@/db/schema";
import { eq, and, count, sum, sql, gte, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, getQueryParam } from "@/lib/api-utils";

// GET /api/analytics - Get studio analytics
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const period = getQueryParam(req, "period") || "30"; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get client stats
    const [clientStats] = await db
      .select({
        total: count(),
      })
      .from(clients)
      .where(and(
        eq(clients.studioId, user.studioId),
        isNull(clients.deletedAt)
      ));

    const [newClientsStats] = await db
      .select({
        count: count(),
      })
      .from(clients)
      .where(and(
        eq(clients.studioId, user.studioId),
        gte(clients.createdAt, startDate),
        isNull(clients.deletedAt)
      ));

    // Get shoot stats
    const [shootStats] = await db
      .select({
        total: count(),
      })
      .from(shoots)
      .where(and(
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt)
      ));

    // Shoots by status
    const shootsByStatus = await db
      .select({
        status: shoots.status,
        count: count(),
      })
      .from(shoots)
      .where(and(
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt)
      ))
      .groupBy(shoots.status);

    // Get revenue stats
    const [revenueStats] = await db
      .select({
        total: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END)`,
        overdue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END)`,
      })
      .from(invoices)
      .where(eq(invoices.studioId, user.studioId));

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await db
      .select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`,
        total: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.studioId, user.studioId),
        gte(invoices.createdAt, sixMonthsAgo)
      ))
      .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

    // Get gallery stats
    const [galleryStats] = await db
      .select({
        total: count(),
      })
      .from(galleries)
      .where(and(
        eq(galleries.studioId, user.studioId),
        isNull(galleries.deletedAt)
      ));

    // Get task stats
    const tasksByStatus = await db
      .select({
        status: tasks.status,
        count: count(),
      })
      .from(tasks)
      .where(eq(tasks.studioId, user.studioId))
      .groupBy(tasks.status);

    // Get proposal stats
    const [proposalStats] = await db
      .select({
        total: count(),
        accepted: sql<number>`SUM(CASE WHEN ${proposals.status} = 'accepted' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${proposals.status} IN ('draft', 'sent') THEN 1 ELSE 0 END)`,
      })
      .from(proposals)
      .where(eq(proposals.studioId, user.studioId));

    // Calculate conversion rate
    const conversionRate = proposalStats?.total 
      ? ((Number(proposalStats.accepted) / proposalStats.total) * 100).toFixed(1)
      : "0";

    return apiSuccess({
      clients: {
        total: clientStats?.total || 0,
        new: newClientsStats?.count || 0,
      },
      shoots: {
        total: shootStats?.total || 0,
        byStatus: shootsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {}),
      },
      revenue: {
        total: Number(revenueStats?.total) || 0,
        paid: Number(revenueStats?.paid) || 0,
        pending: Number(revenueStats?.pending) || 0,
        overdue: Number(revenueStats?.overdue) || 0,
        byMonth: revenueByMonth.map(r => ({
          month: r.month,
          total: Number(r.total) || 0,
          paid: Number(r.paid) || 0,
        })),
      },
      galleries: {
        total: galleryStats?.total || 0,
      },
      tasks: {
        byStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t.status]: t.count }), {}),
      },
      proposals: {
        total: proposalStats?.total || 0,
        accepted: Number(proposalStats?.accepted) || 0,
        pending: Number(proposalStats?.pending) || 0,
        conversionRate: parseFloat(conversionRate),
      },
      period: parseInt(period),
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching analytics:", error);
    return apiError("Erro ao buscar analytics", 500);
  }
}
