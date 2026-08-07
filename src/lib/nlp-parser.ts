// Natural Language Parser for NoirFrame AI Assistant
// Detects intents & entities from free-text commands in Portuguese

export type Intent =
  | 'create_client'
  | 'create_shoot'
  | 'create_event'
  | 'create_task'
  | 'create_reminder'
  | 'register_payment'
  | 'create_proposal'
  | 'create_gallery'
  | 'create_post'
  | 'reschedule'
  | 'send_message'
  | 'check_calendar'
  | 'check_pending'
  | 'register_lead'
  | 'unknown';

export interface Entity {
  type: 'client_name' | 'date' | 'time' | 'location' | 'event_type' | 'duration' | 'value' | 'deposit' | 'deadline' | 'channel' | 'notes' | 'urgency' | 'quantity' | 'password' | 'title';
  value: string;
  raw: string;
  confidence: number;
}

export interface ParseResult {
  intent: Intent;
  confidence: number;
  entities: Entity[];
  missingFields: string[];
  suggestedActions: SuggestedAction[];
  summary: string;
  warnings: string[];
}

export interface SuggestedAction {
  id: string;
  type: 'create_client' | 'create_shoot' | 'create_task' | 'create_invoice' | 'create_gallery' | 'create_proposal' | 'create_event' | 'send_message' | 'create_reminder' | 'register_lead';
  label: string;
  description: string;
  data: Record<string, unknown>;
  applied: boolean;
}

// Month names in Portuguese
const MONTHS: Record<string, string> = {
  'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04',
  'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08', 'setembro': '09',
  'outubro': '10', 'novembro': '11', 'dezembro': '12',
  'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
  'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
};

const EVENT_TYPES = [
  'casamento', 'retrato', 'corporativo', 'produto', 'moda', 'evento',
  'aniversário', 'newborn', 'gestante', 'família', 'formatura',
  'gastronomia', 'imobiliário', 'esportivo', 'pré-wedding', 'pre-wedding',
  '15 anos', 'debutante', 'batizado', 'infantil', 'editorial', 'lookbook',
];

function extractClientName(text: string): Entity | null {
  // Patterns: "da/do/para ClientName", "cliente ClientName"
  const patterns = [
    /(?:da|do|para|cliente|de)\s+([A-Z][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&\s+)?[A-Z][a-záàâãéèêíïóôõöúçñ]+)*)/g,
    /(?:marcar|agendar|ensaio|sessão|fotos?)\s+(?:da|do|para)\s+([A-Z][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&\s+)?[A-Z][a-záàâãéèêíïóôõöúçñ]+)*)/gi,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return { type: 'client_name', value: match[1].trim(), raw: match[0], confidence: 0.85 };
    }
  }

  // Fallback: first capitalized name
  const nameMatch = text.match(/\b([A-Z][a-záàâãéèêíïóôõöúçñ]+(?:\s+(?:&\s+)?[A-Z][a-záàâãéèêíïóôõöúçñ]+)*)\b/);
  if (nameMatch) {
    const excluded = ['Criar', 'Marcar', 'Agendar', 'Ensaio', 'Cliente', 'Lembrar', 'Enviar', 'Registrar', 'Adicionar', 'Abrir'];
    if (!excluded.includes(nameMatch[1].split(' ')[0])) {
      return { type: 'client_name', value: nameMatch[1], raw: nameMatch[0], confidence: 0.6 };
    }
  }
  return null;
}

function extractDate(text: string): Entity | null {
  // DD/MM/YYYY or DD/MM
  const dateSlash = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateSlash) {
    const day = dateSlash[1].padStart(2, '0');
    const month = dateSlash[2].padStart(2, '0');
    const year = dateSlash[3] ? (dateSlash[3].length === 2 ? '20' + dateSlash[3] : dateSlash[3]) : '2025';
    return { type: 'date', value: `${year}-${month}-${day}`, raw: dateSlash[0], confidence: 0.95 };
  }

  // "dia DD de MONTH"
  const dateLong = text.match(/(?:dia\s+)?(\d{1,2})\s+de\s+(\w+)/i);
  if (dateLong) {
    const month = MONTHS[dateLong[2].toLowerCase()];
    if (month) {
      const day = dateLong[1].padStart(2, '0');
      return { type: 'date', value: `2025-${month}-${day}`, raw: dateLong[0], confidence: 0.9 };
    }
  }

  // Relative dates
  const lower = text.toLowerCase();
  const today = new Date();
  if (lower.includes('hoje')) {
    return { type: 'date', value: today.toISOString().split('T')[0], raw: 'hoje', confidence: 0.95 };
  }
  if (lower.includes('amanhã')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { type: 'date', value: tomorrow.toISOString().split('T')[0], raw: 'amanhã', confidence: 0.95 };
  }
  
  // Day of week
  const daysOfWeek = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'sabado'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lower.includes(daysOfWeek[i])) {
      const targetDay = i >= 7 ? 6 : i;
      const currentDay = today.getDay();
      let daysAhead = targetDay - currentDay;
      if (daysAhead <= 0) daysAhead += 7;
      const target = new Date(today);
      target.setDate(target.getDate() + daysAhead);
      return { type: 'date', value: target.toISOString().split('T')[0], raw: daysOfWeek[i], confidence: 0.8 };
    }
  }

  return null;
}

