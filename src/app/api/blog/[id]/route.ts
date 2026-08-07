import { NextRequest } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, apiNoContent, validateBody, createAuditLog } from "@/lib/api-utils";
import { blogPostUpdateSchema } from "@/lib/validations";
import { slugify } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

// GET /api/blog/[id] - Get blog post details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.id, id),
        eq(blogPosts.studioId, user.studioId)
      ))
      .limit(1);

    if (!post) {
      return apiError("Post não encontrado", 404);
    }

    return apiSuccess(post);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao buscar post", 500);
  }
}

// PATCH /api/blog/[id] - Update blog post
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.id, id),
        eq(blogPosts.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Post não encontrado", 404);
    }

    const validation = await validateBody(req, blogPostUpdateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) {
      updateData.title = data.title;
      if (!data.slug) {
        updateData.slug = `${slugify(data.title)}-${Date.now().toString(36)}`;
      }
    }
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "published") {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    await createAuditLog(user.userId, user.studioId, "update", "blog", id, data, req);

    return apiSuccess(updated);
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao atualizar post", 500);
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (!user.studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ id: blogPosts.id, title: blogPosts.title })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.id, id),
        eq(blogPosts.studioId, user.studioId)
      ))
      .limit(1);

    if (!existing) {
      return apiError("Post não encontrado", 404);
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    await createAuditLog(user.userId, user.studioId, "delete", "blog", id, { title: existing.title }, req);

    return apiNoContent();
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao excluir post", 500);
  }
}
