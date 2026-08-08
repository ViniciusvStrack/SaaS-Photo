import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";
import { apiSuccess, apiError, apiCreated, validateBody, createAuditLog } from "@/lib/api-utils";
import { registerSchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";

// POST /api/auth/register - Register new photographer
export async function POST(req: NextRequest) {
  try {
    const validation = await validateBody(req, registerSchema);
    if (validation.error) return validation.error;

    const { name, email, password, studioName } = validation.data;

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return apiError("Este email já está cadastrado", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create studio first
    const finalStudioName = studioName || `Estúdio de ${name}`;
    const studioSlug = `${slugify(finalStudioName)}-${Date.now().toString(36)}`;

    const [studio] = await db.insert(studios).values({
      ownerId: "temp",
      name: finalStudioName,
      slug: studioSlug,
      brandColor: "#c9a96e",
      planId: "starter",
      storageLimitMb: 10240, // 10GB starter
      storageUsedMb: 0,
    }).returning();

    // Create user
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      role: "photographer",
      studioId: studio.id,
      isActive: true,
    }).returning();

    // Update studio owner
    await db.update(studios).set({ ownerId: user.id }).where(eq(studios.id, studio.id));

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: "photographer",
      studioId: studio.id,
    });

    // Set cookie
    await setSessionCookie(token);

    await createAuditLog(user.id, studio.id, "create", "user", user.id, { email, studioName: finalStudioName }, req);

    return apiCreated({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      studio: {
        id: studio.id,
        name: studio.name,
        slug: studio.slug,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return apiError("Erro ao criar conta", 500);
  }
}
