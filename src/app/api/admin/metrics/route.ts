import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, studios, invoices, clients, shoots } from "@/db/schema";
import { count, sum, sql, eq, gte, and } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/admin/metrics - SaaS-level metrics (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    // Total users
    const [userStats] = await db.select({ total: count() }).from(users);
    const [activeUsers] = await db.select({ total: count() }).from(users).where(eq(users.isActive, true));

    // Total studios
    const [studioStats] = await db.select({ total: count() }).from(studios);

    // Total clients
    const [clientStats] = await db.select({ total: count() }).from(clients);

    // Total shoots
    const [shootStats] = await db.select({ total: count() }).from(shoots);

    // Revenue (MRR approximation from invoices)
    const [revenueStats] = await db
      .select({
        total: sum(invoices.total),
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.total} ELSE 0 END)`,
        overdue: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END)`,
      })
      .from(invoices);

    // New users last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers30d] = await db
      .select({ total: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

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
      .where(gte(invoices.createdAt, sixMonthsAgo))
      .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

    // Users by role
    const usersByRole = await db
      .select({ role: users.role, count: count() })
      .from(users)
      .groupBy(users.role);

    return apiSuccess({
      users: {
        total: userStats?.total || 0,
        active: activeUsers?.total || 0,
        new30d: newUsers30d?.total || 0,
        byRole: usersByRole.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {}),
      },
      studios: {
        total: studioStats?.total || 0,
      },
      clients: {
        total: clientStats?.total || 0,
      },
      shoots: {
        total: shootStats?.total || 0,
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
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    console.error("Admin metrics error:", error);
    return apiError("Erro ao buscar métricas", 500);
  }
}
