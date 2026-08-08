// NoirFrame AI — Advanced Entity Extractor for Photography Events
// Handles: text input, voice transcription, informal Portuguese

export interface ExtractedEvent {
  clientName: string | null;
  eventType: string | null;
  date: string | null;      // YYYY-MM-DD
  time: string | null;      // HH:mm
  endTime: string | null;
  location: string | null;
  totalValue: number | null; // in cents
  paidValue: number | null;  // in cents
  paymentStatus: "paid" | "partial" | "pending" | null;
  guestCount: number | null;
  eventLevel: string | null; // basic, intermediate, premium, luxury
  notes: string | null;
  duration: string | null;
  packageName: string | null;
  confidence: number;
  warnings: string[];
  missingCritical: string[];
}

// ====== CURRENCY PARSER ======
function parseCurrency(text: string): number | null {
  // "R$ 3.500" "R$3500" "3500 reais" "R$ 3.500,00" "3,5k" "3.5mil"
  const patterns = [
    /R\$\s*([\d.,]+)/i,
    /([\d.,]+)\s*(?:reais|real)/i,
    /([\d.,]+)\s*(?:mil|k)\b/i,
    /([\d.,]+)\s*(?:conto)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value = match[1];
      
      // Handle "3,5k" or "3.5mil"
      if (/mil|k/i.test(match[0])) {
        value = value.replace(',', '.');
        return Math.round(parseFloat(value) * 1000 * 100);
      }
      
      // Handle "3 conto" = 3000
      if (/conto/i.test(match[0])) {
        return Math.round(parseFloat(value) * 1000 * 100);
      }

      // Standard: remove dots (thousands), replace comma with dot
      // "3.500,00" → "3500.00"
      // "3.500" → "3500"
      // "3500" → "3500"
      if (value.includes(',')) {
        value = value.replace(/\./g, '').replace(',', '.');
      } else if (value.match(/\.\d{3}/)) {
        // "3.500" is thousands separator, not decimal
        value = value.replace(/\./g, '');
      }
      
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        return Math.round(num * 100); // cents
      }
    }
  }
  return null;
}

// ====== DATE PARSER (advanced, handles informal Portuguese) ======
function parseDate(text: string): { value: string; raw: string; confidence: number } | null {
  const today = new Date();
  const currentYear = today.getFullYear();
  const lower = text.toLowerCase();

  const MONTHS: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4, junho: 5,
    julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
    jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
  };

  // "dia 15/08" or "15/08/2025" or "15/8"
  const slashDate = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (slashDate) {
    const day = parseInt(slashDate[1]);
    const month = parseInt(slashDate[2]) - 1;
    const year = slashDate[3]
      ? (slashDate[3].length === 2 ? 2000 + parseInt(slashDate[3]) : parseInt(slashDate[3]))
      : currentYear;
    const d = new Date(year, month, day);
    return {
      value: d.toISOString().split("T")[0],
      raw: slashDate[0],
      confidence: 0.95,
    };
  }

  // "dia 15 de agosto" / "15 de agosto de 2025"
  const longDate = text.match(/(?:dia\s+)?(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i);
  if (longDate) {
    const monthNum = MONTHS[longDate[2].toLowerCase()];
    if (monthNum !== undefined) {
      const day = parseInt(longDate[1]);
      const year = longDate[3] ? parseInt(longDate[3]) : currentYear;
      const d = new Date(year, monthNum, day);
      return { value: d.toISOString().split("T")[0], raw: longDate[0], confidence: 0.9 };
    }
  }

  // Relative: "hoje", "amanhã", "depois de amanhã"
  if (lower.includes("hoje")) {
    return { value: today.toISOString().split("T")[0], raw: "hoje", confidence: 0.95 };
  }
  if (lower.includes("amanhã") || lower.includes("amanha")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return { value: d.toISOString().split("T")[0], raw: "amanhã", confidence: 0.95 };
  }
  if (lower.includes("depois de amanhã") || lower.includes("depois de amanha")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return { value: d.toISOString().split("T")[0], raw: "depois de amanhã", confidence: 0.9 };
  }

  // "semana que vem" / "próxima semana"
  if (lower.includes("semana que vem") || lower.includes("próxima semana") || lower.includes("proxima semana")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return { value: d.toISOString().split("T")[0], raw: "próxima semana", confidence: 0.6 };
  }

  // "mês que vem" / "próximo mês"
  if (lower.includes("mês que vem") || lower.includes("próximo mês") || lower.includes("proximo mes")) {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 1);
    return { value: d.toISOString().split("T")[0], raw: "próximo mês", confidence: 0.5 };
  }

  // Day of week: "sábado", "segunda"
  const DAYS = ["domingo", "segunda", "terça", "terca", "quarta", "quinta", "sexta", "sábado", "sabado"];
  const DAY_MAP = [0, 1, 2, 2, 3, 4, 5, 6, 6];
  for (let i = 0; i < DAYS.length; i++) {
    if (lower.includes(DAYS[i])) {
      const targetDay = DAY_MAP[i];
      const currentDay = today.getDay();
      let daysAhead = targetDay - currentDay;
      if (daysAhead <= 0) daysAhead += 7;
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return { value: d.toISOString().split("T")[0], raw: DAYS[i], confidence: 0.75 };
    }
  }

  // "dia 15" (without month — assume current/next month)
  const dayOnly = text.match(/dia\s+(\d{1,2})\b/i);
  if (dayOnly) {
    const day = parseInt(dayOnly[1]);
    let d = new Date(currentYear, today.getMonth(), day);
    if (d < today) {
      d = new Date(currentYear, today.getMonth() + 1, day);
    }
    return { value: d.toISOString().split("T")[0], raw: dayOnly[0], confidence: 0.6 };
  }

  return null;
}

