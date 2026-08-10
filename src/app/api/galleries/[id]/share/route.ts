import { NextRequest } from "next/server";
import { db } from "@/db";
import { galleries, photos, notifications } from "@/db/schema";
import { eq, and, isNull, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, createAuditLog } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// POST /api/galleries/[id]/share — Generate shareable link and mark as sent
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

    // Count photos
    const [photoCount] = await db.select({ count: count() })
      .from(photos)
      .where(eq(photos.galleryId, id));

    if ((photoCount?.count || 0) === 0) {
      return apiError("Adicione fotos antes de compartilhar a galeria", 400);
    }

    // Update status to "sent" if currently draft
    if (gallery.status === "draft") {
      await db.update(galleries).set({
        status: "sent",
        updatedAt: new Date(),
      }).where(eq(galleries.id, id));
    }

    // Build the share link — short URL /g/slug
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const shareLink = `${baseUrl}/g/${gallery.slug}`;

    // Create notification
    await db.insert(notifications).values({
      userId: user.userId,
      type: "info",
      title: "Galeria compartilhada",
      message: `Galeria "${gallery.name}" enviada para ${gallery.clientName || "cliente"}`,
      link: "/app/galleries",
    });

    await createAuditLog(user.userId, studioId, "share", "gallery", id, {
      clientName: gallery.clientName,
      slug: gallery.slug,
      photoCount: photoCount?.count || 0,
    }, req);

    return apiSuccess({
      link: shareLink,
      slug: gallery.slug,
      photoCount: photoCount?.count || 0,
      hasPassword: !!gallery.password,
      password: gallery.password || null,
      status: gallery.status === "draft" ? "sent" : gallery.status,

      // Ready-to-send messages
      whatsapp: buildWhatsAppMessage(gallery, shareLink),
      email: buildEmailMessage(gallery, shareLink),
      sms: buildSMSMessage(gallery, shareLink),
      copyLink: shareLink,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function buildWhatsAppMessage(gallery: typeof galleries.$inferSelect, link: string): string {
  const lines = [
    `Olá${gallery.clientName ? ` ${gallery.clientName}` : ""}! 📸`,
    ``,
    `Suas fotos estão prontas!`,
    ``,
    `🔗 Acesse aqui: ${link}`,
  ];

  if (gallery.password) {
    lines.push(`🔑 Senha: ${gallery.password}`);
  }

  if (gallery.allowFavorites) {
    lines.push(``, `❤️ Selecione suas favoritas direto pelo link!`);
  }

  if (gallery.message) {
    lines.push(``, gallery.message);
  }

  lines.push(``, `Qualquer dúvida, me chama! 💛`);

  return lines.join("\n");
}

function buildEmailMessage(gallery: typeof galleries.$inferSelect, link: string): { subject: string; body: string } {
  return {
    subject: `📸 Suas fotos estão prontas — ${gallery.name}`,
    body: [
      `Olá${gallery.clientName ? ` ${gallery.clientName}` : ""}!`,
      ``,
      `Suas fotos da sessão "${gallery.name}" estão prontas para visualização.`,
      ``,
      `Acesse pelo link: ${link}`,
      gallery.password ? `Senha de acesso: ${gallery.password}` : "",
      gallery.allowFavorites ? `\nVocê pode selecionar suas fotos favoritas diretamente pelo link.` : "",
      gallery.message ? `\n${gallery.message}` : "",
      ``,
      `Qualquer dúvida, estou à disposição!`,
    ].filter(Boolean).join("\n"),
  };
}

function buildSMSMessage(gallery: typeof galleries.$inferSelect, link: string): string {
  let msg = `${gallery.clientName || ""}, suas fotos estão prontas! 📸 ${link}`;
  if (gallery.password) {
    msg += ` (senha: ${gallery.password})`;
  }
  return msg;
}
