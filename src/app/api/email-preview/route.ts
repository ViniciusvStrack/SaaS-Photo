import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, apiError, getQueryParam } from "@/lib/api-utils";
import { getEmailTemplatePreview, type EmailTemplate } from "@/lib/integrations/email-templates";

// GET /api/email-preview?template=gallery_ready - Preview email template
export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const template = (getQueryParam(req, "template") || "welcome") as EmailTemplate;

    const validTemplates: EmailTemplate[] = [
      "welcome", "proposal_sent", "proposal_accepted", "contract_sent",
      "contract_signed", "gallery_ready", "payment_reminder", "payment_received",
      "payment_overdue", "shoot_reminder", "review_request", "birthday", "password_reset",
    ];

    if (!validTemplates.includes(template)) {
      return apiError(`Template inválido. Opções: ${validTemplates.join(", ")}`, 400);
    }

    const { subject, html } = getEmailTemplatePreview(template);

    // Return HTML directly for preview
    const format = getQueryParam(req, "format");
    if (format === "html") {
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return apiSuccess({ template, subject, html });
  } catch (error) {
    if ((error as Error).name === "AuthError") {
      return apiError((error as Error).message, 401);
    }
    return apiError("Erro ao gerar preview", 500);
  }
}
