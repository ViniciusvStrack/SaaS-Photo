import { NextRequest } from "next/server";
import { db } from "@/db";
import { clients, shoots, galleries, invoices, tasks, messages, notifications, proposals } from "@/db/schema";
import { eq, and, desc, count, sum, sql, gte, isNull, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/dashboard - All-in-one dashboard data for photographer
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const sid = user.studioId;
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const todayStr = today.toISOString().split("T")[0];

    // ---- STATS CARDS ----
    // Total revenue paid
    const [revenuePaid] = await db.select({
      total: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
    }).from(invoices).where(eq(invoices.studioId, sid));

    // Pending revenue
    const [revenuePending] = await db.select({
      total: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('pending', 'overdue') THEN ${invoices.total} ELSE 0 END), 0)`,
    }).from(invoices).where(eq(invoices.studioId, sid));

    // Active clients
    const [clientCount] = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), isNull(clients.deletedAt)));

    // New clients this month
    const [newClients] = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), gte(clients.createdAt, thirtyDaysAgo), isNull(clients.deletedAt)));

    // Total shoots
    const [shootCount] = await db.select({ count: count() }).from(shoots)
      .where(and(eq(shoots.studioId, sid), isNull(shoots.deletedAt)));

    // Active galleries
    const [galleryCount] = await db.select({ count: count() }).from(galleries)
      .where(and(eq(galleries.studioId, sid), isNull(galleries.deletedAt)));

    // Pending proposals
    const [pendingProposals] = await db.select({ count: count() }).from(proposals)
      .where(and(eq(proposals.studioId, sid), eq(proposals.status, "sent")));

    // ---- UPCOMING SHOOTS ----
    const upcomingShoots = await db
      .select({
        id: shoots.id,
        name: shoots.name,
        clientName: shoots.clientName,
        date: shoots.date,
        time: shoots.time,
        location: shoots.location,
        status: shoots.status,
        type: shoots.type,
        value: shoots.value,
      })
      .from(shoots)
      .where(and(
        eq(shoots.studioId, sid),
        isNull(shoots.deletedAt),
        gte(shoots.date, todayStr),
        eq(shoots.status, "confirmed")
      ))
      .orderBy(asc(shoots.date), asc(shoots.time))
      .limit(5);

    // ---- PENDING TASKS ----
    const pendingTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(and(
        eq(tasks.studioId, sid),
        sql`${tasks.status} IN ('today', 'in_progress', 'waiting_client')`
      ))
      .orderBy(
        sql`CASE ${tasks.priority} WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`
      )
      .limit(8);

    // ---- RECENT NOTIFICATIONS ----
    const recentNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(8);

    const [unreadNotifs] = await db.select({ count: count() }).from(notifications)
      .where(and(eq(notifications.userId, user.userId), eq(notifications.isRead, false)));

    // ---- UNREAD MESSAGES ----
    const [unreadMsgs] = await db.select({ count: count() }).from(messages)
      .where(and(eq(messages.studioId, sid), eq(messages.isRead, false)));

    // ---- OVERDUE INVOICES ----
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        clientName: invoices.clientName,
        description: invoices.description,
        total: invoices.total,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .where(and(eq(invoices.studioId, sid), eq(invoices.status, "overdue")))
      .orderBy(asc(invoices.dueDate))
      .limit(5);

    // ---- REVENUE LAST 6 MONTHS ----
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueChart = await db
      .select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'Mon')`,
        monthKey: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`,
        paid: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('pending', 'overdue') THEN ${invoices.total} ELSE 0 END), 0)`,
      })
      .from(invoices)
      .where(and(eq(invoices.studioId, sid), gte(invoices.createdAt, sixMonthsAgo)))
      .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'Mon')`, sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

    return apiSuccess({
      stats: {
        revenue: {
          paid: Number(revenuePaid?.total) || 0,
          pending: Number(revenuePending?.total) || 0,
        },
        clients: {
          total: clientCount?.count || 0,
          newThisMonth: newClients?.count || 0,
        },
        shoots: shootCount?.count || 0,
        galleries: galleryCount?.count || 0,
        pendingProposals: pendingProposals?.count || 0,
        unreadMessages: unreadMsgs?.count || 0,
        unreadNotifications: unreadNotifs?.count || 0,
      },
      upcomingShoots,
      pendingTasks,
      overdueInvoices,
      recentNotifications: recentNotifs,
      revenueChart: revenueChart.map(r => ({
        month: r.month,
        monthKey: r.monthKey,
        paid: Number(r.paid),
        pending: Number(r.pending),
      })),
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Dashboard error:", error);
    return apiError("Erro ao buscar dashboard", 500);
  }
}
