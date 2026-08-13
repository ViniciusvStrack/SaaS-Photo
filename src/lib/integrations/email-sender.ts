import { Resend } from "resend";
import { getEmailTemplate, type EmailTemplate, type TemplateVars } from "./email-templates";

/**
 * Camada de envio de emails do NoirFrame.
 *
 * - Com `RESEND_API_KEY` configurada → envia de verdade via Resend.
 * - Sem chave → modo DEV: loga o email formatado no console e nunca quebra o fluxo.
 */

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  vars: TemplateVars;
  /** "auto" (default): usa Resend se houver chave; "dev": força modo dev */
  mode?: "auto" | "dev";
}

export interface EmailSendResult {
  sent: boolean;
  mode: "resend" | "dev";
  to: string;
  subject: string;
  id?: string;
}

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getFromAddress(): string {
  return process.env.EMAIL_FROM || "NoirFrame <onboarding@resend.dev>";
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://noirframe.app";
}

function logDevEmail(to: string, subject: string, template: EmailTemplate, html: string): void {
  console.log("\n📧 ===== [DEV MODE] Email (configure RESEND_API_KEY para envio real) =====");
  console.log(`   Para:     ${to}`);
  console.log(`   Assunto:  ${subject}`);
  console.log(`   Template: ${template}`);
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  if (links.length > 0) {
    console.log(`   Links:    ${links.join("\n             ")}`);
  }
  console.log("===================================================================\n");
}

export async function sendEmail(opts: SendEmailOptions): Promise<EmailSendResult> {
  const { subject, html } = getEmailTemplate(opts.template, opts.vars);
  const useResend = opts.mode === "dev" ? false : Boolean(process.env.RESEND_API_KEY);

  if (!useResend) {
    logDevEmail(opts.to, subject, opts.template, html);
    return { sent: false, mode: "dev", to: opts.to, subject };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: opts.to,
      subject,
      html,
    });

    if (error) {
      throw new Error(
        `Resend error (${error.statusCode ?? "?"}): ${error.message}`
      );
    }

    return { sent: true, mode: "resend", to: opts.to, subject, id: data?.id };
  } catch (err) {
    throw new Error(
      `Falha ao enviar email para ${opts.to} (template ${opts.template}): ${(err as Error).message}`
    );
  }
}
