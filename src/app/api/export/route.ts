import { NextRequest } from "next/server";
import { db } from "@/db";
import { clients, shoots, galleries, invoices, proposals, contracts, tasks } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, getQueryParam, createAuditLog } from "@/lib/api-utils";

// GET /api/export?type=clients&format=json - Export studio data
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const exportType = getQueryParam(req, "type") || "all";
    const format = getQueryParam(req, "format") || "json";

    const studioFilter = eq(clients.studioId, user.studioId);

    const exportData: Record<string, unknown> = {};

    if (exportType === "all" || exportType === "clients") {
      exportData.clients = await db.select().from(clients)
        .where(eq(clients.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "shoots") {
      exportData.shoots = await db.select().from(shoots)
        .where(eq(shoots.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "galleries") {
      exportData.galleries = await db.select().from(galleries)
        .where(eq(galleries.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "invoices") {
      exportData.invoices = await db.select().from(invoices)
        .where(eq(invoices.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "proposals") {
      exportData.proposals = await db.select().from(proposals)
        .where(eq(proposals.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "contracts") {
      exportData.contracts = await db.select().from(contracts)
        .where(eq(contracts.studioId, user.studioId));
    }

    if (exportType === "all" || exportType === "tasks") {
      exportData.tasks = await db.select().from(tasks)
        .where(eq(tasks.studioId, user.studioId));
    }

    await createAuditLog(user.userId, user.studioId, "export", "data", exportType, { format }, req);

    if (format === "csv" && exportType !== "all") {
      // Convert to CSV
      const data = exportData[exportType] as Record<string, unknown>[];
      if (!data || !data.length) {
        return apiSuccess({ csv: "", count: 0 });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map(row =>
          headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          }).join(",")
        ),
      ];

      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${exportType}_export_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return apiSuccess({
      ...exportData,
      exportedAt: new Date().toISOString(),
      type: exportType,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Export error:", error);
    return apiError("Erro ao exportar dados", 500);
  }
}