function extractTime(text: string): Entity | null {
  const timeMatch = text.match(/(\d{1,2})[h:](\d{2})?/);
  if (timeMatch) {
    const hour = timeMatch[1].padStart(2, '0');
    const min = timeMatch[2] || '00';
    return { type: 'time', value: `${hour}:${min}`, raw: timeMatch[0], confidence: 0.95 };
  }
  const periodMatch = text.match(/às?\s+(\d{1,2})\s*(?:horas?|hrs?)/i);
  if (periodMatch) {
    return { type: 'time', value: `${periodMatch[1].padStart(2, '0')}:00`, raw: periodMatch[0], confidence: 0.9 };
  }
  return null;
}

function extractValue(text: string): Entity | null {
  const valueMatch = text.match(/R\$\s*([\d.,]+)/);
  if (valueMatch) {
    const value = valueMatch[1].replace(/\./g, '').replace(',', '.');
    return { type: 'value', value, raw: valueMatch[0], confidence: 0.95 };
  }
  return null;
}

function extractDeposit(text: string): Entity | null {
  const lower = text.toLowerCase();
  const depositMatch = lower.match(/(?:sinal|entrada|adiantamento)\s+(?:de\s+)?R\$\s*([\d.,]+)/i);
  if (depositMatch) {
    const value = depositMatch[1].replace(/\./g, '').replace(',', '.');
    return { type: 'deposit', value, raw: depositMatch[0], confidence: 0.9 };
  }
  return null;
}

function extractLocation(text: string): Entity | null {
  const locPatterns = [
    /(?:n[oa]s?\s+|em\s+|local:?\s+)((?:(?:Rua|Av\.?|Avenida|Parque|Praça|Hotel|Buffet|Estúdio|Fazenda|Praia|Restaurante|Centro|Clínica|Escritório|Igreja)\s+[^,.\n]+))/i,
    /(?:n[oa]s?\s+|em\s+)((?:[A-Z][a-záàâãéèêíïóôõöúçñ]+\s*)+(?:,\s*\w+)?)/,
  ];
  for (const pattern of locPatterns) {
    const match = text.match(pattern);
    if (match?.[1] && match[1].length > 3) {
      return { type: 'location', value: match[1].trim(), raw: match[0], confidence: 0.75 };
    }
  }
  // Simple: "no centro"
  const simpleMatch = text.match(/\b(?:no|na)\s+(centro|estúdio|parque|praia|fazenda|hotel|buffet|restaurante)\b/i);
  if (simpleMatch) {
    return { type: 'location', value: simpleMatch[1], raw: simpleMatch[0], confidence: 0.6 };
  }
  return null;
}

function extractEventType(text: string): Entity | null {
  const lower = text.toLowerCase();
  for (const type of EVENT_TYPES) {
    if (lower.includes(type)) {
      return { type: 'event_type', value: type, raw: type, confidence: 0.9 };
    }
  }
  if (lower.includes('ensaio')) return { type: 'event_type', value: 'ensaio', raw: 'ensaio', confidence: 0.7 };
  if (lower.includes('fotos') || lower.includes('sessão')) return { type: 'event_type', value: 'sessão fotográfica', raw: 'sessão', confidence: 0.5 };
  return null;
}

function extractDuration(text: string): Entity | null {
  const match = text.match(/(\d+)\s*(?:horas?|hrs?|h)\s*(?:de\s+(?:cobertura|sessão|ensaio))?/i);
  if (match) {
    return { type: 'duration', value: match[1], raw: match[0], confidence: 0.85 };
  }
  return null;
}

