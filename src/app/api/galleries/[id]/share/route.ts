import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, createAuditLog } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// POST /api/galleries/[id]/share — Generate shareable link + send gallery
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const { id } = await params;

    // Verify gallery exists and belongs to studio
    const [gallery] = await db.select()
      .from(galleries)
      .where(and(
        eq(galleries.id, id),
        eq(galleries.studioId, studioId),
        isNull(galleries.deletedAt)
      ))
      .limit(1);

    if (!gallery) {
      return apiError("Galeria não encontrada", 404);
    }

    // Update status to "sent" if currently draft
    if (gallery.status === "draft") {
      await db.update(galleries).set({
        status: "sent",
        updatedAt: new Date(),
      }).where(eq(galleries.id, id));
    }

    // Build gallery URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const galleryUrl = `${baseUrl}/api/public/gallery/${gallery.slug}`;
    const viewUrl = `${baseUrl}/gallery/${gallery.slug}`;

    await createAuditLog(user.userId, studioId, "share", "gallery", id, {
      clientName: gallery.clientName,
      slug: gallery.slug,
    }, req);

    return apiSuccess({
      shareUrl: viewUrl,
      apiUrl: galleryUrl,
      slug: gallery.slug,
      hasPassword: !!gallery.password,
      password: gallery.password || null,
      status: gallery.status === "draft" ? "sent" : gallery.status,
      // Pre-formatted messages
      shareTemplates: {
        whatsapp: `Olá ${gallery.clientName || ""}! 📸\n\nSuas fotos da galeria "${gallery.name}" estão prontas!\n\n🔗 Acesse: ${viewUrl}\n${gallery.password ? `🔑 Senha: ${gallery.password}\n` : ""}\n${gallery.message || "Espero que goste! 💛"}`,
        email: {
          subject: `📸 Suas fotos estão prontas — ${gallery.name}`,
          body: `Olá ${gallery.clientName || ""}!\n\nSuas fotos da galeria "${gallery.name}" estão prontas para visualização.\n\nAcesse pelo link: ${viewUrl}\n${gallery.password ? `Senha de acesso: ${gallery.password}\n` : ""}\n${gallery.message || ""}\n\nQualquer dúvida, estou à disposição!`,
        },
        sms: `${gallery.clientName || ""}, suas fotos estão prontas! 📸 Acesse: ${viewUrl}${gallery.password ? ` (senha: ${gallery.password})` : ""}`,
        copy: viewUrl,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
