import { NextRequest } from "next/server";
import { db } from "@/db";
import { contracts, clients } from "@/db/schema";
import { eq, and, desc, asc, ilike, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { contractSchema } from "@/lib/validations";

// GET /api/contracts - List contracts
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [eq(contracts.studioId, user.studioId)];
    
    if (search) {
      conditions.push(ilike(contracts.clientName, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(contracts.status, status as "draft" | "sent" | "signed" | "completed" | "cancelled"));
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(contracts)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(contracts)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(contracts.createdAt) : desc(contracts.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar contratos", 500);
  }
}

// POST /api/contracts - Create contract
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, contractSchema);
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

    const [contract] = await db
      .insert(contracts)
      .values({
        studioId: user.studioId,
        clientId: data.clientId,
        clientName: clientName || "",
        proposalId: data.proposalId || null,
        shootId: data.shootId || null,
        title: data.title,
        service: data.service,
        value: data.value,
        terms: data.terms,
        clauses: data.clauses || [],
        status: data.status || "draft",
      })
      .returning();

    await createAuditLog(user.userId, user.studioId, "create", "contract", contract.id, { title: data.title, value: data.value }, req);

    return apiCreated(contract);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating contract:", error);
    return apiError("Erro ao criar contrato", 500);
  }
}
