// NoirFrame Email Templates - Premium All-Black Design

export type EmailTemplate =
  | "welcome"
  | "proposal_sent"
  | "proposal_accepted"
  | "contract_sent"
  | "contract_signed"
  | "gallery_ready"
  | "payment_reminder"
  | "payment_received"
  | "payment_overdue"
  | "shoot_reminder"
  | "review_request"
  | "birthday"
  | "password_reset";

interface TemplateVars {
  clientName?: string;
  photographerName?: string;
  studioName?: string;
  studioEmail?: string;
  studioPhone?: string;
  brandColor?: string;
  value?: string;
  date?: string;
  time?: string;
  location?: string;
  galleryLink?: string;
  proposalLink?: string;
  contractLink?: string;
  paymentLink?: string;
  resetLink?: string;
  serviceName?: string;
  customMessage?: string;
  [key: string]: string | undefined;
}

function baseTemplate(content: string, vars: TemplateVars): string {
  const brandColor = vars.brandColor || "#c9a96e";
  const studioName = vars.studioName || "NoirFrame";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${studioName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:30px 0 20px;">
              <h1 style="margin:0;color:${brandColor};font-size:24px;font-weight:600;letter-spacing:2px;">${studioName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color:#1a1a1a;border-radius:16px;padding:40px;border:1px solid #2a2a2a;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:30px 0 10px;">
              <p style="margin:0;color:#666;font-size:12px;">
                ${vars.studioEmail ? `📧 ${vars.studioEmail}` : ""}
                ${vars.studioPhone ? ` • 📱 ${vars.studioPhone}` : ""}
              </p>
              <p style="margin:8px 0 0;color:#444;font-size:11px;">
                Powered by NoirFrame
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string, color: string = "#c9a96e"): string {
  return `<a href="${url}" style="display:inline-block;padding:14px 32px;background-color:${color};color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;">${text}</a>`;
}

export function getEmailTemplate(template: EmailTemplate, vars: TemplateVars): { subject: string; html: string } {
  const brandColor = vars.brandColor || "#c9a96e";

  switch (template) {
    case "welcome":
      return {
        subject: `Bem-vindo(a) ao ${vars.studioName}! 🎉`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Bem-vindo(a), ${vars.clientName}! 👋</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            É um prazer ter você como cliente do ${vars.studioName}. Estamos ansiosos para criar memórias incríveis juntos!
          </p>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Se tiver qualquer dúvida, estamos à disposição.
          </p>
          <p style="color:${brandColor};font-size:15px;margin-top:24px;">
            Com carinho,<br/>${vars.photographerName || vars.studioName}
          </p>
        `, vars),
      };

    case "proposal_sent":
      return {
        subject: `Nova proposta de ${vars.studioName} 📋`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Nova Proposta</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Preparamos uma proposta especial para você:
          </p>
          <div style="background-color:#111;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid ${brandColor};">
            <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">${vars.serviceName || "Serviço Fotográfico"}</p>
            ${vars.value ? `<p style="margin:8px 0 0;color:${brandColor};font-size:20px;font-weight:700;">${vars.value}</p>` : ""}
          </div>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            ${vars.customMessage || "Analise os detalhes e nos diga o que acha!"}
          </p>
          ${vars.proposalLink ? `<div style="text-align:center;margin-top:24px;">${button("Ver Proposta", vars.proposalLink, brandColor)}</div>` : ""}
        `, vars),
      };

    case "gallery_ready":
      return {
        subject: `Suas fotos estão prontas! 📸✨`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Galeria Pronta! 🎉</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Temos uma ótima notícia — suas fotos estão prontas para visualização!
          </p>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            ${vars.customMessage || "Acesse o link abaixo para ver e selecionar suas favoritas."}
          </p>
          ${vars.galleryLink ? `<div style="text-align:center;margin-top:24px;">${button("Acessar Galeria", vars.galleryLink, brandColor)}</div>` : ""}
          <p style="color:#666;font-size:13px;margin-top:24px;">
            Mal podemos esperar para saber o que você achou! 💛
          </p>
        `, vars),
      };

    case "payment_reminder":
      return {
        subject: `Lembrete de pagamento - ${vars.studioName}`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Lembrete de Pagamento</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}, este é um lembrete amigável sobre um pagamento pendente:
          </p>
          <div style="background-color:#111;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #f59e0b;">
            ${vars.value ? `<p style="margin:0;color:#fff;font-size:18px;">Valor: <strong>${vars.value}</strong></p>` : ""}
            ${vars.date ? `<p style="margin:8px 0 0;color:#aaa;font-size:14px;">Vencimento: ${vars.date}</p>` : ""}
          </div>
          ${vars.paymentLink ? `<div style="text-align:center;margin-top:24px;">${button("Realizar Pagamento", vars.paymentLink, "#f59e0b")}</div>` : ""}
        `, vars),
      };

    case "payment_received":
      return {
        subject: `Pagamento confirmado! ✅`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Pagamento Confirmado! ✅</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Confirmamos o recebimento do seu pagamento:
          </p>
          <div style="background-color:#111;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #22c55e;">
            ${vars.value ? `<p style="margin:0;color:#22c55e;font-size:20px;font-weight:700;">${vars.value}</p>` : ""}
            <p style="margin:8px 0 0;color:#aaa;font-size:14px;">Recebido em ${vars.date || new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <p style="color:#aaa;font-size:15px;">Obrigado! 🙏</p>
        `, vars),
      };

    case "shoot_reminder":
      return {
        subject: `Lembrete: Ensaio ${vars.date ? `em ${vars.date}` : "se aproxima"} 📸`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Seu Ensaio Está Chegando! 📸</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Estamos ansiosos para o nosso ensaio.
          </p>
          <div style="background-color:#111;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid ${brandColor};">
            ${vars.date ? `<p style="margin:0;color:#fff;font-size:16px;">📅 <strong>${vars.date}</strong></p>` : ""}
            ${vars.time ? `<p style="margin:8px 0 0;color:#aaa;font-size:14px;">🕐 ${vars.time}</p>` : ""}
            ${vars.location ? `<p style="margin:8px 0 0;color:#aaa;font-size:14px;">📍 ${vars.location}</p>` : ""}
          </div>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            ${vars.customMessage || "Qualquer dúvida, estamos à disposição. Até lá!"}
          </p>
        `, vars),
      };

    case "contract_sent":
      return {
        subject: `Contrato disponível para assinatura - ${vars.studioName}`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Contrato Disponível</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Seu contrato está pronto para assinatura:
          </p>
          <div style="background-color:#111;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid ${brandColor};">
            <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">${vars.serviceName || "Contrato de Serviço"}</p>
            ${vars.value ? `<p style="margin:8px 0 0;color:${brandColor};font-size:18px;">${vars.value}</p>` : ""}
          </div>
          ${vars.contractLink ? `<div style="text-align:center;margin-top:24px;">${button("Assinar Contrato", vars.contractLink, brandColor)}</div>` : ""}
        `, vars),
      };

    case "birthday":
      return {
        subject: `Feliz Aniversário! 🎂🎉`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:28px;text-align:center;">🎂 Feliz Aniversário! 🎉</h2>
          <p style="color:#aaa;font-size:16px;line-height:1.6;text-align:center;">
            Olá ${vars.clientName}! O ${vars.studioName} deseja a você um dia repleto de alegria e momentos especiais.
          </p>
          <p style="color:${brandColor};font-size:16px;text-align:center;margin-top:24px;">
            Que seu novo ano seja cheio de fotos lindas! 📸✨
          </p>
        `, vars),
      };

    case "review_request":
      return {
        subject: `Como foi sua experiência? ⭐`,
        html: baseTemplate(`
          <h2 style="margin:0 0 16px;color:#fff;font-size:22px;">Como foi sua experiência? ⭐</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Olá ${vars.clientName}! Gostaríamos muito de saber como foi sua experiência com o ${vars.studioName}.
          </p>
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            Sua opinião é muito importante para continuarmos melhorando nosso trabalho!
          </p>
          <p style="color:${brandColor};font-size:15px;margin-top:24px;">
            Obrigado por confiar em nós! 💛
          </p>
        `, vars),
      };

    default:
      return {
        subject: `Mensagem do ${vars.studioName}`,
        html: baseTemplate(`
          <p style="color:#aaa;font-size:15px;line-height:1.6;">
            ${vars.customMessage || "Obrigado pelo seu contato!"}
          </p>
        `, vars),
      };
  }
}

// Preview email template
export function getEmailTemplatePreview(template: EmailTemplate): { subject: string; html: string } {
  return getEmailTemplate(template, {
    clientName: "Marina Oliveira",
    photographerName: "Ana Luísa Rodrigues",
    studioName: "Studio Lumière",
    studioEmail: "contato@studiolumiere.com.br",
    studioPhone: "(11) 99876-5432",
    brandColor: "#c9a96e",
    value: "R$ 8.500,00",
    date: "15 de Junho de 2025",
    time: "15:00",
    location: "Fazenda Santa Maria, Campinas",
    serviceName: "Casamento Completo Premium",
    galleryLink: "https://studiolumiere.com.br/gallery/marina-joao",
    proposalLink: "https://studiolumiere.com.br/proposal/pr1",
    contractLink: "https://studiolumiere.com.br/contract/ct1",
    customMessage: "Estamos muito felizes em fazer parte desse momento especial!",
  });
}
