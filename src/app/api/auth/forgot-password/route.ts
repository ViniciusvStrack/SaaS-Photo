import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError, validateBody } from "@/lib/api-utils";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { sendEmail, getAppUrl } from "@/lib/integrations/email-sender";

// POST /api/auth/forgot-password - Request password reset
export async function POST(req: NextRequest) {
  try {
    const validation = await validateBody(req, forgotPasswordSchema);
    if (validation.error) return validation.error;

    const { email } = validation.data;

    // Check if user exists (don't reveal if email exists for security)
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (user) {
      try {
        // Secure token with 1h expiry — only the hash is stored
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

        await db.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt,
        });

        const resetLink = `${getAppUrl()}/reset-password?token=${token}`;
        await sendEmail({
          to: user.email,
          template: "password_reset",
          vars: { clientName: user.name, resetLink },
        });
      } catch (error) {
        // Log but never leak to the client (anti-enumeration preserved)
        console.error("Forgot password email error:", error);
      }
    }

    return apiSuccess({
      message: "Se este email estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("Erro ao processar solicitação", 500);
  }
}
