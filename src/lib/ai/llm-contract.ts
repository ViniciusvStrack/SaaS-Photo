/**
 * Provider-neutral contract for an optional LLM extraction stage.
 * The current runtime uses the deterministic rules engine. A future provider
 * adapter must return this exact shape before the conversation engine sees it.
 */
export const EVENT_EXTRACTION_SYSTEM_PROMPT = `
Voce e o extrator de eventos do NoirFrame, um SaaS para fotografos.
Converta apenas informacoes explicitamente fornecidas pelo usuario.
Nao invente datas, meses, valores, nomes ou locais.
Quando houver ambiguidade, preencha ambiguities e deixe o campo como null.
Quando houver mais de um evento, nao combine os dados: sinalize multiple_events.
Valores monetarios devem ser inteiros em centavos e datas devem usar YYYY-MM-DD.
Sua resposta deve obedecer integralmente ao JSON Schema fornecido.
Voce nunca grava dados nem executa acoes; apenas extrai e valida.
`;

export const EVENT_EXTRACTION_JSON_SCHEMA = {
  name: "photography_event_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: {
        type: "string",
        enum: ["create_event", "update_event", "cancel_event", "register_payment", "unknown"],
      },
      clientName: { type: ["string", "null"] },
      eventType: { type: ["string", "null"] },
      date: { type: ["string", "null"], description: "ISO date YYYY-MM-DD" },
      time: { type: ["string", "null"], description: "24-hour time HH:mm" },
      endTime: { type: ["string", "null"] },
      location: { type: ["string", "null"] },
      totalValue: { type: ["integer", "null"], minimum: 0, description: "BRL cents" },
      paidValue: { type: ["integer", "null"], minimum: 0, description: "BRL cents" },
      paymentStatus: { type: ["string", "null"], enum: ["paid", "partial", "pending", null] },
      guestCount: { type: ["integer", "null"], minimum: 0 },
      eventLevel: { type: ["string", "null"] },
      notes: { type: ["string", "null"] },
      packageName: { type: ["string", "null"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      missingCritical: { type: "array", items: { type: "string" } },
      ambiguities: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
      multipleEvents: { type: "boolean" },
    },
    required: [
      "intent", "clientName", "eventType", "date", "time", "endTime",
      "location", "totalValue", "paidValue", "paymentStatus", "guestCount",
      "eventLevel", "notes", "packageName", "confidence", "missingCritical",
      "ambiguities", "warnings", "multipleEvents",
    ],
  },
} as const;

export const AI_ARCHITECTURE = {
  flow: [
    "input_normalization",
    "deterministic_extraction",
    "optional_llm_fallback",
    "schema_validation",
    "conversation_clarification",
    "human_confirmation",
    "orm_execution",
    "audit_log",
  ],
  llmFallbackThreshold: 0.55,
} as const;
