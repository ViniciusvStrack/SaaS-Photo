import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  birthday: z.string().optional(),
  instagram: z.string().optional(),
  referralSource: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [client] = await db.select().from(clients)
      .where(and(eq(clients.id, id), eq(clients.studioId, session.studioId || "")))
      .limit(1);

    if (!client) return apiError("Cliente não encontrado", 404);

    return apiSuccess(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = updateClientSchema.parse(body);

    const [existing] = await db.select().from(clients)
      .where(and(eq(clients.id, id), eq(clients.studioId, session.studioId || "")))
      .limit(1);

    if (!existing) return apiError("Cliente não encontrado", 404);

    const [updated] = await db.update(clients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();

    await db.insert(auditLogs).values({
      userId: session.userId,
      studioId: session.studioId,
      action: "client.updated",
      entity: "client",
      entityId: id,
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const [existing] = await db.select().from(clients)
      .where(and(eq(clients.id, id), eq(clients.studioId, session.studioId || "")))
      .limit(1);

    if (!existing) return apiError("Cliente não encontrado", 404);

    // Soft delete
    await db.update(clients)
      .set({ deletedAt: new Date() })
      .where(eq(clients.id, id));

    await db.insert(auditLogs).values({
      userId: session.userId,
      studioId: session.studioId,
      action: "client.deleted",
      entity: "client",
      entityId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