function extractDeadline(text: string): Entity | null {
  const match = text.match(/(?:entrega|prazo)\s+(?:em\s+)?(?:até\s+)?(\d+)\s*(?:dias?|semanas?)/i);
  if (match) {
    return { type: 'deadline', value: match[1] + (match[0].includes('semana') ? ' semanas' : ' dias'), raw: match[0], confidence: 0.85 };
  }
  const dateDeadline = text.match(/(?:entregar?|prazo)\s+(?:até\s+)?(?:dia\s+)?(\d{1,2}(?:\/\d{1,2})?(?:\/\d{2,4})?|\w+-feira)/i);
  if (dateDeadline) {
    return { type: 'deadline', value: dateDeadline[1], raw: dateDeadline[0], confidence: 0.7 };
  }
  return null;
}

function extractPassword(text: string): Entity | null {
  const match = text.match(/senha\s+(\w+)/i);
  if (match) {
    return { type: 'password', value: match[1], raw: match[0], confidence: 0.9 };
  }
  return null;
}

function extractQuantity(text: string): Entity | null {
  const match = text.match(/(\d+)\s+fotos/i);
  if (match) {
    return { type: 'quantity', value: match[1], raw: match[0], confidence: 0.9 };
  }
  return null;
}

function detectIntent(text: string): { intent: Intent; confidence: number } {
  const lower = text.toLowerCase();

  const patterns: [Intent, RegExp, number][] = [
    ['create_gallery', /criar?\s+galeria|nova\s+galeria/i, 0.95],
    ['create_proposal', /criar?\s+proposta|proposta\s+para|orçamento\s+para/i, 0.95],
    ['create_post', /criar?\s+post|novo\s+post|publicar|artigo/i, 0.9],
    ['register_payment', /pagou|pagamento|pago|receb[ei]/i, 0.9],
    ['create_task', /tarefa|lembrar|adicionar\s+tarefa|separar|carregar|preparar/i, 0.85],
    ['create_reminder', /lembrete|lembrar\s+de/i, 0.85],
    ['register_lead', /lead|contato|interessad|quer\s+orçamento/i, 0.85],
    ['reschedule', /reagend|mudar\s+data|alterar\s+horário|mover\s+para/i, 0.9],
    ['send_message', /enviar\s+mensagem|mandar\s+msg|mensagem\s+para|avisar/i, 0.85],
    ['check_calendar', /agenda\s+d[eo]|o\s+que\s+tenho|compromissos|livre/i, 0.8],
    ['check_pending', /pendênci|pendente|atrasad|o\s+que\s+falta/i, 0.8],
    ['create_shoot', /marcar|agendar|ensaio|sessão|fotos?\s+(d[aeo]|para)|evento/i, 0.85],
    ['create_client', /novo\s+cliente|cadastrar\s+cliente|adicionar\s+cliente/i, 0.9],
  ];

  for (const [intent, pattern, confidence] of patterns) {
    if (pattern.test(lower)) {
      return { intent, confidence };
    }
  }
  
  // Fallback: if has date + client name, probably a shoot
  if (extractDate(text) && extractClientName(text)) {
    return { intent: 'create_shoot', confidence: 0.6 };
  }

  return { intent: 'unknown', confidence: 0.3 };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function parseCommand(text: string): ParseResult {
  const { intent, confidence: intentConfidence } = detectIntent(text);
  
  const entities: Entity[] = [];
  const missingFields: string[] = [];
  const suggestedActions: SuggestedAction[] = [];
  const warnings: string[] = [];

  // Extract all entities
  const clientName = extractClientName(text);
  if (clientName) entities.push(clientName);
  
  const date = extractDate(text);
  if (date) entities.push(date);
  
  const time = extractTime(text);
  if (time) entities.push(time);
  
  const value = extractValue(text);
  if (value) entities.push(value);
  
  const deposit = extractDeposit(text);
  if (deposit) entities.push(deposit);
  
  const location = extractLocation(text);
  if (location) entities.push(location);
  
  const eventType = extractEventType(text);
  if (eventType) entities.push(eventType);
  
  const duration = extractDuration(text);
  if (duration) entities.push(duration);
  
  const deadline = extractDeadline(text);
  if (deadline) entities.push(deadline);
  
  const password = extractPassword(text);
  if (password) entities.push(password);
  
  const quantity = extractQuantity(text);
  if (quantity) entities.push(quantity);

  const getEntity = (type: string) => entities.find(e => e.type === type)?.value || '';

  // Build suggested actions based on intent
  if (intent === 'create_shoot' || intent === 'create_event') {
    if (!clientName) missingFields.push('Nome do cliente');
    if (!date) missingFields.push('Data');
    if (!time) missingFields.push('Horário');

    if (clientName) {
      suggestedActions.push({
        id: generateId(),
        type: 'create_client',
        label: `Cadastrar cliente: ${clientName.value}`,
        description: 'Criar novo cliente no CRM se ainda não existir',
        data: { name: clientName.value, type: getEntity('event_type') || 'Evento', status: 'scheduled' },
        applied: false,
      });
    }

    suggestedActions.push({
      id: generateId(),
      type: 'create_shoot',
      label: `Criar ensaio: ${getEntity('event_type') || 'Sessão'} ${clientName?.value || ''}`,
      description: `${date?.value || 'Data a definir'} às ${time?.value || '--:--'} ${location ? `em ${location.value}` : ''}`,
      data: {
        name: `${getEntity('event_type') || 'Ensaio'} ${clientName?.value || ''}`,
        clientName: clientName?.value || '',
        date: date?.value || '',
        time: time?.value || '',
        location: getEntity('location'),
        type: getEntity('event_type') || 'Ensaio',
        value: value ? parseFloat(value.value) : 0,
        status: 'confirmed',
      },
      applied: false,
    });

    if (value) {
      suggestedActions.push({
        id: generateId(),
        type: 'create_invoice',
        label: `Criar cobrança: R$ ${parseFloat(value.value).toLocaleString('pt-BR')}`,
        description: deposit ? `Sinal de R$ ${parseFloat(deposit.value).toLocaleString('pt-BR')}` : 'Pagamento total',
        data: { value: parseFloat(value.value), deposit: deposit ? parseFloat(deposit.value) : 0 },
        applied: false,
      });
    }

    if (date) {
      suggestedActions.push({
        id: generateId(),
        type: 'create_reminder',
        label: 'Criar lembrete 24h antes',
        description: `Lembrete para confirmar ensaio com ${clientName?.value || 'o cliente'}`,
        data: { title: `Confirmar ensaio ${clientName?.value || ''}`, dueDate: date.value },
        applied: false,
      });
    }

    suggestedActions.push({
      id: generateId(),
      type: 'create_task',
      label: 'Criar checklist de preparação',
      description: 'Equipamento, backup, locação, briefing',
      data: { title: `Preparar equipamento - ${clientName?.value || ''}`, checklist: ['Baterias carregadas', 'Cartões formatados', 'Lentes limpas', 'Backup configurado'] },
      applied: false,
    });

    if (deadline) {
      suggestedActions.push({
        id: generateId(),
        type: 'create_task',
        label: `Prazo de entrega: ${deadline.value}`,
        description: 'Criar tarefa com deadline de entrega',
        data: { title: `Entrega ${clientName?.value || ''}`, deadline: deadline.value },
        applied: false,
      });
    }
  }

  if (intent === 'create_task' || intent === 'create_reminder') {
    suggestedActions.push({
      id: generateId(),
      type: 'create_task',
      label: `Criar tarefa`,
      description: text.substring(0, 100),
      data: { title: text.replace(/^(criar\s+tarefa:?\s*|lembrar\s+de\s*|adicionar\s+tarefa:?\s*)/i, '').trim(), dueDate: date?.value, priority: 'medium' },
      applied: false,
    });
  }

  if (intent === 'register_payment') {
    suggestedActions.push({
      id: generateId(),
      type: 'create_invoice',
      label: `Registrar pagamento${value ? `: R$ ${parseFloat(value.value).toLocaleString('pt-BR')}` : ''}`,
      description: `${clientName?.value || 'Cliente'} - ${date?.value || 'hoje'}`,
      data: { clientName: clientName?.value, value: value ? parseFloat(value.value) : 0, status: 'paid' },
      applied: false,
    });
  }

  if (intent === 'create_proposal') {
    suggestedActions.push({
      id: generateId(),
      type: 'create_proposal',
      label: `Criar proposta para ${clientName?.value || 'cliente'}`,
      description: `${getEntity('event_type') || 'Serviço'} - R$ ${value ? parseFloat(value.value).toLocaleString('pt-BR') : 'a definir'}`,
      data: { clientName: clientName?.value, service: getEntity('event_type'), value: value ? parseFloat(value.value) : 0 },
      applied: false,
    });
  }

  if (intent === 'create_gallery') {
    suggestedActions.push({
      id: generateId(),
      type: 'create_gallery',
      label: `Criar galeria para ${clientName?.value || 'cliente'}`,
      description: `${password ? `Senha: ${password.value}` : 'Sem senha'} ${quantity ? `• ${quantity.value} fotos selecionáveis` : ''}`,
      data: { clientName: clientName?.value, password: password?.value, maxSelections: quantity ? parseInt(quantity.value) : undefined },
      applied: false,
    });
  }

  if (intent === 'register_lead') {
    suggestedActions.push({
      id: generateId(),
      type: 'register_lead',
      label: `Registrar lead: ${clientName?.value || 'Novo contato'}`,
      description: `${getEntity('event_type') || 'Interesse geral'} ${date ? `para ${date.value}` : ''}`,
      data: { name: clientName?.value, type: getEntity('event_type'), notes: text },
      applied: false,
    });
  }

  if (intent === 'send_message') {
    suggestedActions.push({
      id: generateId(),
      type: 'send_message',
      label: `Enviar mensagem para ${clientName?.value || 'cliente'}`,
      description: 'Gerar mensagem profissional',
      data: { clientName: clientName?.value, messageType: 'general' },
      applied: false,
    });
  }

  // Build summary
  let summary = '';
  if (entities.length > 0) {
    const parts: string[] = [];
    if (clientName) parts.push(`Cliente: ${clientName.value}`);
    if (date) parts.push(`Data: ${date.value}`);
    if (time) parts.push(`Horário: ${time.value}`);
    if (location) parts.push(`Local: ${location.value}`);
    if (eventType) parts.push(`Tipo: ${eventType.value}`);
    if (value) parts.push(`Valor: R$ ${parseFloat(value.value).toLocaleString('pt-BR')}`);
    if (deposit) parts.push(`Sinal: R$ ${parseFloat(deposit.value).toLocaleString('pt-BR')}`);
    if (deadline) parts.push(`Entrega: ${deadline.value}`);
    summary = parts.join(' • ');
  } else {
    summary = 'Não foi possível identificar entidades específicas neste comando.';
  }

  // Warnings
  if (missingFields.length > 0 && suggestedActions.length > 0) {
    warnings.push(`Campos não identificados: ${missingFields.join(', ')}`);
  }

  return {
    intent,
    confidence: intentConfidence,
    entities,
    missingFields,
    suggestedActions,
    summary,
    warnings,
  };
}

// Message templates
export interface MessageTemplate {
  id: string;
  type: string;
  label: string;
  tones: Record<string, string>;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'confirmation',
    type: 'confirmation',
    label: 'Confirmação de agendamento',
    tones: {
      profissional: 'Olá {cliente}, confirmo nosso ensaio para {data} às {hora}. Local: {local}. Por favor, confirme sua presença. Qualquer dúvida, estou à disposição.',
      amigável: 'Oi {cliente}! 😊 Tudo confirmado para {data} às {hora}! Nos vemos em {local}. Se precisar de algo, é só chamar!',
      premium: 'Prezado(a) {cliente}, é um prazer confirmar sua sessão exclusiva para {data} às {hora} em {local}. Estamos preparando tudo com carinho para criar imagens memoráveis.',
      direto: '{cliente}, confirmado: {data}, {hora}, {local}. Confirme por favor.',
    },
  },
  {
    id: 'reminder',
    type: 'reminder_24h',
    label: 'Lembrete 24h antes',
    tones: {
      profissional: 'Olá {cliente}, lembrando que nosso ensaio é amanhã, {data} às {hora}. Dicas: descanse bem, hidrate a pele e separe as roupas. Até lá!',
      amigável: 'Ei {cliente}! 🎉 Amanhã é o grande dia! Lembre de descansar bastante e se hidratar. Vai ser incrível! Nos vemos às {hora}!',
      premium: 'Prezado(a) {cliente}, sua sessão está agendada para amanhã às {hora}. Preparamos um checklist para você: boa noite de sono, hidratação, looks separados. Aguardamos ansiosamente.',
      direto: '{cliente}, lembrete: amanhã, {hora}. Confirme presença.',
    },
  },
  {
    id: 'post_shoot',
    type: 'post_shoot',
    label: 'Agradecimento pós-ensaio',
    tones: {
      profissional: 'Olá {cliente}, foi um prazer fotografar você hoje! As prévias estarão disponíveis em breve. Obrigada pela confiança no nosso trabalho.',
      amigável: '{cliente}, que ensaio maravilhoso! 📸 Já estou ansiosa para editar. As prévias saem em breve! Obrigada por confiar no meu trabalho! 💛',
      premium: 'Prezado(a) {cliente}, foi uma honra capturar esses momentos especiais. Nossa equipe já está trabalhando nas suas imagens. Em breve você receberá as prévias exclusivas.',
      direto: '{cliente}, ensaio concluído. Prévias em até 5 dias. Obrigada!',
    },
  },
  {
    id: 'gallery_ready',
    type: 'gallery_ready',
    label: 'Galeria pronta',
    tones: {
      profissional: 'Olá {cliente}, sua galeria está pronta! Acesse pelo link abaixo para visualizar e selecionar suas favoritas. Prazo para seleção: 7 dias.',
      amigável: '{cliente}, suas fotos estão prontas! 🎊 Corre lá ver! Selecione suas favoritas e me conta o que achou! ❤️',
      premium: 'Prezado(a) {cliente}, é com satisfação que apresento sua galeria exclusiva. As imagens foram cuidadosamente editadas. Selecione suas favoritas com calma.',
      direto: '{cliente}, galeria disponível. Acesse, selecione favoritas. Prazo: 7 dias.',
    },
  },
  {
    id: 'polite_charge',
    type: 'polite_charge',
    label: 'Cobrança educada',
    tones: {
      profissional: 'Olá {cliente}, gostaria de lembrar que o pagamento de R$ {valor} referente ao {servico} está pendente. Podemos resolver? Estou à disposição.',
      amigável: 'Oi {cliente}! 😊 Passando para lembrar do pagamento de R$ {valor}. Se tiver alguma dúvida ou precisar de ajuda, me avise! Estou aqui.',
      premium: 'Prezado(a) {cliente}, informamos que identificamos uma pendência de R$ {valor}. Ficamos à disposição para facilitar o processo de pagamento.',
      direto: '{cliente}, pagamento pendente: R$ {valor}. Favor regularizar.',
    },
  },
  {
    id: 'review_request',
    type: 'review_request',
    label: 'Pedido de depoimento',
    tones: {
      profissional: 'Olá {cliente}, esperamos que esteja amando suas fotos! Gostaríamos de convidá-lo(a) a deixar um breve depoimento sobre sua experiência conosco.',
      amigável: '{cliente}! 💛 Espero que esteja curtindo as fotos! Se puder, me manda um depoimentozinho sobre como foi? Vai me ajudar muito! 🙏',
      premium: 'Prezado(a) {cliente}, sua opinião é extremamente valiosa. Gostaríamos de convidá-lo(a) a compartilhar sua experiência. Seu feedback nos ajuda a manter a excelência.',
      direto: '{cliente}, poderia nos enviar um depoimento sobre o trabalho? Obrigada!',
    },
  },
];