// ====== TIME PARSER ======
function parseTime(text: string): { value: string; raw: string } | null {
  // "18h" "18:00" "às 18h" "18h30" "18 horas" "às 6 da tarde"
  const patterns = [
    /(\d{1,2})[h:](\d{2})/,
    /(?:às?\s+)?(\d{1,2})\s*(?:horas?|hrs?|h)\s*(?:e\s+(\d{1,2}))?/i,
    /(?:às?\s+)?(\d{1,2})\s+(?:da\s+)?(manhã|tarde|noite)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      const min = match[2] ? parseInt(match[2]) : 0;
      
      // Handle "6 da tarde" → 18
      if (match[2] === "tarde" && hour < 12) hour += 12;
      if (match[2] === "noite" && hour < 12) hour += 12;
      
      return {
        value: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        raw: match[0],
      };
    }
  }
  return null;
}

// ====== CLIENT NAME PARSER ======
function parseClientName(text: string): string | null {
  const lower = text.toLowerCase();
  
  // Pattern: "[Name] marcou" / "ensaio da [Name]" / "casamento do [Name]" / "cliente [Name]"
  const patterns = [
    /\b([A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&|e)\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)?(?:\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)*)\s+(?:marcou|agendou|quer|pediu|confirmou)/,
    /(?:casamento|ensaio|sessão|aniversário|evento|batizado|formatura|newborn)\s+(?:d[oae]s?|para)\s+([A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&|e)\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)?(?:\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)*)/i,
    /cliente\s+([A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&|e)\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)?(?:\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)*)/i,
    /(?:da|do|para|com)\s+([A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&|e)\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)?(?:\s+[A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+)*)/,
  ];

  const excludedWords = new Set([
    "casamento", "ensaio", "sessão", "evento", "fotos", "galeria", "proposta",
    "contrato", "tarefa", "criar", "marcar", "agendar", "enviar", "registrar",
    "pagamento", "lembrete", "contato", "lead", "novo", "nova", "dia",
    "segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo",
    "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro",
    "rua", "avenida", "hotel", "buffet", "parque", "praia", "fazenda",
    "espaço", "espaco", "premium", "básico", "basico", "intermediário",
  ]);

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      const firstName = name.split(/\s+/)[0].toLowerCase();
      if (!excludedWords.has(firstName) && name.length > 2) {
        return name;
      }
    }
  }
  return null;
}

