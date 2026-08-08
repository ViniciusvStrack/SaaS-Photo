import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices, notifications } from "@/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/cron/check-overdue - Check and mark overdue invoices
// Protected by CRON_SECRET header
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "noirframe-cron-dev";

    if (cronSecret !== expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return apiError("Não autorizado", 401);
    }

    const today = new Date().toISOString().split("T")[0];

    // Find pending invoices past due date
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        clientName: invoices.clientName,
        description: invoices.description,
        total: invoices.total,
        dueDate: invoices.dueDate,
        studioId: invoices.studioId,
      })
      .from(invoices)
      .where(and(
        eq(invoices.status, "pending"),
        lt(invoices.dueDate, today)
      ));

    let updated = 0;
    const notificationsToCreate = [];

    for (const invoice of overdueInvoices) {
      // Mark as overdue
      await db.update(invoices)
        .set({ status: "overdue", updatedAt: new Date() })
        .where(eq(invoices.id, invoice.id));

      updated++;

      // Get studio owner for notification
      const ownerResult = await db.execute(
        sql`SELECT owner_id FROM studios WHERE id = ${invoice.studioId} LIMIT 1`
      );

      if (ownerResult.rows.length > 0) {
        const ownerId = ownerResult.rows[0].owner_id as string;
        notificationsToCreate.push({
          userId: ownerId,
          type: "warning" as const,
          title: "Pagamento em atraso",
          message: `Fatura de ${invoice.clientName} (${invoice.description}) está em atraso. Valor: R$ ${((invoice.total || 0) / 100).toFixed(2)}`,
          link: "/app/finance",
        });
      }
    }

    // Create notifications
    if (notificationsToCreate.length > 0) {
      await db.insert(notifications).values(notificationsToCreate);
    }

    return apiSuccess({
      checked: overdueInvoices.length,
      updated,
      notifications: notificationsToCreate.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron check-overdue error:", error);
    return apiError("Erro ao verificar faturas", 500);
  }
}
