import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, proposals, contracts, invoices, notifications } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/client/dashboard - Client portal dashboard
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "client") {
      return apiError("Acesso negado", 403);
    }

    // Get galleries for this client
    const clientGalleries = await db
      .select({ id: galleries.id, name: galleries.name, status: galleries.status, createdAt: galleries.createdAt })
      .from(galleries)
      .where(eq(galleries.clientId, user.userId))
      .orderBy(desc(galleries.createdAt))
      .limit(5);

    // Get proposals
    const clientProposals = await db
      .select()
      .from(proposals)
      .where(and(eq(proposals.clientId, user.userId), eq(proposals.status, "sent")))
      .orderBy(desc(proposals.createdAt))
      .limit(5);

    // Get contracts
    const clientContracts = await db
      .select()
      .from(contracts)
      .where(and(eq(contracts.clientId, user.userId), eq(contracts.status, "sent")))
      .orderBy(desc(contracts.createdAt))
      .limit(5);

    // Get pending invoices
    const clientInvoices = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.clientId, user.userId), eq(invoices.status, "pending")))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    // Get notifications
    const clientNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(10);

    const [unreadCount] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.userId), eq(notifications.isRead, false)));

    return apiSuccess({
      galleries: clientGalleries,
      pendingProposals: clientProposals,
      pendingContracts: clientContracts,
      pendingInvoices: clientInvoices,
      notifications: clientNotifs,
      unreadNotifications: unreadCount?.count || 0,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar dashboard", 500);
  }
}