// ====== EVENT TYPE PARSER ======
function parseEventType(text: string): string | null {
  const lower = text.toLowerCase();
  const types: [string, string[]][] = [
    ["Casamento", ["casamento", "wedding", "noivos", "noiva"]],
    ["Pré-Wedding", ["pré-wedding", "pre-wedding", "pré wedding", "pre wedding"]],
    ["Ensaio", ["ensaio", "sessão fotográfica", "sessao"]],
    ["Aniversário", ["aniversário", "aniversario", "niver", "festa de aniversário"]],
    ["15 Anos", ["15 anos", "debutante", "quinze anos"]],
    ["Newborn", ["newborn", "recém-nascido", "recem nascido", "bebê", "bebe"]],
    ["Gestante", ["gestante", "grávida", "gravida", "maternidade"]],
    ["Família", ["família", "familia", "familiar"]],
    ["Batizado", ["batizado", "batismo"]],
    ["Formatura", ["formatura", "colação"]],
    ["Corporativo", ["corporativo", "empresa", "empresarial", "executivo", "retratos corporativos"]],
    ["Produto", ["produto", "still", "packshot"]],
    ["Moda", ["moda", "editorial", "lookbook", "fashion"]],
    ["Gastronomia", ["gastronomia", "comida", "cardápio", "restaurante"]],
    ["Imobiliário", ["imobiliário", "imobiliario", "imóvel", "imovel", "apartamento", "casa"]],
    ["Evento", ["evento", "conferência", "palestra", "feira", "congresso"]],
    ["Infantil", ["infantil", "festa infantil", "criança"]],
  ];

  for (const [label, keywords] of types) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return label;
    }
  }
  return null;
}

// ====== LOCATION PARSER ======
function parseLocation(text: string): string | null {
  const patterns = [
    /(?:local|lugar|endereço|onde)[:\s]+([^,.\n]+)/i,
    /(?:no?|na|em|ao)\s+((?:Espaço|Espaco|Hotel|Buffet|Fazenda|Praia|Parque|Restaurante|Igreja|Salão|Salao|Sítio|Sitio|Chácara|Chacara|Centro|Estúdio|Studio|Villa|Casa)\s+[^,.\n]+)/i,
    /(?:no?|na|em)\s+([A-ZÀ-Ú][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÀ-Ú]?[a-záàâãéèêíïóôõöúçñ]+){1,4})/,
  ];

  const excludeLocations = new Set(["casamento", "ensaio", "evento", "dia", "sessão"]);

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const loc = match[1].trim();
      if (loc.length > 3 && !excludeLocations.has(loc.toLowerCase())) {
        return loc;
      }
    }
  }
  return null;
}

// ====== GUEST COUNT PARSER ======
function parseGuestCount(text: string): number | null {
  const patterns = [
    /(\d+)\s*(?:convidados?|pessoas?|pax|participantes?)/i,
    /(?:convidados?|pessoas?|pax)[:\s]+(\d+)/i,
    /(?:para|com)\s+(\d+)\s+(?:convidados?|pessoas?)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const count = parseInt(match[1]);
      if (count > 0 && count < 10000) return count;
    }
  }
  return null;
}

// ====== EVENT LEVEL PARSER ======
function parseEventLevel(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(luxo|luxury|exclusivo|vip)\b/.test(lower)) return "luxury";
  if (/\b(premium|top|completo|gold)\b/.test(lower)) return "premium";
  if (/\b(intermediário|intermediario|padrão|padrao|silver|standard)\b/.test(lower)) return "intermediate";
  if (/\b(básico|basico|simples|econômico|economico|basic|starter)\b/.test(lower)) return "basic";
  return null;
}

// ====== PAYMENT STATUS PARSER ======
function parsePaymentInfo(text: string): { status: "paid" | "partial" | "pending" | null; paidValue: number | null } {
  const lower = text.toLowerCase();
  
  // "pagou R$3.500" / "pagamento de R$3.500"
  const paidMatch = text.match(/(?:pagou|pagamento\s+de|pago|adiantou|deu\s+de\s+entrada|sinal\s+de)\s*R?\$?\s*([\d.,]+)/i);
  if (paidMatch) {
    const value = parseCurrency(`R$ ${paidMatch[1]}`);
    return { status: "partial", paidValue: value };
  }

  if (lower.includes("pago total") || lower.includes("pagou tudo") || lower.includes("quitado") || lower.includes("pago integralmente")) {
    return { status: "paid", paidValue: null };
  }
  if (lower.includes("pagou") || lower.includes("pago") || lower.includes("pagamento confirmado")) {
    return { status: "paid", paidValue: null };
  }
  if (lower.includes("sinal") || lower.includes("entrada") || lower.includes("adiantamento") || lower.includes("parcial")) {
    return { status: "partial", paidValue: null };
  }
  if (lower.includes("pendente") || lower.includes("ainda não pagou") || lower.includes("sem pagamento")) {
    return { status: "pending", paidValue: null };
  }

  return { status: null, paidValue: null };
}

