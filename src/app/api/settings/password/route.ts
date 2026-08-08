import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { apiSuccess, apiError, validateBody, createAuditLog } from "@/lib/api-utils";
import { changePasswordSchema } from "@/lib/validations";

// POST /api/settings/password - Change password
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const validation = await validateBody(req, changePasswordSchema);
    if (validation.error) return validation.error;

    const { currentPassword, newPassword } = validation.data;

    // Get current password hash
    const [dbUser] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!dbUser) {
      return apiError("Usuário não encontrado", 404);
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return apiError("Senha atual incorreta", 400);
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    await db.update(users).set({
      passwordHash: newHash,
      updatedAt: new Date(),
    }).where(eq(users.id, user.userId));

    await createAuditLog(user.userId, user.studioId || null, "password_change", "user", user.userId, {}, req);

    return apiSuccess({ message: "Senha alterada com sucesso" });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao alterar senha", 500);
  }
}
