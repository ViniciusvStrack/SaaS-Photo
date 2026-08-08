import { NextRequest } from "next/server";
import { db } from "@/db";
import { clients, proposals, contracts, invoices, shoots } from "@/db/schema";
import { eq, and, count, sum, sql, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";

// GET /api/analytics/funnel - Conversion funnel analytics
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const sid = user.studioId;

    // Stage 1: Leads (clients with status = lead)
    const [leads] = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), eq(clients.status, "lead"), isNull(clients.deletedAt)));

    // Stage 2: Negotiation
    const [negotiation] = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), eq(clients.status, "negotiation"), isNull(clients.deletedAt)));

    // Stage 3: Proposals sent
    const [proposalsSent] = await db.select({ count: count() }).from(proposals)
      .where(and(eq(proposals.studioId, sid), eq(proposals.status, "sent")));

    // Stage 4: Proposals accepted
    const [proposalsAccepted] = await db.select({ count: count() }).from(proposals)
      .where(and(eq(proposals.studioId, sid), eq(proposals.status, "accepted")));

    // Stage 5: Contracts signed
    const [contractsSigned] = await db.select({ count: count() }).from(contracts)
      .where(and(eq(contracts.studioId, sid), eq(contracts.status, "signed")));

    // Stage 6: Shoots completed
    const [shootsDelivered] = await db.select({ count: count() }).from(shoots)
      .where(and(eq(shoots.studioId, sid), eq(shoots.status, "delivered"), isNull(shoots.deletedAt)));

    // Stage 7: Fully paid
    const [shootsPaid] = await db.select({ count: count() }).from(shoots)
      .where(and(eq(shoots.studioId, sid), eq(shoots.status, "paid"), isNull(shoots.deletedAt)));

    // Total clients
    const [totalClients] = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), isNull(clients.deletedAt)));

    // Total proposals
    const [totalProposals] = await db.select({ count: count() }).from(proposals)
      .where(eq(proposals.studioId, sid));

    // Total declined
    const [proposalsDeclined] = await db.select({ count: count() }).from(proposals)
      .where(and(eq(proposals.studioId, sid), eq(proposals.status, "declined")));

    // Conversion rates
    const totalP = totalProposals?.count || 0;
    const accepted = proposalsAccepted?.count || 0;
    const conversionRate = totalP > 0 ? ((accepted / totalP) * 100) : 0;

    const totalC = totalClients?.count || 0;
    const recurring = await db.select({ count: count() }).from(clients)
      .where(and(eq(clients.studioId, sid), eq(clients.status, "recurring"), isNull(clients.deletedAt)));

    const retentionRate = totalC > 0 ? (((recurring[0]?.count || 0) / totalC) * 100) : 0;

    return apiSuccess({
      funnel: [
        { stage: "Leads", count: leads?.count || 0, color: "#64748b" },
        { stage: "Em Negociação", count: negotiation?.count || 0, color: "#3b82f6" },
        { stage: "Propostas Enviadas", count: proposalsSent?.count || 0, color: "#8b5cf6" },
        { stage: "Propostas Aceitas", count: accepted, color: "#22c55e" },
        { stage: "Contratos Assinados", count: contractsSigned?.count || 0, color: "#c9a96e" },
        { stage: "Ensaios Entregues", count: shootsDelivered?.count || 0, color: "#10b981" },
        { stage: "Pagos", count: shootsPaid?.count || 0, color: "#059669" },
      ],
      metrics: {
        conversionRate: Math.round(conversionRate * 10) / 10,
        retentionRate: Math.round(retentionRate * 10) / 10,
        totalClients: totalC,
        totalProposals: totalP,
        proposalsAccepted: accepted,
        proposalsDeclined: proposalsDeclined?.count || 0,
        recurringClients: recurring[0]?.count || 0,
      },
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Funnel analytics error:", error);
    return apiError("Erro ao buscar funil", 500);
  }
}
