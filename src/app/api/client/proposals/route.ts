import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/client/proposals - List proposals for logged-in client (N+1 fixed)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const data = await db
      .select()
      .from(proposals)
      .where(eq(proposals.clientId, user.userId))
      .orderBy(desc(proposals.createdAt));

    if (data.length === 0) {
      return apiSuccess([]);
    }

    // Batch fetch all items in one query instead of N+1
    const proposalIds = data.map(p => p.id);
    const allItems = await db
      .select()
      .from(proposalItems)
      .where(sql`${proposalItems.proposalId} IN (${sql.join(proposalIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(proposalItems.order);

    // Group items by proposal ID
    const itemsByProposal = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const existing = itemsByProposal.get(item.proposalId) || [];
      existing.push(item);
      itemsByProposal.set(item.proposalId, existing);
    }

    const result = data.map(proposal => ({
      ...proposal,
      items: itemsByProposal.get(proposal.id) || [],
    }));

    return apiSuccess(result);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar propostas", 500);
  }
}
