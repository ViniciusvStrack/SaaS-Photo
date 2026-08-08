import { NextRequest } from "next/server";
import { db } from "@/db";
import { clients, shoots, galleries, blogPosts, proposals, contracts, tasks, invoices } from "@/db/schema";
import { eq, and, ilike, isNull, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, getQueryParam } from "@/lib/api-utils";

interface SearchResult {
  type: "client" | "shoot" | "gallery" | "blog" | "proposal" | "contract" | "task" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  link: string;
}

// GET /api/search?q=marina - Global search across all entities
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const q = getQueryParam(req, "q");
    if (!q || q.length < 2) {
      return apiSuccess({ results: [], query: q || "" });
    }

    const searchPattern = `%${q}%`;
    const results: SearchResult[] = [];

    // Search clients
    const clientResults = await db
      .select({ id: clients.id, name: clients.name, email: clients.email, status: clients.status })
      .from(clients)
      .where(and(
        eq(clients.studioId, user.studioId),
        isNull(clients.deletedAt),
        or(ilike(clients.name, searchPattern), ilike(clients.email, searchPattern))
      ))
      .limit(5);

    for (const c of clientResults) {
      results.push({
        type: "client",
        id: c.id,
        title: c.name,
        subtitle: c.email || "Sem email",
        status: c.status,
        link: "/app/clients",
      });
    }

    // Search shoots
    const shootResults = await db
      .select({ id: shoots.id, name: shoots.name, clientName: shoots.clientName, status: shoots.status, date: shoots.date })
      .from(shoots)
      .where(and(
        eq(shoots.studioId, user.studioId),
        isNull(shoots.deletedAt),
        or(ilike(shoots.name, searchPattern), ilike(shoots.clientName, searchPattern))
      ))
      .limit(5);

    for (const s of shootResults) {
      results.push({
        type: "shoot",
        id: s.id,
        title: s.name,
        subtitle: `${s.clientName || ""} • ${s.date || ""}`,
        status: s.status,
        link: "/app/shoots",
      });
    }

    // Search galleries
    const galleryResults = await db
      .select({ id: galleries.id, name: galleries.name, clientName: galleries.clientName, status: galleries.status })
      .from(galleries)
      .where(and(
        eq(galleries.studioId, user.studioId),
        isNull(galleries.deletedAt),
        or(ilike(galleries.name, searchPattern), ilike(galleries.clientName, searchPattern))
      ))
      .limit(5);

    for (const g of galleryResults) {
      results.push({
        type: "gallery",
        id: g.id,
        title: g.name,
        subtitle: g.clientName || "",
        status: g.status,
        link: "/app/galleries",
      });
    }

    // Search blog posts
    const blogResults = await db
      .select({ id: blogPosts.id, title: blogPosts.title, category: blogPosts.category, status: blogPosts.status })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.studioId, user.studioId),
        ilike(blogPosts.title, searchPattern)
      ))
      .limit(5);

    for (const b of blogResults) {
      results.push({
        type: "blog",
        id: b.id,
        title: b.title,
        subtitle: b.category || "Sem categoria",
        status: b.status,
        link: "/app/blog",
      });
    }

    // Search proposals
    const proposalResults = await db
      .select({ id: proposals.id, clientName: proposals.clientName, service: proposals.service, status: proposals.status, total: proposals.total })
      .from(proposals)
      .where(and(
        eq(proposals.studioId, user.studioId),
        or(ilike(proposals.clientName, searchPattern), ilike(proposals.service, searchPattern))
      ))
      .limit(5);

    for (const p of proposalResults) {
      results.push({
        type: "proposal",
        id: p.id,
        title: `Proposta — ${p.clientName || ""}`,
        subtitle: `${p.service || ""} • R$ ${((p.total || 0) / 100).toFixed(2)}`,
        status: p.status,
        link: "/app/proposals",
      });
    }

    // Search contracts
    const contractResults = await db
      .select({ id: contracts.id, title: contracts.title, clientName: contracts.clientName, status: contracts.status })
      .from(contracts)
      .where(and(
        eq(contracts.studioId, user.studioId),
        or(ilike(contracts.clientName, searchPattern), ilike(contracts.title, searchPattern))
      ))
      .limit(5);

    for (const ct of contractResults) {
      results.push({
        type: "contract",
        id: ct.id,
        title: ct.title,
        subtitle: ct.clientName || "",
        status: ct.status,
        link: "/app/contracts",
      });
    }

    // Search tasks
    const taskResults = await db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status, priority: tasks.priority })
      .from(tasks)
      .where(and(
        eq(tasks.studioId, user.studioId),
        ilike(tasks.title, searchPattern)
      ))
      .limit(5);

    for (const t of taskResults) {
      results.push({
        type: "task",
        id: t.id,
        title: t.title,
        subtitle: `${t.priority} priority`,
        status: t.status,
        link: "/app/tasks",
      });
    }

    return apiSuccess({
      results,
      query: q,
      total: results.length,
    });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Search error:", error);
    return apiError("Erro na busca", 500);
  }
}
