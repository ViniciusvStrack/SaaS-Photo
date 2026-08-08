import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError, validateBody } from "@/lib/api-utils";
import { forgotPasswordSchema } from "@/lib/validations";

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
      // In production, would send email with reset link
      // For now, just log it
      console.log(`Password reset requested for: ${email}`);

      // Generate a simple reset token (in production, use crypto.randomBytes)
      const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64url");
      console.log(`Reset token (dev only): ${resetToken}`);
      console.log(`Reset link: /reset-password?token=${resetToken}`);
    }

    return apiSuccess({
      message: "Se este email estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("Erro ao processar solicitação", 500);
  }
}
