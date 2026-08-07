import { NextRequest } from "next/server";
import { db } from "@/db";
import { blogPosts, studios } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/api-utils";

type Params = { params: Promise<{ slug: string }> };

// GET /api/public/blog/[slug] - Get published blog post by slug (public)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const [post] = await db
      .select({
        id: blogPosts.id,
        studioId: blogPosts.studioId,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverUrl: blogPosts.coverUrl,
        category: blogPosts.category,
        tags: blogPosts.tags,
        seoTitle: blogPosts.seoTitle,
        seoDescription: blogPosts.seoDescription,
        viewCount: blogPosts.viewCount,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, "published")
      ))
      .limit(1);

    if (!post) {
      return apiError("Post não encontrado", 404);
    }

    // Get studio info
    const [studio] = await db
      .select({
        name: studios.name,
        slug: studios.slug,
      })
      .from(studios)
      .where(eq(studios.id, post.studioId))
      .limit(1);

    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, post.id));

    return apiSuccess({
      ...post,
      studio,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return apiError("Erro ao buscar post", 500);
  }
}
