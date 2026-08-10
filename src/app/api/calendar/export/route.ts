import { NextRequest } from "next/server";
import { db } from "@/db";
import { shoots } from "@/db/schema";
import { eq, and, isNull, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiError } from "@/lib/api-utils";

// GET /api/calendar/export — Export shoots as ICS calendar file
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const today = new Date().toISOString().split("T")[0];

    // Get all future confirmed/scheduled shoots
    const allShoots = await db
      .select()
      .from(shoots)
      .where(and(
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt),
        gte(shoots.date, today)
      ))
      .orderBy(shoots.date);

    // Generate ICS content
    const icsLines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NoirFrame//SaaS//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:NoirFrame - Agenda",
      "X-WR-TIMEZONE:America/Sao_Paulo",
    ];

    for (const shoot of allShoots) {
      if (!shoot.date) continue;

      const [year, month, day] = shoot.date.split("-");
      const startTime = shoot.time || "09:00";
      const endTime = shoot.endTime || addHours(startTime, 3);
      const [sh, sm] = startTime.split(":");
      const [eh, em] = endTime.split(":");

      const dtStart = `${year}${month}${day}T${sh}${sm}00`;
      const dtEnd = `${year}${month}${day}T${eh}${em}00`;

      const uid = `${shoot.id}@noirframe.app`;
      const summary = escapeICS(shoot.name);
      const description = escapeICS([
        shoot.clientName ? `Cliente: ${shoot.clientName}` : "",
        shoot.type ? `Tipo: ${shoot.type}` : "",
        shoot.value ? `Valor: R$ ${(shoot.value / 100).toFixed(2)}` : "",
        shoot.packageName ? `Pacote: ${shoot.packageName}` : "",
        shoot.notes || "",
      ].filter(Boolean).join("\\n"));

      const location = shoot.location ? escapeICS(shoot.location) : "";
      const status = shoot.status === "confirmed" ? "CONFIRMED" : "TENTATIVE";

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTART;TZID=America/Sao_Paulo:${dtStart}`,
        `DTEND;TZID=America/Sao_Paulo:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        location ? `LOCATION:${location}` : "",
        `STATUS:${status}`,
        `CATEGORIES:${shoot.type || "Fotografia"}`,
        "BEGIN:VALARM",
        "TRIGGER:-P1D",
        "ACTION:DISPLAY",
        `DESCRIPTION:Amanhã: ${summary}`,
        "END:VALARM",
        "BEGIN:VALARM",
        "TRIGGER:-PT2H",
        "ACTION:DISPLAY",
        `DESCRIPTION:Em 2 horas: ${summary}`,
        "END:VALARM",
        "END:VEVENT",
      );
    }

    icsLines.push("END:VCALENDAR");

    const icsContent = icsLines.filter(Boolean).join("\r\n");

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=noirframe-agenda.ics",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Calendar export error:", error);
    return apiError("Erro ao exportar calendário", 500);
  }
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const newH = Math.min(h + hours, 23);
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
