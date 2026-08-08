import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { clients, galleries } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, createAuditLog } from "@/lib/api-utils";

const generateSchema = z.object({
  clientId: z.string().min(1, "ID do cliente é obrigatório"),
  galleryId: z.string().optional(),
  expiresInDays: z.number().min(1).max(90).default(30),
});

// POST /api/client/magic-link — Generate magic link for client access
// Photographer generates → sends to client → client clicks → views gallery
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const studioId = user.studioId;
    if (!studioId) {
      return apiError("Estúdio não encontrado", 400);
    }

    const body = await req.json();
    const { clientId, galleryId, expiresInDays } = generateSchema.parse(body);

    // Verify client belongs to studio
    const [client] = await db.select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.studioId, studioId), isNull(clients.deletedAt)))
      .limit(1);

    if (!client) {
      return apiError("Cliente não encontrado", 404);
    }

    // If gallery specified, verify it
    let gallerySlug: string | null = null;
    if (galleryId) {
      const [gallery] = await db.select({ slug: galleries.slug })
        .from(galleries)
        .where(and(eq(galleries.id, galleryId), eq(galleries.studioId, studioId)))
        .limit(1);
      if (gallery) {
        gallerySlug = gallery.slug;
      }
    }

    // Generate a secure token
    const token = Buffer.from(
      JSON.stringify({
        clientId,
        studioId,
        galleryId: galleryId || null,
        exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
        iat: Date.now(),
      })
    ).toString("base64url");

    // Build the magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noirframe.app";
    let magicLink: string;

    if (gallerySlug) {
      // Direct to gallery
      magicLink = `${baseUrl}/gallery/${gallerySlug}?token=${token}`;
    } else {
      // Direct to client portal
      magicLink = `${baseUrl}/client/dashboard?token=${token}`;
    }

    await createAuditLog(user.userId, studioId, "share", "magic_link", clientId, {
      clientName: client.name,
      galleryId,
      expiresInDays,
    }, req);

    return apiSuccess({
      magicLink,
      token,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      client: { id: client.id, name: client.name },
      gallerySlug,
      // Pre-formatted messages for sharing
      shareTemplates: {
        whatsapp: `Olá ${client.name}! 📸\n\nSuas fotos estão prontas! Acesse pelo link:\n${magicLink}\n\nQualquer dúvida, estou à disposição! 💛`,
        email: {
          subject: gallerySlug ? "Suas fotos estão prontas! 📸" : `Acesso ao portal — ${client.name}`,
          body: `Olá ${client.name}!\n\n${gallerySlug ? "Suas fotos estão prontas para visualização." : "Seu portal de acesso está disponível."}\n\nAcesse pelo link: ${magicLink}\n\nEste link é válido por ${expiresInDays} dias.\n\nQualquer dúvida, estou à disposição!`,
        },
        sms: `${client.name}, suas fotos estão prontas! Acesse: ${magicLink}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
