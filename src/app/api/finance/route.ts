import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const session = await requireAuth();
    const results = await db.select().from(invoices)
      .where(eq(invoices.studioId, session.studioId || ""))
      .orderBy(desc(invoices.createdAt));

    const paid = results.filter(i => i.status === "paid");
    const pending = results.filter(i => i.status === "pending");
    const overdue = results.filter(i => i.status === "overdue");

    const totalPaid = paid.reduce((s, i) => s + i.total, 0);
    const totalPending = pending.reduce((s, i) => s + i.total, 0);
    const totalOverdue = overdue.reduce((s, i) => s + i.total, 0);

    return apiSuccess({
      invoices: results,
      summary: {
        totalPaid,
        totalPending,
        totalOverdue,
        totalRevenue: totalPaid + totalPending,
        count: results.length,
        paidCount: paid.length,
        pendingCount: pending.length,
        avgTicket: paid.length > 0 ? Math.round(totalPaid / paid.length) : 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