// Briefing templates by type
export const BRIEFING_TEMPLATES: Record<string, { questions: string[]; checklist: string[]; equipment: string[] }> = {
  casamento: {
    questions: ['Estilo da cerimônia (religioso, civil, ao ar livre)?', 'Número de convidados?', 'Horário da cerimônia e festa?', 'Noiva se arruma no local?', 'Tem making of dos noivos?', 'Quais fotos de família são essenciais?', 'Há restrições do local para fotografia?', 'Existe decoração especial para fotografar?'],
    checklist: ['Contrato assinado', 'Pagamento confirmado', 'Briefing completo', 'Locação visitada', 'Timeline do dia definida', 'Shot list aprovada', 'Segundo fotógrafo confirmado', 'Equipamento reserva preparado', 'Backup configurado', 'Entrega agendada'],
    equipment: ['2 corpos de câmera', 'Lente 24-70mm', 'Lente 70-200mm', 'Lente 35mm ou 50mm', 'Flash externo (2x)', 'Baterias extras (6+)', 'Cartões de memória (128GB+)', 'Tripé', 'Refletor', 'Drone (se autorizado)'],
  },
  corporativo: {
    questions: ['Dress code do evento?', 'Quantas pessoas para retrato?', 'Tem palco/palestra?', 'Precisa de fotos de marca/logotipos?', 'Autorização coletiva de imagem?', 'Entrega para redes sociais?', 'Há patrocinadores para fotografar?', 'Formato das fotos (horizontal/vertical)?'],
    checklist: ['Contrato assinado', 'Briefing do RH/Marketing', 'Lista de palestrantes', 'Autorização de imagem coletiva', 'Reconhecimento do local', 'Backup do evento anterior como referência', 'Fotos de marca separadas', 'Entrega rápida para redes combinada'],
    equipment: ['Câmera com ISO alto', 'Lente 24-70mm', 'Lente 70-200mm', 'Flash discreto', 'Tripé compacto', 'Cartões extras', 'Laptop para entrega express'],
  },
  retrato: {
    questions: ['Finalidade das fotos (pessoal, profissional, redes)?', 'Estilo preferido (natural, artístico, clean)?', 'Referências visuais?', 'Quantos looks/trocas de roupa?', 'Maquiagem profissional inclusa?', 'Ambiente preferido (estúdio, externo, urbano)?', 'Alguma restrição ou insegurança?', 'Uso das fotos (portfólio, LinkedIn, site)?'],
    checklist: ['Briefing preenchido', 'Referências recebidas', 'Locação confirmada', 'Horário (golden hour se externo)', 'Maquiadora confirmada', 'Looks definidos', 'Iluminação planejada'],
    equipment: ['Câmera full-frame', 'Lente 85mm f/1.4', 'Lente 50mm f/1.4', 'Refletor 5-em-1', 'Softbox portátil', 'Fundo portátil (se estúdio)'],
  },
  newborn: {
    questions: ['Idade do bebê na sessão?', 'O bebê tem alguma condição de saúde?', 'Preferência de cores/temas?', 'Inclui fotos com a família?', 'Local (estúdio ou residência)?', 'Temperatura do ambiente é controlável?', 'Há irmãos para incluir?', 'Estilo (lifestyle ou posed)?'],
    checklist: ['Aquecedor de ambiente', 'Props limpos e seguros', 'Mantas e wraps', 'White noise disponível', 'Área segura preparada', 'Assistente confirmada', 'Segurança em primeiro lugar'],
    equipment: ['Câmera silenciosa', 'Lente macro', 'Lente 50mm', 'Beanbag', 'Props seguros', 'Aquecedor', 'White noise speaker'],
  },
  evento: {
    questions: ['Tipo de evento?', 'Número de convidados?', 'Duração da cobertura?', 'Tem momentos-chave (bolo, brinde)?', 'Iluminação do local?', 'Há restrições de movimentação?', 'Entrega rápida necessária?', 'Fotos para imprensa?'],
    checklist: ['Contrato assinado', 'Cronograma do evento', 'Contato do organizador', 'Acesso ao local confirmado', 'Backup de equipamento', 'Entrega combinada'],
    equipment: ['2 corpos de câmera', 'Lente 24-70mm', 'Lente 70-200mm', 'Flash externo', 'Baterias extras', 'Cartões 128GB'],
  },
  produto: {
    questions: ['Quantos produtos?', 'Fundo preferido?', 'Escala/proporção necessária?', 'Fotos para e-commerce ou editorial?', 'Precisa de ambientação?', 'Recorte em fundo branco?', 'Ângulos necessários?', 'Vídeo também?'],
    checklist: ['Produtos recebidos', 'Briefing visual definido', 'Mesa de still life montada', 'Iluminação testada', 'Fundo infinito pronto', 'Shot list por produto'],
    equipment: ['Câmera com bom detalhe', 'Lente macro', 'Lente 50mm', 'Tripé robusto', 'Softbox (2x)', 'Mesa de still life', 'Fundo infinito'],
  },
  moda: {
    questions: ['Quantos looks?', 'Quantos modelos?', 'Estilo da marca?', 'Moodboard disponível?', 'Maquiadora e stylist inclusos?', 'Uso editorial ou e-commerce?', 'Cenários planejados?', 'Direitos de uso?'],
    checklist: ['Moodboard aprovado', 'Modelos confirmados', 'MUA e stylist confirmados', 'Estúdio reservado', 'Roupas passadas e organizadas', 'Shot list por look', 'Direitos de imagem assinados'],
    equipment: ['Câmera full-frame', 'Lente 85mm', 'Lente 35mm', 'Flash de estúdio (3+)', 'Softbox', 'Beauty dish', 'Ventilador', 'Fundos variados'],
  },
};
