import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().min(1, "Email obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return apiError("Email ou senha incorretos", 401);
    }

    if (!user.isActive) {
      return apiError("Conta desativada. Entre em contato com o suporte.", 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError("Email ou senha incorretos", 401);
    }

    // Get studio info if photographer
    let studioId: string | undefined;
    if (user.studioId) {
      studioId = user.studioId;
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      studioId,
    });

    await setSessionCookie(token);

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Return user data (no password hash)
    const { passwordHash: _, ...userData } = user;

    // Get studio data if applicable
    let studioData = null;
    if (studioId) {
      const [studio] = await db.select().from(studios).where(eq(studios.id, studioId)).limit(1);
      studioData = studio || null;
    }

    return apiSuccess({
      user: userData,
      studio: studioData,
      token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
