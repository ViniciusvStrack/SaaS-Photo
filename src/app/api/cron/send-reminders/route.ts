import { NextRequest } from "next/server";
import { db } from "@/db";
import { shoots, clients, notifications, automations } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { sendEmail } from "@/lib/integrations/email-sender";

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
        clientId: shoots.clientId,
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

    // Bulk-load client emails for shoots that reference a client
    const clientIds = [...new Set(upcomingShoots.map((s) => s.clientId).filter(Boolean))] as string[];
    const clientMap = new Map<string, string>();
    if (clientIds.length > 0) {
      const foundClients = await db
        .select({ id: clients.id, email: clients.email })
        .from(clients)
        .where(inArray(clients.id, clientIds));
      for (const c of foundClients) {
        if (c.email) clientMap.set(c.id, c.email);
      }
    }

    const notificationsToCreate = [];
    const emailsToSend: {
      to: string;
      clientName: string;
      date: string;
      time: string | null;
      location: string | null;
      studioName: string;
    }[] = [];

    for (const shoot of upcomingShoots) {
      // Get studio owner + name
      const ownerResult = await db.execute(
        sql`SELECT owner_id, name FROM studios WHERE id = ${shoot.studioId} LIMIT 1`
      );

      if (ownerResult.rows.length > 0) {
        const ownerId = ownerResult.rows[0].owner_id as string;
        const studioName = (ownerResult.rows[0].name as string) || "NoirFrame";
        const daysUntil = shoot.date === today ? "hoje" :
          shoot.date === tomorrowStr ? "amanhã" : "em 2 dias";

        notificationsToCreate.push({
          userId: ownerId,
          type: "info" as const,
          title: `Ensaio ${daysUntil}`,
          message: `${shoot.name} com ${shoot.clientName} ${daysUntil} às ${shoot.time || ""}${shoot.location ? ` em ${shoot.location}` : ""}`,
          link: "/app/shoots",
        });

        // Send email to the client when their email is registered
        const clientEmail = shoot.clientId ? clientMap.get(shoot.clientId) : undefined;
        if (clientEmail) {
          emailsToSend.push({
            to: clientEmail,
            clientName: shoot.clientName || "Cliente",
            date: shoot.date || "",
            time: shoot.time,
            location: shoot.location,
            studioName,
          });
        }
      }
    }

    if (notificationsToCreate.length > 0) {
      await db.insert(notifications).values(notificationsToCreate);
    }

    // Update automation trigger counts
    await db.execute(
      sql`UPDATE automations SET trigger_count = trigger_count + ${notificationsToCreate.length}, last_triggered_at = NOW() WHERE trigger = 'before_shoot' AND is_active = true`
    );

    // Send reminder emails (each failure is logged, never breaks the cron)
    let emailsSent = 0;
    let emailsFailed = 0;
    for (const email of emailsToSend) {
      try {
        await sendEmail({
          to: email.to,
          template: "shoot_reminder",
          vars: {
            clientName: email.clientName,
            studioName: email.studioName,
            date: email.date,
            time: email.time || undefined,
            location: email.location || undefined,
            customMessage: `Estamos ansiosos para o nosso ensaio${email.date ? ` no dia ${email.date}` : ""}! Qualquer dúvida, estamos à disposição.`,
          },
        });
        emailsSent++;
      } catch (error) {
        emailsFailed++;
        console.error(`Shoot reminder email error (${email.to}):`, error);
      }
    }

    return apiSuccess({
      shootsChecked: upcomingShoots.length,
      remindersSent: notificationsToCreate.length,
      emailsSent,
      emailsFailed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron send-reminders error:", error);
    return apiError("Erro ao enviar lembretes", 500);
  }
}
