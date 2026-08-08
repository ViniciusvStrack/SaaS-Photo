import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, and, isNull, ilike, desc, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { createAuditLog } from "@/lib/api-utils";

const createClientSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional().default("lead"),
  type: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  birthday: z.string().optional(),
  instagram: z.string().optional(),
  referralSource: z.string().optional(),
});

// GET /api/clients - Optimized query with selective columns
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const conditions = [
      eq(clients.studioId, session.studioId || ""),
      isNull(clients.deletedAt),
    ];

    if (status && status !== "all") {
      conditions.push(eq(clients.status, status));
    }

    // Use DB-level search instead of JS filtering
    if (search) {
      conditions.push(
        or(
          ilike(clients.name, `%${search}%`),
          ilike(clients.email, `%${search}%`)
        )!
      );
    }

    // Select only needed columns for list view (much faster than SELECT *)
    const results = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        city: clients.city,
        status: clients.status,
        type: clients.type,
        tags: clients.tags,
        totalRevenue: clients.totalRevenue,
        shootCount: clients.shootCount,
        instagram: clients.instagram,
        referralSource: clients.referralSource,
        birthday: clients.birthday,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .where(and(...conditions))
      .orderBy(desc(clients.createdAt));

    return apiSuccess(results);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = createClientSchema.parse(body);

    const [client] = await db.insert(clients).values({
      studioId: session.studioId || "",
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      status: data.status || "lead",
      type: data.type || null,
      notes: data.notes || null,
      tags: data.tags || [],
      birthday: data.birthday || null,
      instagram: data.instagram || null,
      referralSource: data.referralSource || null,
    }).returning();

    await createAuditLog(session.userId, session.studioId || "", "create", "client", client.id, { name: data.name }, req);

    return apiSuccess(client);
  } catch (error) {
    return handleApiError(error);
  }
}
