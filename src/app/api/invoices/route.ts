import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices, clients } from "@/db/schema";
import { eq, and, desc, asc, ilike, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { invoiceSchema } from "@/lib/validations";

// GET /api/invoices - List invoices
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [eq(invoices.studioId, user.studioId)];
    
    if (search) {
      conditions.push(ilike(invoices.clientName, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(invoices.status, status as "pending" | "paid" | "overdue" | "cancelled" | "refunded"));
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(invoices)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(invoices.dueDate) : desc(invoices.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar faturas", 500);
  }
}

// POST /api/invoices - Create invoice
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, invoiceSchema);
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

    const [invoice] = await db
      .insert(invoices)
      .values({
        studioId: user.studioId,
        clientId: data.clientId,
        clientName: clientName || "",
        shootId: data.shootId || null,
        contractId: data.contractId || null,
        description: data.description,
        total: data.amount,
        dueDate: data.dueDate,
        status: data.status || "pending",
      })
      .returning();

    await createAuditLog(user.userId, user.studioId, "create", "invoice", invoice.id, { amount: data.amount }, req);

    return apiCreated(invoice);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating invoice:", error);
    return apiError("Erro ao criar fatura", 500);
  }
}
