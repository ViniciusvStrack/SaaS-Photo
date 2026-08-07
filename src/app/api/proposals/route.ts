import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposals, proposalItems, clients } from "@/db/schema";
import { eq, and, desc, asc, ilike, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { proposalSchema } from "@/lib/validations";

// GET /api/proposals - List proposals
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [eq(proposals.studioId, user.studioId)];
    
    if (search) {
      conditions.push(ilike(proposals.clientName, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(proposals.status, status as "draft" | "sent" | "accepted" | "declined" | "expired"));
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(proposals)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(proposals)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(proposals.createdAt) : desc(proposals.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar propostas", 500);
  }
}

// POST /api/proposals - Create proposal
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, proposalSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    // Get client name
    let clientName = data.clientName;
    if (!clientName && data.clientId) {
      const [client] = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, data.clientId))
        .limit(1);
      clientName = client?.name;
    }

    // Calculate totals
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discount = data.discount || 0;
    const total = subtotal - discount;

    // Create proposal
    const [proposal] = await db
      .insert(proposals)
      .values({
        studioId: user.studioId,
        clientId: data.clientId,
        clientName: clientName || "",
        shootId: data.shootId || null,
        service: data.service,
        packageName: data.package || null,
        subtotal,
        discount,
        total,
        validUntil: data.validUntil,
        notes: data.notes || null,
        status: data.status || "draft",
      })
      .returning();

    // Create proposal items
    if (data.items.length > 0) {
      await db.insert(proposalItems).values(
        data.items.map((item, index) => ({
          proposalId: proposal.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          order: index,
        }))
      );
    }

    await createAuditLog(user.userId, user.studioId, "create", "proposal", proposal.id, { clientName, total }, req);

    return apiCreated(proposal);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating proposal:", error);
    return apiError("Erro ao criar proposta", 500);
  }
}