// ====== NOTES PARSER ======
function parseNotes(text: string): string | null {
  const patterns = [
    /(?:obs|observação|nota|detalhe|atenção|importante)[:\s]+([^.]+)/i,
    /(?:pediu|quer|precisa\s+de|solicitou|vai\s+ter)\s+([^,.]+(?:drone|climatização|iluminação|som|DJ|decoração|buffet|telão|projetor|tenda)[^,.]*)/i,
    /(?:cliente\s+)?(?:pediu|quer|precisa)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1] && match[1].length > 5) {
      return match[1].trim();
    }
  }
  return null;
}

// ====== PACKAGE PARSER ======
function parsePackage(text: string): string | null {
  const match = text.match(/(?:pacote|plano|combo)\s+(\w+(?:\s+\w+)?)/i);
  if (match) return match[1];
  return null;
}

// ====== MAIN EXTRACTOR ======
export function extractEventFromText(text: string): ExtractedEvent {
  const warnings: string[] = [];
  const missingCritical: string[] = [];

  // Extract all entities
  const clientName = parseClientName(text);
  const eventType = parseEventType(text);
  const dateResult = parseDate(text);
  const timeResult = parseTime(text);
  const location = parseLocation(text);
  const totalValue = parseCurrency(text);
  const paymentInfo = parsePaymentInfo(text);
  const guestCount = parseGuestCount(text);
  const eventLevel = parseEventLevel(text);
  const notes = parseNotes(text);
  const packageName = parsePackage(text);

  // Calculate confidence
  let confidence = 0;
  let fieldsFound = 0;
  const totalFields = 7; // client, type, date, time, location, value, level

  if (clientName) fieldsFound++;
  if (eventType) fieldsFound++;
  if (dateResult) fieldsFound++;
  if (timeResult) fieldsFound++;
  if (location) fieldsFound++;
  if (totalValue) fieldsFound++;
  if (eventLevel) fieldsFound++;

  confidence = Math.round((fieldsFound / totalFields) * 100) / 100;

  // Check critical missing fields
  if (!clientName) missingCritical.push("Nome do cliente");
  if (!dateResult) missingCritical.push("Data do evento");
  if (!eventType) missingCritical.push("Tipo de evento");

  // Validate extracted data
  if (dateResult) {
    const eventDate = new Date(dateResult.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      warnings.push(`⚠️ A data ${dateResult.raw} parece estar no passado`);
    }
    if (dateResult.confidence < 0.7) {
      warnings.push(`⚠️ Data "${dateResult.raw}" é ambígua — confirme se está correta`);
    }
  }

  if (totalValue !== null && totalValue < 0) {
    warnings.push("⚠️ Valor negativo detectado");
  }

  if (totalValue !== null && totalValue > 100000 * 100) {
    warnings.push("⚠️ Valor muito alto — confirme se está correto");
  }

  if (guestCount !== null && guestCount > 1000) {
    warnings.push("⚠️ Número de convidados muito alto — confirme");
  }

  // Determine payment status
  let paymentStatus = paymentInfo.status;
  let paidValue = paymentInfo.paidValue;

  if (paymentStatus === "paid" && totalValue !== null && paidValue === null) {
    paidValue = totalValue;
  }

  if (paidValue !== null && totalValue !== null) {
    if (paidValue >= totalValue) {
      paymentStatus = "paid";
    } else {
      paymentStatus = "partial";
    }
  }

  return {
    clientName,
    eventType,
    date: dateResult?.value || null,
    time: timeResult?.value || null,
    endTime: null,
    location,
    totalValue,
    paidValue,
    paymentStatus,
    guestCount,
    eventLevel,
    notes,
    duration: null,
    packageName,
    confidence,
    warnings,
    missingCritical,
  };
}
