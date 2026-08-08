import { NextRequest } from "next/server";
import { db } from "@/db";
import { studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, validateBody, createAuditLog } from "@/lib/api-utils";
import { studioSettingsSchema } from "@/lib/validations";

// GET /api/settings/studio - Get studio settings
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const [studio] = await db.select().from(studios).where(eq(studios.id, user.studioId)).limit(1);

    if (!studio) {
      return apiError("Estúdio não encontrado", 404);
    }

    return apiSuccess(studio);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar configurações", 500);
  }
}

// PATCH /api/settings/studio - Update studio settings
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, studioSettingsSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.specialty !== undefined) updateData.specialty = data.specialty;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.brandColor !== undefined) updateData.brandColor = data.brandColor;

    const [updated] = await db.update(studios).set(updateData).where(eq(studios.id, user.studioId)).returning();

    await createAuditLog(user.userId, user.studioId, "update", "studio", user.studioId, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar configurações", 500);
  }
}
