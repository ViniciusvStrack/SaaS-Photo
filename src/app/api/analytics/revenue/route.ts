import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices, shoots } from "@/db/schema";
import { eq, and, sum, sql, gte, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, getQueryParam } from "@/lib/api-utils";

// GET /api/analytics/revenue - Detailed revenue analytics
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const months = parseInt(getQueryParam(req, "months") || "12");
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Revenue by month
    const revenueByMonth = await db
      .select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`,
        monthName: sql<string>`TO_CHAR(${invoices.createdAt}, 'Mon/YY')`,
        total: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END)`,
        overdue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END)`,
        count: count(),
      })
      .from(invoices)
      .where(and(
        eq(invoices.studioId, user.studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`, sql`TO_CHAR(${invoices.createdAt}, 'Mon/YY')`)
      .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

    // Revenue by client (top 10)
    const revenueByClient = await db
      .select({
        clientName: invoices.clientName,
        clientId: invoices.clientId,
        total: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        count: count(),
      })
      .from(invoices)
      .where(and(
        eq(invoices.studioId, user.studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(invoices.clientName, invoices.clientId)
      .orderBy(sql`SUM(${invoices.total}) DESC`)
      .limit(10);

    // Revenue by shoot type
    const revenueByType = await db
      .select({
        type: shoots.type,
        total: sum(invoices.total),
        count: count(),
      })
      .from(invoices)
      .innerJoin(shoots, eq(invoices.shootId, shoots.id))
      .where(and(
        eq(invoices.studioId, user.studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(shoots.type)
      .orderBy(sql`SUM(${invoices.total}) DESC`);

    // Average ticket
    const [avgTicket] = await db
      .select({
        avg: sql<number>`AVG(${invoices.total})`,
        max: sql<number>`MAX(${invoices.total})`,
        min: sql<number>`MIN(CASE WHEN ${invoices.total} > 0 THEN ${invoices.total} END)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.studioId, user.studioId),
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, startDate)
      ));

    // Totals
    const [totals] = await db
      .select({
        totalRevenue: sum(invoices.total),
        paidRevenue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        pendingRevenue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END)`,
        overdueRevenue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END)`,
        invoiceCount: count(),
      })
      .from(invoices)
      .where(and(
        eq(invoices.studioId, user.studioId),
        gte(invoices.createdAt, startDate)
      ));

    return apiSuccess({
      summary: {
        totalRevenue: Number(totals?.totalRevenue) || 0,
        paidRevenue: Number(totals?.paidRevenue) || 0,
        pendingRevenue: Number(totals?.pendingRevenue) || 0,
        overdueRevenue: Number(totals?.overdueRevenue) || 0,
        invoiceCount: totals?.invoiceCount || 0,
        averageTicket: Math.round(Number(avgTicket?.avg) || 0),
        maxTicket: Number(avgTicket?.max) || 0,
        minTicket: Number(avgTicket?.min) || 0,
      },
      byMonth: revenueByMonth.map(r => ({
        month: r.month,
        monthName: r.monthName,
        total: Number(r.total) || 0,
        paid: Number(r.paid) || 0,
        pending: Number(r.pending) || 0,
        overdue: Number(r.overdue) || 0,
        count: r.count,
      })),
      byClient: revenueByClient.map(r => ({
        clientName: r.clientName,
        clientId: r.clientId,
        total: Number(r.total) || 0,
        paid: Number(r.paid) || 0,
        count: r.count,
      })),
      byType: revenueByType.map(r => ({
        type: r.type || "Outro",
        total: Number(r.total) || 0,
        count: r.count,
      })),
      period: months,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Revenue analytics error:", error);
    return apiError("Erro ao buscar analytics de receita", 500);
  }
}
