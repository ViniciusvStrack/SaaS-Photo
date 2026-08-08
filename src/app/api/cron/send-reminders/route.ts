import { NextRequest } from "next/server";
import { db } from "@/db";
import { shoots, notifications, automations } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/cron/send-reminders - Send shoot reminders
export async function GET(req: NextRequest) {
  try {
    const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "noirframe-cron-dev";

    if (cronSecret !== expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return apiError("Não autorizado", 401);
    }

    // Find shoots happening in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const twoDaysStr = twoDaysFromNow.toISOString().split("T")[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

    // Get confirmed shoots in the next 2 days
    const upcomingShoots = await db
      .select({
        id: shoots.id,
        name: shoots.name,
        clientName: shoots.clientName,
        date: shoots.date,
        time: shoots.time,
        location: shoots.location,
        studioId: shoots.studioId,
      })
      .from(shoots)
      .where(and(
        eq(shoots.status, "confirmed"),
        sql`${shoots.date} IN (${today}, ${tomorrowStr}, ${twoDaysStr})`
      ));

    const notificationsToCreate = [];

    for (const shoot of upcomingShoots) {
      // Get studio owner
      const ownerResult = await db.execute(
        sql`SELECT owner_id FROM studios WHERE id = ${shoot.studioId} LIMIT 1`
      );

      if (ownerResult.rows.length > 0) {
        const ownerId = ownerResult.rows[0].owner_id as string;
        const daysUntil = shoot.date === today ? "hoje" :
          shoot.date === tomorrowStr ? "amanhã" : "em 2 dias";

        notificationsToCreate.push({
          userId: ownerId,
          type: "info" as const,
          title: `Ensaio ${daysUntil}`,
          message: `${shoot.name} com ${shoot.clientName} ${daysUntil} às ${shoot.time || ""}${shoot.location ? ` em ${shoot.location}` : ""}`,
          link: "/app/shoots",
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await db.insert(notifications).values(notificationsToCreate);
    }

    // Update automation trigger counts
    await db.execute(
      sql`UPDATE automations SET trigger_count = trigger_count + ${notificationsToCreate.length}, last_triggered_at = NOW() WHERE trigger = 'before_shoot' AND is_active = true`
    );

    return apiSuccess({
      shootsChecked: upcomingShoots.length,
      remindersSent: notificationsToCreate.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron send-reminders error:", error);
    return apiError("Erro ao enviar lembretes", 500);
  }
}
