import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { apiSuccess, apiError, validateBody, createAuditLog } from "@/lib/api-utils";
import { adminUserUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/users/[id] - Get user details (admin only)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await params;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        phone: users.phone,
        avatar: users.avatar,
        studioId: users.studioId,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return apiError("Usuário não encontrado", 404);
    }

    return apiSuccess(user);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao buscar usuário", 500);
  }
}

// PATCH /api/admin/users/[id] - Update user (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await params;

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!existing) {
      return apiError("Usuário não encontrado", 404);
    }

    const validation = await validateBody(req, adminUserUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.role !== undefined) updateData.role = data.role;

    const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning({
      id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive,
    });

    await createAuditLog(admin.userId, null, "update", "user", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, (error as any).status || 401);
    }
    return apiError("Erro ao atualizar usuário", 500);
  }
}
