import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices, shoots, clients } from "@/db/schema";
import { eq, and, sum, sql, gte, lte, count, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, getQueryParam } from "@/lib/api-utils";
import { cached, CACHE_TTL } from "@/lib/server-cache";

// GET /api/reports/financial — Comprehensive financial report
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const period = getQueryParam(req, "period") || "12"; // months
    const months = parseInt(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const cacheKey = `report:financial:${studioId}:${months}`;

    const report = await cached(cacheKey, async () => {
      // === REVENUE SUMMARY ===
      const [revSummary] = await db.select({
        totalRevenue: sum(invoices.total),
        paidRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
        pendingRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END), 0)`,
        overdueRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END), 0)`,
        cancelledRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'cancelled' THEN ${invoices.total} ELSE 0 END), 0)`,
        invoiceCount: count(),
        avgTicket: sql<number>`COALESCE(AVG(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} END), 0)`,
        maxInvoice: sql<number>`COALESCE(MAX(${invoices.total}), 0)`,
      }).from(invoices).where(and(
        eq(invoices.studioId, studioId),
        gte(invoices.createdAt, startDate)
      ));

      // === MONTHLY BREAKDOWN ===
      const monthlyBreakdown = await db.select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`,
        monthName: sql<string>`TO_CHAR(${invoices.createdAt}, 'Mon/YY')`,
        revenue: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${invoices.status} IN ('pending','overdue') THEN ${invoices.total} ELSE 0 END)`,
        invoiceCount: count(),
        paidCount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN 1 ELSE 0 END)`,
      }).from(invoices).where(and(
        eq(invoices.studioId, studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`, sql`TO_CHAR(${invoices.createdAt}, 'Mon/YY')`)
      .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

      // === TOP CLIENTS BY REVENUE ===
      const topClients = await db.select({
        clientId: invoices.clientId,
        clientName: invoices.clientName,
        revenue: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        invoiceCount: count(),
      }).from(invoices).where(and(
        eq(invoices.studioId, studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(invoices.clientId, invoices.clientName)
      .orderBy(sql`SUM(${invoices.total}) DESC`)
      .limit(10);

      // === REVENUE BY SHOOT TYPE ===
      const byShootType = await db.select({
        type: shoots.type,
        revenue: sum(invoices.total),
        shootCount: count(),
        avgValue: sql<number>`AVG(${invoices.total})`,
      }).from(invoices)
      .innerJoin(shoots, eq(invoices.shootId, shoots.id))
      .where(and(
        eq(invoices.studioId, studioId),
        gte(invoices.createdAt, startDate)
      ))
      .groupBy(shoots.type)
      .orderBy(sql`SUM(${invoices.total}) DESC`);

      // === PAYMENT TIMING (days to pay) ===
      const paymentTiming = await db.select({
        avgDaysToPay: sql<number>`AVG(EXTRACT(DAY FROM (${invoices.paidAt} - ${invoices.createdAt})))`,
        minDaysToPay: sql<number>`MIN(EXTRACT(DAY FROM (${invoices.paidAt} - ${invoices.createdAt})))`,
        maxDaysToPay: sql<number>`MAX(EXTRACT(DAY FROM (${invoices.paidAt} - ${invoices.createdAt})))`,
      }).from(invoices).where(and(
        eq(invoices.studioId, studioId),
        eq(invoices.status, "paid"),
        sql`${invoices.paidAt} IS NOT NULL`,
        gte(invoices.createdAt, startDate)
      ));

      // === OVERDUE DETAILS ===
      const overdueList = await db.select({
        id: invoices.id,
        clientName: invoices.clientName,
        description: invoices.description,
        total: invoices.total,
        dueDate: invoices.dueDate,
        createdAt: invoices.createdAt,
      }).from(invoices).where(and(
        eq(invoices.studioId, studioId),
        eq(invoices.status, "overdue")
      )).orderBy(invoices.dueDate).limit(20);

      // === CALCULATE GROWTH ===
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
      
      const currentMonthData = monthlyBreakdown.find(m => m.month === currentMonth);
      const lastMonthData = monthlyBreakdown.find(m => m.month === lastMonth);
      
      const currentRevenue = Number(currentMonthData?.paid) || 0;
      const lastRevenue = Number(lastMonthData?.paid) || 0;
      const monthGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      return {
        period: { months, startDate: startDate.toISOString(), endDate: new Date().toISOString() },
        summary: {
          totalRevenue: Number(revSummary?.totalRevenue) || 0,
          paidRevenue: Number(revSummary?.paidRevenue) || 0,
          pendingRevenue: Number(revSummary?.pendingRevenue) || 0,
          overdueRevenue: Number(revSummary?.overdueRevenue) || 0,
          cancelledRevenue: Number(revSummary?.cancelledRevenue) || 0,
          invoiceCount: revSummary?.invoiceCount || 0,
          avgTicket: Math.round(Number(revSummary?.avgTicket) || 0),
          maxInvoice: Number(revSummary?.maxInvoice) || 0,
          monthGrowth: Math.round(monthGrowth * 10) / 10,
        },
        monthly: monthlyBreakdown.map(m => ({
          month: m.month,
          monthName: m.monthName,
          revenue: Number(m.revenue) || 0,
          paid: Number(m.paid) || 0,
          pending: Number(m.pending) || 0,
          invoiceCount: m.invoiceCount,
          paidCount: Number(m.paidCount) || 0,
        })),
        topClients: topClients.map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          revenue: Number(c.revenue) || 0,
          paid: Number(c.paid) || 0,
          invoiceCount: c.invoiceCount,
        })),
        byShootType: byShootType.map(t => ({
          type: t.type || "Outro",
          revenue: Number(t.revenue) || 0,
          shootCount: t.shootCount,
          avgValue: Math.round(Number(t.avgValue) || 0),
        })),
        paymentTiming: {
          avgDays: Math.round(Number(paymentTiming[0]?.avgDaysToPay) || 0),
          minDays: Math.round(Number(paymentTiming[0]?.minDaysToPay) || 0),
          maxDays: Math.round(Number(paymentTiming[0]?.maxDaysToPay) || 0),
        },
        overdueInvoices: overdueList,
      };
    }, CACHE_TTL.LONG);

    return apiSuccess(report);
  } catch (error) {
    return handleApiError(error);
  }
}
