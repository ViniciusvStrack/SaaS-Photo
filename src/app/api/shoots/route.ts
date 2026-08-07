import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { shoots, shootChecklist, auditLogs } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

const createShootSchema = z.object({
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  type: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(["lead", "confirmed", "photographed", "editing", "delivered", "paid", "cancelled"]).optional().default("confirmed"),
  value: z.number().optional().default(0),
  packageName: z.string().optional(),
  notes: z.string().optional(),
  briefing: z.string().optional(),
  deliveryDeadline: z.string().optional(),
  checklist: z.array(z.object({ item: z.string(), done: z.boolean() })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const conditions = [
      eq(shoots.studioId, session.studioId || ""),
      isNull(shoots.deletedAt),
    ];

    if (status && status !== "all") {
      conditions.push(eq(shoots.status, status as "lead" | "confirmed" | "photographed" | "editing" | "delivered" | "paid" | "cancelled"));
    }

    const results = await db.select().from(shoots)
      .where(and(...conditions))
      .orderBy(desc(shoots.date));

    return apiSuccess(results);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = createShootSchema.parse(body);

    const [shoot] = await db.insert(shoots).values({
      studioId: session.studioId || "",
      clientId: data.clientId || null,
      clientName: data.clientName || null,
      name: data.name,
      type: data.type || null,
      date: data.date || null,
      time: data.time || null,
      endTime: data.endTime || null,
      location: data.location || null,
      status: data.status,
      value: data.value,
      packageName: data.packageName || null,
      notes: data.notes || null,
      briefing: data.briefing || null,
      deliveryDeadline: data.deliveryDeadline || null,
    }).returning();

    // Create checklist items
    if (data.checklist && data.checklist.length > 0) {
      await db.insert(shootChecklist).values(
        data.checklist.map((item, i) => ({
          shootId: shoot.id,
          item: item.item,
          done: item.done,
          order: i,
        }))
      );
    }

    await db.insert(auditLogs).values({
      userId: session.userId,
      studioId: session.studioId,
      action: "shoot.created",
      entity: "shoot",
      entityId: shoot.id,
      metadata: { name: data.name },
    });

    return apiSuccess(shoot, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
