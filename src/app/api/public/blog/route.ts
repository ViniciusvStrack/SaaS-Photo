import { NextRequest } from "next/server";
import { db } from "@/db";
import { blogPosts, studios } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { apiSuccess, apiPaginated, apiError, getQueryParams, getQueryParam } from "@/lib/api-utils";

// GET /api/public/blog - List published blog posts (public)
export async function GET(req: NextRequest) {
  try {
    const { page, pageSize } = getQueryParams(req);
    const offset = (page - 1) * pageSize;
    const studioSlug = getQueryParam(req, "studio");

    const conditions = [eq(blogPosts.status, "published")];

    // If studio slug is provided, filter by it
    if (studioSlug) {
      const [studio] = await db
        .select({ id: studios.id })
        .from(studios)
        .where(eq(studios.slug, studioSlug))
        .limit(1);

      if (studio) {
        conditions.push(eq(blogPosts.studioId, studio.id));
      }
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(and(...conditions));

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverUrl: blogPosts.coverUrl,
        category: blogPosts.category,
        tags: blogPosts.tags,
        viewCount: blogPosts.viewCount,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(posts, countResult?.total || 0, page, pageSize);
  } catch (error) {
    console.error("Error fetching public blog posts:", error);
    return apiError("Erro ao buscar posts", 500);
  }
}
