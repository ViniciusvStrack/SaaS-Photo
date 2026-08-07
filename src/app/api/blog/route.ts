import { NextRequest } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, desc, asc, ilike, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiPaginated, apiCreated, getQueryParams, createAuditLog, validateBody } from "@/lib/api-utils";
import { blogPostSchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";

// GET /api/blog - List blog posts
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { page, pageSize, search, status, sortOrder } = getQueryParams(req);
    const offset = (page - 1) * pageSize;

    const conditions = [eq(blogPosts.studioId, user.studioId)];
    
    if (search) {
      conditions.push(ilike(blogPosts.title, `%${search}%`));
    }
    
    if (status) {
      conditions.push(eq(blogPosts.status, status as "draft" | "published" | "scheduled"));
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(sortOrder === "asc" ? asc(blogPosts.createdAt) : desc(blogPosts.createdAt))
      .limit(pageSize)
      .offset(offset);

    return apiPaginated(data, countResult?.total || 0, page, pageSize);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error fetching blog posts:", error);
    return apiError("Erro ao buscar posts", 500);
  }
}

// POST /api/blog - Create blog post
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const validation = await validateBody(req, blogPostSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    // Generate slug
    const baseSlug = data.slug || slugify(data.title);
    const timestamp = Date.now().toString(36);
    const uniqueSlug = `${baseSlug}-${timestamp}`;

    const [post] = await db
      .insert(blogPosts)
      .values({
        studioId: user.studioId,
        title: data.title,
        slug: uniqueSlug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverUrl: data.coverUrl || null,
        category: data.category || null,
        tags: data.tags || [],
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        status: data.status || "draft",
        publishedAt: data.status === "published" ? new Date() : null,
        scheduledAt: data.publishAt ? new Date(data.publishAt) : null,
      })
      .returning();

    await createAuditLog(user.userId, user.studioId, "create", "blog", post.id, { title: data.title }, req);

    return apiCreated(post);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    console.error("Error creating blog post:", error);
    return apiError("Erro ao criar post", 500);
  }
}
