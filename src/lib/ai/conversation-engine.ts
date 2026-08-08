// NoirFrame AI — Conversation Engine
// Manages multi-turn conversations for event creation/editing

import { extractEventFromText, type ExtractedEvent } from "./entity-extractor";

export interface ConversationState {
  id: string;
  step: "initial" | "collecting" | "confirming" | "editing" | "done";
  event: ExtractedEvent;
  history: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ConversationResponse {
  message: string;
  state: ConversationState;
  action: "ask_missing" | "ask_confirm" | "saved" | "editing" | "cancelled" | "continue";
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  type: "create_client" | "create_shoot" | "create_invoice" | "create_task";
  label: string;
  data: Record<string, unknown>;
}

// In-memory conversation store (per-session)
const conversations = new Map<string, ConversationState>();
const CONVERSATION_TTL = 30 * 60 * 1000; // 30 minutes

function cleanupOldConversations() {
  const now = Date.now();
  for (const [id, state] of conversations) {
    if (now - state.updatedAt > CONVERSATION_TTL) {
      conversations.delete(id);
    }
  }
}

export function getConversation(userId: string): ConversationState | null {
  cleanupOldConversations();
  return conversations.get(userId) || null;
}

export function clearConversation(userId: string): void {
  conversations.delete(userId);
}

// Format currency for display
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

// Format date for display
function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

// Generate summary of extracted event
function generateSummary(event: ExtractedEvent): string {
  const parts: string[] = [];

  if (event.eventType) parts.push(`📸 **${event.eventType}**`);
  if (event.clientName) parts.push(`👤 Cliente: **${event.clientName}**`);
  if (event.date) parts.push(`📅 Data: **${formatDateBR(event.date)}**`);
  if (event.time) parts.push(`🕐 Horário: **${event.time}**`);
  if (event.location) parts.push(`📍 Local: **${event.location}**`);
  if (event.totalValue) parts.push(`💰 Valor: **${formatCurrency(event.totalValue)}**`);
  if (event.paidValue) parts.push(`✅ Pago: **${formatCurrency(event.paidValue)}**`);
  if (event.paymentStatus) {
    const statusMap = { paid: "Pago ✅", partial: "Parcial ⚠️", pending: "Pendente 🔴" };
    parts.push(`💳 Pagamento: **${statusMap[event.paymentStatus]}**`);
  }
  if (event.guestCount) parts.push(`👥 Convidados: **${event.guestCount}**`);
  if (event.eventLevel) {
    const levelMap: Record<string, string> = { basic: "Básico", intermediate: "Intermediário", premium: "Premium", luxury: "Luxo" };
    parts.push(`⭐ Nível: **${levelMap[event.eventLevel] || event.eventLevel}**`);
  }
  if (event.packageName) parts.push(`📦 Pacote: **${event.packageName}**`);
  if (event.notes) parts.push(`📝 Observações: ${event.notes}`);

  return parts.join("\n");
}

// Generate question for missing fields
function generateQuestion(missingFields: string[]): string {
  if (missingFields.length === 0) return "";

  const fieldQuestions: Record<string, string> = {
    "Nome do cliente": "Qual é o nome do cliente?",
    "Data do evento": "Qual a data do evento?",
    "Tipo de evento": "Que tipo de evento é? (casamento, ensaio, aniversário, etc.)",
    "Horário": "Qual o horário?",
    "Local": "Onde será o evento?",
    "Valor": "Qual o valor do contrato?",
  };

  if (missingFields.length === 1) {
    return fieldQuestions[missingFields[0]] || `Qual é ${missingFields[0].toLowerCase()}?`;
  }

  const questions = missingFields
    .slice(0, 3) // Max 3 questions at a time
    .map(f => fieldQuestions[f] || f.toLowerCase());

  return `Preciso de mais algumas informações:\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
}

// Merge new extraction into existing event (update only non-null fields)
function mergeEvents(existing: ExtractedEvent, update: ExtractedEvent): ExtractedEvent {
  return {
    clientName: update.clientName || existing.clientName,
    eventType: update.eventType || existing.eventType,
    date: update.date || existing.date,
    time: update.time || existing.time,
    endTime: update.endTime || existing.endTime,
    location: update.location || existing.location,
    totalValue: update.totalValue ?? existing.totalValue,
    paidValue: update.paidValue ?? existing.paidValue,
    paymentStatus: update.paymentStatus || existing.paymentStatus,
    guestCount: update.guestCount ?? existing.guestCount,
    eventLevel: update.eventLevel || existing.eventLevel,
    notes: update.notes || existing.notes,
    duration: update.duration || existing.duration,
    packageName: update.packageName || existing.packageName,
    confidence: Math.max(update.confidence, existing.confidence),
    warnings: [...new Set([...existing.warnings, ...update.warnings])],
    missingCritical: update.missingCritical.filter(f => {
      // Remove from missing if now present in merged
      const merged = { ...existing, ...update };
      if (f === "Nome do cliente" && merged.clientName) return false;
      if (f === "Data do evento" && merged.date) return false;
      if (f === "Tipo de evento" && merged.eventType) return false;
      return true;
    }),
  };
}

// Build suggested actions from extracted event
function buildActions(event: ExtractedEvent): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  // Always suggest creating a shoot
  if (event.clientName && event.date) {
    actions.push({
      type: "create_shoot",
      label: `Criar ensaio: ${event.eventType || "Sessão"} — ${event.clientName}`,
      data: {
        name: `${event.eventType || "Sessão"} — ${event.clientName}`,
        clientName: event.clientName,
        type: event.eventType || "Ensaio",
        date: event.date,
        time: event.time,
        location: event.location,
        value: event.totalValue ? event.totalValue / 100 : 0,
        packageName: event.packageName,
        notes: event.notes,
        status: "confirmed",
      },
    });
  }

  // Suggest creating client if name provided
  if (event.clientName) {
    actions.push({
      type: "create_client",
      label: `Cadastrar cliente: ${event.clientName}`,
      data: {
        name: event.clientName,
        status: "scheduled",
        type: event.eventType,
      },
    });
  }

  // Suggest creating invoice if value provided
  if (event.totalValue && event.clientName) {
    actions.push({
      type: "create_invoice",
      label: `Criar cobrança: ${formatCurrency(event.totalValue)}`,
      data: {
        clientName: event.clientName,
        description: `${event.eventType || "Serviço"} — ${event.clientName}`,
        amount: event.totalValue / 100,
        status: event.paymentStatus === "paid" ? "paid" : "pending",
      },
    });
  }

  return actions;
}

// Check if user wants to edit
function isEditCommand(text: string): { field: string; value: string } | null {
  const lower = text.toLowerCase();
  const editPatterns: [RegExp, string][] = [
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:o\s+)?horário\s+(?:para|pra)\s+(.+)/i, "time"],
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:a\s+)?data\s+(?:para|pra)\s+(.+)/i, "date"],
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:o\s+)?local\s+(?:para|pra)\s+(.+)/i, "location"],
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:o\s+)?valor\s+(?:para|pra)\s+(.+)/i, "value"],
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:o\s+)?nome\s+(?:para|pra)\s+(.+)/i, "clientName"],
    [/(?:muda|alterar?|trocar?|corrigir?)\s+(?:o\s+)?tipo\s+(?:para|pra)\s+(.+)/i, "eventType"],
  ];

  for (const [pattern, field] of editPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return { field, value: match[1].trim() };
    }
  }
  return null;
}

// Check if user confirms
function isConfirmation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return /^(sim|s|confirma|confirmo|correto|isso|exato|perfeito|ok|tá|ta|pode|salvar|salva|grava|gravar|yes|y|positivo|bora|manda|vai)$/i.test(lower);
}

// Check if user cancels
function isCancellation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return /^(não|nao|n|cancela|cancelar|desistir|parar|sair|voltar|no|esqueça|esquece)$/i.test(lower);
}

// ====== MAIN CONVERSATION PROCESSOR ======
export function processMessage(userId: string, userText: string): ConversationResponse {
  let state = getConversation(userId);
  const now = Date.now();

  // Add user message to history
  const userMessage: ConversationMessage = { role: "user", content: userText, timestamp: now };

  // ====== CANCEL ======
  if (isCancellation(userText)) {
    clearConversation(userId);
    return {
      message: "❌ Operação cancelada. Pode me dizer outra coisa quando quiser!",
      state: { id: userId, step: "done", event: {} as ExtractedEvent, history: [], createdAt: now, updatedAt: now },
      action: "cancelled",
    };
  }

  // ====== CONFIRMATION (when in confirming step) ======
  if (state?.step === "confirming" && isConfirmation(userText)) {
    state.step = "done";
    state.updatedAt = now;
    state.history.push(userMessage);

    const actions = buildActions(state.event);
    const response = "✅ Perfeito! Dados confirmados. Escolha as ações abaixo para criar os registros:";

    state.history.push({ role: "assistant", content: response, timestamp: now });
    conversations.set(userId, state);

    return {
      message: response,
      state,
      action: "saved",
      suggestedActions: actions,
    };
  }

  // ====== EDIT COMMAND (when in confirming step) ======
  if (state?.step === "confirming") {
    const editCmd = isEditCommand(userText);
    if (editCmd) {
      // Re-extract the new value
      const partialExtraction = extractEventFromText(editCmd.value);
      
      // Apply specific field edit
      switch (editCmd.field) {
        case "time":
          if (partialExtraction.time || partialExtraction.date) {
            state.event.time = partialExtraction.time || state.event.time;
          }
          break;
        case "date":
          if (partialExtraction.date) {
            state.event.date = partialExtraction.date;
          }
          break;
        case "location":
          state.event.location = editCmd.value;
          break;
        case "value":
          if (partialExtraction.totalValue) {
            state.event.totalValue = partialExtraction.totalValue;
          }
          break;
        case "clientName":
          state.event.clientName = editCmd.value;
          break;
        case "eventType":
          if (partialExtraction.eventType) {
            state.event.eventType = partialExtraction.eventType;
          }
          break;
      }

      state.updatedAt = now;
      state.history.push(userMessage);

      const summary = generateSummary(state.event);
      const response = `✏️ Atualizado! Veja o resumo:\n\n${summary}\n\n${state.event.warnings.length > 0 ? state.event.warnings.join("\n") + "\n\n" : ""}Confirma? (sim/não) Ou diga o que quer alterar.`;

      state.history.push({ role: "assistant", content: response, timestamp: now });
      conversations.set(userId, state);

      return { message: response, state, action: "editing" };
    }
  }

  // ====== NEW or CONTINUING CONVERSATION ======
  const extraction = extractEventFromText(userText);

  if (state && state.step !== "done") {
    // Merge new extraction with existing
    state.event = mergeEvents(state.event, extraction);
    state.updatedAt = now;
    state.history.push(userMessage);
  } else {
    // Start new conversation
    state = {
      id: userId,
      step: "initial",
      event: extraction,
      history: [userMessage],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ====== DETERMINE NEXT STEP ======

  // If too little information, ask for more
  if (extraction.confidence < 0.15 && !state.event.clientName && !state.event.date) {
    const response = "🤔 Não consegui entender muito bem. Pode me dar mais detalhes?\n\nPor exemplo: \"Vinicius marcou casamento dia 15/08 às 18h, R$3.500, Espaço Jardins\"\n\nOu diga o que precisa de forma simples.";
    state.step = "collecting";
    state.history.push({ role: "assistant", content: response, timestamp: now });
    conversations.set(userId, state);
    return { message: response, state, action: "continue" };
  }

  // If missing critical fields, ask
  const stillMissing = state.event.missingCritical.filter(f => {
    if (f === "Nome do cliente" && state!.event.clientName) return false;
    if (f === "Data do evento" && state!.event.date) return false;
    if (f === "Tipo de evento" && state!.event.eventType) return false;
    return true;
  });

  if (stillMissing.length > 0) {
    const question = generateQuestion(stillMissing);
    const summary = generateSummary(state.event);
    const response = `Entendi! Até agora tenho:\n\n${summary}\n\n${question}`;
    
    state.step = "collecting";
    state.history.push({ role: "assistant", content: response, timestamp: now });
    conversations.set(userId, state);

    return { message: response, state, action: "ask_missing" };
  }

  // All critical fields present — ask for confirmation
  const summary = generateSummary(state.event);
  const warningText = state.event.warnings.length > 0 
    ? "\n\n" + state.event.warnings.join("\n") 
    : "";
  
  const response = `Entendi tudo! Veja o resumo:\n\n${summary}${warningText}\n\n**Confirma?** (sim/não) Ou diga o que quer alterar (ex: "muda o horário para 19h")`;
  
  state.step = "confirming";
  state.history.push({ role: "assistant", content: response, timestamp: now });
  conversations.set(userId, state);

  return { message: response, state, action: "ask_confirm" };
}
