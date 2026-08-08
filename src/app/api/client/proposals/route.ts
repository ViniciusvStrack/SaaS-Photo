import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/client/proposals - List proposals for logged-in client
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const data = await db
      .select()
      .from(proposals)
      .where(eq(proposals.clientId, user.userId))
      .orderBy(desc(proposals.createdAt));

    // Get items for each proposal
    const result = await Promise.all(
      data.map(async (proposal) => {
        const items = await db
          .select()
          .from(proposalItems)
          .where(eq(proposalItems.proposalId, proposal.id))
          .orderBy(proposalItems.order);
        return { ...proposal, items };
      })
    );

    return apiSuccess(result);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar propostas", 500);
  }
}
