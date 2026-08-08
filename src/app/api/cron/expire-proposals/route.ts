import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposals, notifications } from "@/db/schema";
import { eq, and, lt, or, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/cron/expire-proposals - Expire proposals past valid_until date
export async function GET(req: NextRequest) {
  try {
    const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "noirframe-cron-dev";

    if (cronSecret !== expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return apiError("Não autorizado", 401);
    }

    const today = new Date().toISOString().split("T")[0];

    // Find proposals that should expire
    const expiring = await db
      .select({
        id: proposals.id,
        clientName: proposals.clientName,
        service: proposals.service,
        total: proposals.total,
        studioId: proposals.studioId,
      })
      .from(proposals)
      .where(and(
        or(eq(proposals.status, "draft"), eq(proposals.status, "sent")),
        lt(proposals.validUntil, today)
      ));

    let expired = 0;
    const notificationsToCreate = [];

    for (const proposal of expiring) {
      await db.update(proposals)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(proposals.id, proposal.id));

      expired++;

      const ownerResult = await db.execute(
        sql`SELECT owner_id FROM studios WHERE id = ${proposal.studioId} LIMIT 1`
      );

      if (ownerResult.rows.length > 0) {
        notificationsToCreate.push({
          userId: ownerResult.rows[0].owner_id as string,
          type: "warning" as const,
          title: "Proposta expirada",
          message: `Proposta para ${proposal.clientName} (${proposal.service}) expirou`,
          link: "/app/proposals",
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await db.insert(notifications).values(notificationsToCreate);
    }

    return apiSuccess({
      checked: expiring.length,
      expired,
      notifications: notificationsToCreate.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron expire-proposals error:", error);
    return apiError("Erro ao expirar propostas", 500);
  }
}
