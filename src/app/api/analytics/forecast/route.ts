import { NextRequest } from "next/server";
import { db } from "@/db";
import { invoices, shoots, proposals } from "@/db/schema";
import { eq, and, sum, sql, gte, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { cached, CACHE_TTL } from "@/lib/server-cache";

// GET /api/analytics/forecast — Revenue forecast for next 3 months
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const studioId = user.studioId;
    const cacheKey = `forecast:${studioId}`;

    const data = await cached(cacheKey, async () => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Get historical monthly revenue (paid) for last 6 months
      const history = await db
        .select({
          month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`,
          total: sum(invoices.total),
        })
        .from(invoices)
        .where(and(
          eq(invoices.studioId, studioId),
          eq(invoices.status, "paid"),
          gte(invoices.createdAt, sixMonthsAgo)
        ))
        .groupBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${invoices.createdAt}, 'YYYY-MM')`);

      // Calculate average monthly revenue
      const monthlyValues = history.map(h => Number(h.total) || 0);
      const avgMonthly = monthlyValues.length > 0
        ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length
        : 0;

      // Growth rate (simple: last 3 months vs first 3 months)
      let growthRate = 0;
      if (monthlyValues.length >= 4) {
        const half = Math.floor(monthlyValues.length / 2);
        const firstHalf = monthlyValues.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const secondHalf = monthlyValues.slice(half).reduce((a, b) => a + b, 0) / (monthlyValues.length - half);
        growthRate = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) : 0;
      }

      // Pending revenue (confirmed shoots + pending invoices)
      const [pendingInvoices] = await db
        .select({ total: sum(invoices.total) })
        .from(invoices)
        .where(and(
          eq(invoices.studioId, studioId),
          sql`${invoices.status} IN ('pending', 'overdue')`
        ));

      const [confirmedShoots] = await db
        .select({
          total: sum(shoots.value),
          count: count(),
        })
        .from(shoots)
        .where(and(
          eq(shoots.studioId, studioId),
          sql`${shoots.status} IN ('confirmed', 'lead')`,
          sql`${shoots.deletedAt} IS NULL`
        ));

      // Accepted proposals not yet invoiced
      const [acceptedProposals] = await db
        .select({ total: sum(proposals.total) })
        .from(proposals)
        .where(and(
          eq(proposals.studioId, studioId),
          eq(proposals.status, "accepted")
        ));

      // Forecast next 3 months using trend
      const forecast = [];
      for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date(now);
        forecastDate.setMonth(forecastDate.getMonth() + i);
        const monthKey = forecastDate.toISOString().slice(0, 7);
        const monthName = forecastDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

        // Predicted = average * (1 + growth_rate)^i
        const predicted = Math.round(avgMonthly * Math.pow(1 + growthRate, i));

        // Confidence decreases with distance
        const confidence = Math.max(0.3, 0.85 - (i - 1) * 0.15);

        forecast.push({
          month: monthKey,
          monthName,
          predicted,
          optimistic: Math.round(predicted * 1.2),
          pessimistic: Math.round(predicted * 0.8),
          confidence,
        });
      }

      // Revenue pipeline
      const pendingTotal = Number(pendingInvoices?.total) || 0;
      const confirmedTotal = Number(confirmedShoots?.total) || 0;
      const proposalTotal = Number(acceptedProposals?.total) || 0;

      return {
        historicalMonthly: history.map(h => ({
          month: h.month,
          total: Number(h.total) || 0,
        })),
        averageMonthly: Math.round(avgMonthly),
        growthRate: Math.round(growthRate * 100 * 10) / 10, // percentage with 1 decimal
        forecast,
        pipeline: {
          pendingInvoices: pendingTotal,
          confirmedShoots: confirmedTotal,
          acceptedProposals: proposalTotal,
          totalPipeline: pendingTotal + confirmedTotal + proposalTotal,
        },
        insights: generateInsights(avgMonthly, growthRate, pendingTotal, confirmedTotal, monthlyValues),
      };
    }, CACHE_TTL.LONG);

    return apiSuccess(data);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Forecast error:", error);
    return apiError("Erro ao calcular previsão", 500);
  }
}

function generateInsights(
  avgMonthly: number,
  growthRate: number,
  pending: number,
  confirmed: number,
  history: number[]
): string[] {
  const insights: string[] = [];

  if (growthRate > 0.1) {
    insights.push(`📈 Sua receita está crescendo ${Math.round(growthRate * 100)}% — excelente tendência!`);
  } else if (growthRate < -0.1) {
    insights.push(`📉 Sua receita caiu ${Math.abs(Math.round(growthRate * 100))}% — considere novas estratégias de captação.`);
  } else {
    insights.push(`📊 Sua receita está estável nos últimos meses.`);
  }

  if (pending > avgMonthly * 0.5) {
    insights.push(`⚠️ Você tem R$ ${(pending / 100).toLocaleString("pt-BR")} em cobranças pendentes — considere enviar lembretes.`);
  }

  if (confirmed > avgMonthly) {
    insights.push(`🎯 Ensaios confirmados totalizam R$ ${(confirmed / 100).toLocaleString("pt-BR")} — pipeline saudável!`);
  }

  if (history.length >= 3) {
    const lastMonth = history[history.length - 1];
    const prevMonth = history[history.length - 2];
    if (lastMonth > prevMonth * 1.3) {
      insights.push(`🔥 Último mês foi ${Math.round(((lastMonth - prevMonth) / prevMonth) * 100)}% melhor que o anterior!`);
    }
  }

  if (avgMonthly > 0) {
    insights.push(`💰 Sua média mensal é R$ ${(avgMonthly / 100).toLocaleString("pt-BR")}`);
  }

  return insights;
}
