import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { shoots, shootChecklist } from "@/db/schema";
import { eq, and, isNull, desc, asc, ilike, count, gte, lte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, getQueryParams, getQueryParam, createAuditLog, handleApiError } from "@/lib/api-utils";

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
    const studioId = session.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder, startDate, endDate } = getQueryParams(req);
    const offset = (page - 1) * pageSize;
    const clientId = getQueryParam(req, "clientId");

    const conditions = [
      eq(shoots.studioId, studioId),
      isNull(shoots.deletedAt),
    ];

    if (status && status !== "all") {
      conditions.push(eq(shoots.status, status as "lead" | "confirmed" | "photographed" | "editing" | "delivered" | "paid" | "cancelled"));
    }

    if (search) {
      conditions.push(ilike(shoots.name, `%${search}%`));
    }

    if (clientId) {
      conditions.push(eq(shoots.clientId, clientId));
    }

    if (startDate) {
      conditions.push(gte(shoots.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(shoots.date, endDate));
    }

    // Count
    const [countResult] = await db
      .select({ total: count() })
      .from(shoots)
      .where(and(...conditions));

    // Data with pagination
    const results = await db
      .select()
      .from(shoots)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(shoots.date) : desc(shoots.date))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(results, countResult?.total || 0, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studioId = session.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const body = await req.json();
    const data = createShootSchema.parse(body);

    const [shoot] = await db.insert(shoots).values({
      studioId,
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

    await createAuditLog(session.userId, studioId, "create", "shoot", shoot.id, { name: data.name }, req);

    return apiSuccess(shoot);
  } catch (error) {
    return handleApiError(error);
  }
}
