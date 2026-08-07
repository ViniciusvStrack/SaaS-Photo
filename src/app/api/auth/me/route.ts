import { db } from "@/db";
import { users, studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Não autenticado", 401);
    }

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
      phone: users.phone,
      isActive: users.isActive,
      studioId: users.studioId,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user) {
      return apiError("Usuário não encontrado", 404);
    }

    let studioData = null;
    if (user.studioId) {
      const [studio] = await db.select().from(studios).where(eq(studios.id, user.studioId)).limit(1);
      studioData = studio || null;
    }

    return apiSuccess({ user, studio: studioData });
  } catch (error) {
    return handleApiError(error);
  }
}
