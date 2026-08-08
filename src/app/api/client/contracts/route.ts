import { NextRequest } from "next/server";
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/client/contracts - List contracts for logged-in client
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const data = await db
      .select()
      .from(contracts)
      .where(eq(contracts.clientId, user.userId))
      .orderBy(desc(contracts.createdAt));

    return apiSuccess(data);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar contratos", 500);
  }
}
