import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { apiSuccess, apiError, validateBody } from "@/lib/api-utils";
import { resetPasswordSchema } from "@/lib/validations";
import { hashResetToken, isResetTokenExpired } from "@/lib/reset-token";

// POST /api/auth/reset-password - Define nova senha com token válido
export async function POST(req: NextRequest) {
  try {
    const validation = await validateBody(req, resetPasswordSchema);
    if (validation.error) return validation.error;

    const { token, password } = validation.data;

    // Look up by token hash (never store/compare raw tokens)
    const [reset] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
      })
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.tokenHash, hashResetToken(token)),
        isNull(passwordResetTokens.usedAt)
      ))
      .limit(1);

    if (!reset || isResetTokenExpired(reset.expiresAt)) {
      return apiError("Link inválido ou expirado. Solicite uma nova redefinição de senha.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, reset.userId));
      // Token is single-use
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, reset.id));
    });

    return apiSuccess({
      message: "Senha redefinida com sucesso. Faça login com a nova senha.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return apiError("Erro ao redefinir senha", 500);
  }
}
