import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients, auditLogs } from "@/db/schema";
import { eq, and, isNull, ilike, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

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

    let query = db.select().from(clients).where(and(...conditions)).orderBy(desc(clients.createdAt));

    const results = await query;

    // Filter by search in JS (simpler for now)
    const filtered = search
      ? results.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())))
      : results;

    return apiSuccess(filtered);
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
      status: data.status,
      type: data.type || null,
      notes: data.notes || null,
      tags: data.tags,
      birthday: data.birthday || null,
      instagram: data.instagram || null,
      referralSource: data.referralSource || null,
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: session.userId,
      studioId: session.studioId,
      action: "client.created",
      entity: "client",
      entityId: client.id,
      metadata: { name: data.name },
    });

    return apiSuccess(client, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
