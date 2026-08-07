import { NextRequest } from "next/server";
import { db } from "@/db";
import { automations } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { automationSchema } from "@/lib/validations";

// GET /api/automations - List automations
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const [countResult] = await db
      .select({ total: count() })
      .from(automations)
      .where(eq(automations.studioId, user.studioId));

    const data = await db
      .select()
      .from(automations)
      .where(eq(automations.studioId, user.studioId))
      .orderBy(desc(automations.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar automações", 500);
  }
}

// POST /api/automations - Create automation
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, automationSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const [automation] = await db
      .insert(automations)
      .values({
        studioId: user.studioId,
        name: data.name,
        trigger: data.trigger,
        triggerConfig: data.triggerConfig || {},
        channel: data.channel || "email",
        subject: data.subject || null,
        message: data.message || null,
        isActive: data.isActive ?? true,
      })
      .returning();

    await createAuditLog(user.userId, user.studioId, "create", "automation", automation.id, { name: data.name }, req);

    return apiCreated(automation);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao criar automação", 500);
  }
}
