# 🚀 PROMPTS COMPLETOS — CHAT 1 (BACKEND)

Estes são 5 prompts extremamente detalhados para serem executados sequencialmente pelo Chat 1 (Backend). Cada prompt é uma missão completa que deve ser finalizada antes de passar para a próxima.

---

# 📌 PROMPT 1: INFRAESTRUTURA BASE E TODAS AS API ROUTES

## Contexto
Você é o CHAT 1 (BACKEND) do projeto NoirFrame — um SaaS premium para fotógrafos profissionais. Leia o arquivo `DIVISION.md` para entender sua responsabilidade. Você NÃO pode editar arquivos de páginas (`src/app/app/`, `src/app/admin/`, `src/app/client/`, `src/components/`). Seu foco é exclusivamente em APIs, hooks, libs e seed.

## Missão
Criar TODA a infraestrutura backend necessária para que o frontend possa se conectar ao banco de dados PostgreSQL real. Isso inclui:

### PARTE A — Hook useApi Reutilizável

Criar `src/hooks/useApi.ts` com:

```typescript
// Hook para GET requests com cache, loading, error, refetch
export function useApi<T>(url: string, options?: {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

// Hook para mutations (POST, PATCH, DELETE)
export function useApiMutation<TData, TResponse = any>(
  url: string,
  method: "POST" | "PATCH" | "DELETE"
): {
  mutate: (data?: TData) => Promise<{ success: boolean; data?: TResponse; error?: string }>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

// Hook para upload de arquivos
export function useApiUpload(url: string): {
  upload: (file: File, onProgress?: (percent: number) => void) => Promise<{ success: boolean; url?: string; error?: string }>;
  loading: boolean;
  progress: number;
  error: string | null;
}

// Utilitário para invalidar cache
export function invalidateCache(urlPattern: string): void;

// Utilitário para prefetch
export function prefetchApi(url: string): Promise<void>;
```

Implementar com:
- Cache em memória com TTL configurável
- Deduplicação de requests simultâneos
- Retry automático em caso de falha de rede (3 tentativas com backoff exponencial)
- Suporte a AbortController para cancelamento
- Interceptor global para adicionar headers de autenticação
- Tratamento de erros 401 (redirecionar para login)
- Tratamento de erros 403 (mostrar erro de permissão)
- Tratamento de erros 429 (rate limit - aguardar e retry)
- Tratamento de erros 500 (erro do servidor)

### PARTE B — Constantes de UI

Criar `src/lib/constants.ts` com:

```typescript
// Status de Ensaios
export const SHOOT_STATUS = {
  lead: { label: "Lead", color: "bg-slate-500", textColor: "text-slate-500", icon: "UserPlus" },
  confirmed: { label: "Confirmado", color: "bg-blue-500", textColor: "text-blue-500", icon: "CheckCircle" },
  photographed: { label: "Fotografado", color: "bg-purple-500", textColor: "text-purple-500", icon: "Camera" },
  editing: { label: "Em Edição", color: "bg-amber-500", textColor: "text-amber-500", icon: "Edit" },
  delivered: { label: "Entregue", color: "bg-green-500", textColor: "text-green-500", icon: "Package" },
  paid: { label: "Pago", color: "bg-emerald-600", textColor: "text-emerald-600", icon: "DollarSign" },
  cancelled: { label: "Cancelado", color: "bg-red-500", textColor: "text-red-500", icon: "X" },
} as const;

// Status de Galerias
export const GALLERY_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviada", color: "bg-blue-500", textColor: "text-blue-500" },
  viewed: { label: "Visualizada", color: "bg-purple-500", textColor: "text-purple-500" },
  selection_received: { label: "Seleção Recebida", color: "bg-amber-500", textColor: "text-amber-500" },
  delivered: { label: "Entregue", color: "bg-green-500", textColor: "text-green-500" },
} as const;

// Status de Propostas
export const PROPOSAL_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviada", color: "bg-blue-500", textColor: "text-blue-500" },
  accepted: { label: "Aceita", color: "bg-green-500", textColor: "text-green-500" },
  declined: { label: "Recusada", color: "bg-red-500", textColor: "text-red-500" },
  expired: { label: "Expirada", color: "bg-slate-400", textColor: "text-slate-400" },
} as const;

// Status de Contratos
export const CONTRACT_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviado", color: "bg-blue-500", textColor: "text-blue-500" },
  signed: { label: "Assinado", color: "bg-green-500", textColor: "text-green-500" },
  completed: { label: "Concluído", color: "bg-emerald-600", textColor: "text-emerald-600" },
  cancelled: { label: "Cancelado", color: "bg-red-500", textColor: "text-red-500" },
} as const;

// Status de Pagamentos
export const PAYMENT_STATUS = {
  pending: { label: "Pendente", color: "bg-amber-500", textColor: "text-amber-500" },
  paid: { label: "Pago", color: "bg-green-500", textColor: "text-green-500" },
  overdue: { label: "Atrasado", color: "bg-red-500", textColor: "text-red-500" },
  cancelled: { label: "Cancelado", color: "bg-slate-500", textColor: "text-slate-500" },
  refunded: { label: "Reembolsado", color: "bg-purple-500", textColor: "text-purple-500" },
} as const;

// Status de Tarefas
export const TASK_STATUS = {
  backlog: { label: "Backlog", color: "bg-slate-500" },
  today: { label: "Hoje", color: "bg-blue-500" },
  in_progress: { label: "Em Progresso", color: "bg-amber-500" },
  waiting_client: { label: "Aguardando Cliente", color: "bg-purple-500" },
  done: { label: "Concluído", color: "bg-green-500" },
} as const;

// Prioridades
export const PRIORITY = {
  low: { label: "Baixa", color: "bg-slate-400", textColor: "text-slate-400" },
  medium: { label: "Média", color: "bg-blue-500", textColor: "text-blue-500" },
  high: { label: "Alta", color: "bg-amber-500", textColor: "text-amber-500" },
  urgent: { label: "Urgente", color: "bg-red-500", textColor: "text-red-500" },
} as const;

// Tipos de Ensaio
export const SHOOT_TYPES = [
  "Casamento",
  "Ensaio",
  "Aniversário",
  "Corporativo",
  "Newborn",
  "Gestante",
  "Família",
  "15 Anos",
  "Formatura",
  "Batizado",
  "Evento",
  "Produto",
  "Imobiliário",
  "Outro",
] as const;

// Categorias de Blog
export const BLOG_CATEGORIES = [
  "Dicas",
  "Bastidores",
  "Ensaios",
  "Casamentos",
  "Equipamentos",
  "Edição",
  "Negócios",
  "Inspiração",
] as const;

// Planos do SaaS
export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 79,
    priceYearly: 790,
    storage: 10, // GB
    features: ["Até 5 clientes/mês", "1 galeria ativa", "Marca d'água básica", "Suporte por email"],
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 149,
    priceYearly: 1490,
    storage: 50,
    features: ["Clientes ilimitados", "Galerias ilimitadas", "Contratos digitais", "Automações básicas", "Suporte prioritário"],
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: 299,
    priceYearly: 2990,
    storage: 200,
    features: ["Tudo do Professional", "Multi-usuário (3)", "Assistente IA", "Integrações", "Suporte VIP"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 599,
    priceYearly: 5990,
    storage: 1000,
    features: ["Tudo do Studio", "Usuários ilimitados", "API personalizada", "White-label", "Gerente de conta dedicado"],
  },
} as const;

// Automações disponíveis
export const AUTOMATION_TRIGGERS = {
  before_shoot: { label: "Antes do Ensaio", description: "Envia lembrete X dias antes" },
  after_shoot: { label: "Após o Ensaio", description: "Envia agradecimento após ensaio" },
  gallery_ready: { label: "Galeria Pronta", description: "Notifica quando galeria está pronta" },
  payment_due: { label: "Pagamento Pendente", description: "Lembra sobre pagamento próximo do vencimento" },
  birthday: { label: "Aniversário", description: "Envia felicitações no aniversário do cliente" },
  proposal_followup: { label: "Follow-up Proposta", description: "Lembra sobre proposta sem resposta" },
  review_request: { label: "Pedido de Avaliação", description: "Solicita avaliação após entrega" },
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  network: "Erro de conexão. Verifique sua internet.",
  unauthorized: "Sessão expirada. Faça login novamente.",
  forbidden: "Você não tem permissão para esta ação.",
  not_found: "Recurso não encontrado.",
  validation: "Dados inválidos. Verifique os campos.",
  server: "Erro interno. Tente novamente mais tarde.",
  rate_limit: "Muitas requisições. Aguarde um momento.",
} as const;

// Formatos de data
export const DATE_FORMATS = {
  short: "dd/MM/yyyy",
  long: "dd 'de' MMMM 'de' yyyy",
  withTime: "dd/MM/yyyy 'às' HH:mm",
  time: "HH:mm",
  month: "MMMM yyyy",
  weekday: "EEEE, dd/MM",
} as const;

// Configurações de paginação
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;
```

### PARTE C — Utilitários de API

Criar `src/lib/api-utils.ts` com:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

// Response helpers
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiPaginated<T>(data: T[], total: number, page: number, pageSize: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  });
}

// Validation helper
export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: apiError(error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", "), 400) };
    }
    return { error: apiError("Corpo da requisição inválido", 400) };
  }
}

// Query params helper
export function getQueryParams(req: NextRequest) {
  const url = new URL(req.url);
  return {
    page: parseInt(url.searchParams.get("page") || "1"),
    pageSize: Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100),
    search: url.searchParams.get("search") || "",
    status: url.searchParams.get("status") || "",
    sortBy: url.searchParams.get("sortBy") || "createdAt",
    sortOrder: (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc",
    startDate: url.searchParams.get("startDate") || "",
    endDate: url.searchParams.get("endDate") || "",
  };
}

// Audit log helper
export async function createAuditLog(
  db: any,
  userId: string,
  studioId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: Record<string, any>
) {
  // Insert into audit_logs table
}
```

### PARTE D — Todas as API Routes

Criar TODAS as seguintes API routes com validação Zod, autenticação, filtros, paginação e audit logs:

#### Galleries
- `GET /api/galleries` — Listar galerias do estúdio (com paginação, filtros por status, cliente, data)
- `POST /api/galleries` — Criar galeria (validar campos obrigatórios)
- `GET /api/galleries/[id]` — Detalhes da galeria com fotos e estatísticas
- `PATCH /api/galleries/[id]` — Atualizar galeria (incluindo status)
- `DELETE /api/galleries/[id]` — Soft delete

#### Photos
- `GET /api/photos` — Listar fotos (filtros: galleryId, isPortfolio, isFavorite, tags)
- `POST /api/photos` — Adicionar foto (recebe URL ou base64)
- `GET /api/photos/[id]` — Detalhes da foto
- `PATCH /api/photos/[id]` — Atualizar (tags, portfolio, etc)
- `DELETE /api/photos/[id]` — Deletar foto
- `POST /api/photos/bulk` — Upload em lote

#### Blog
- `GET /api/blog` — Listar posts do estúdio
- `POST /api/blog` — Criar post
- `GET /api/blog/[id]` — Detalhes do post
- `PATCH /api/blog/[id]` — Atualizar post
- `DELETE /api/blog/[id]` — Deletar post
- `POST /api/blog/[id]/publish` — Publicar post
- `GET /api/public/blog` — Posts publicados (público, sem auth)
- `GET /api/public/blog/[slug]` — Post por slug (público)

#### Proposals
- `GET /api/proposals` — Listar propostas
- `POST /api/proposals` — Criar proposta com items
- `GET /api/proposals/[id]` — Detalhes com items
- `PATCH /api/proposals/[id]` — Atualizar
- `POST /api/proposals/[id]/send` — Enviar (email + notificação)
- `POST /api/proposals/[id]/accept` — Aceitar (para cliente)
- `POST /api/proposals/[id]/decline` — Recusar (para cliente)
- `POST /api/proposals/[id]/duplicate` — Duplicar proposta

#### Contracts
- `GET /api/contracts` — Listar contratos
- `POST /api/contracts` — Criar contrato
- `GET /api/contracts/[id]` — Detalhes
- `PATCH /api/contracts/[id]` — Atualizar
- `POST /api/contracts/[id]/send` — Enviar
- `POST /api/contracts/[id]/sign` — Assinar (gera hash de assinatura)
- `GET /api/contracts/[id]/pdf` — Gerar PDF do contrato

#### Finance / Invoices
- `GET /api/invoices` — Listar faturas
- `POST /api/invoices` — Criar fatura
- `GET /api/invoices/[id]` — Detalhes
- `PATCH /api/invoices/[id]` — Atualizar (marcar pago, cancelar)
- `POST /api/invoices/[id]/send-reminder` — Enviar lembrete

#### Shoots (complementar existente)
- `GET /api/shoots/[id]` — Detalhes do ensaio
- `PATCH /api/shoots/[id]` — Atualizar
- `DELETE /api/shoots/[id]` — Soft delete
- `POST /api/shoots/[id]/checklist` — Atualizar checklist

#### Messages
- `GET /api/messages` — Listar mensagens
- `POST /api/messages` — Criar mensagem
- `GET /api/messages/[id]` — Detalhes com replies
- `PATCH /api/messages/[id]/read` — Marcar como lida
- `POST /api/messages/[id]/reply` — Responder
- `GET /api/messages/unread-count` — Contador de não lidas

#### Automations
- `GET /api/automations` — Listar automações
- `POST /api/automations` — Criar automação
- `PATCH /api/automations/[id]` — Atualizar
- `POST /api/automations/[id]/toggle` — Ativar/desativar
- `POST /api/automations/[id]/test` — Testar automação

#### Notifications
- `GET /api/notifications` — Listar notificações
- `PATCH /api/notifications/[id]/read` — Marcar como lida
- `POST /api/notifications/read-all` — Marcar todas como lidas
- `DELETE /api/notifications/[id]` — Deletar notificação

#### Admin
- `GET /api/admin/metrics` — Métricas do SaaS (MRR, churn, users, etc)
- `GET /api/admin/users` — Listar todos usuários
- `PATCH /api/admin/users/[id]` — Ativar/desativar/alterar role
- `GET /api/admin/studios` — Listar todos estúdios
- `PATCH /api/admin/studios/[id]` — Alterar plano, limites
- `GET /api/admin/tickets` — Listar tickets de suporte
- `PATCH /api/admin/tickets/[id]` — Atualizar status ticket
- `GET /api/admin/audit-logs` — Logs de auditoria

#### Analytics
- `GET /api/analytics` — Métricas do estúdio
- `GET /api/analytics/revenue` — Receita por período
- `GET /api/analytics/clients` — Métricas de clientes
- `GET /api/analytics/shoots` — Métricas de ensaios
- `GET /api/analytics/conversion` — Funil de conversão

#### Client Portal
- `GET /api/client/dashboard` — Dashboard do cliente
- `GET /api/client/galleries` — Galerias do cliente
- `GET /api/client/galleries/[id]` — Detalhes da galeria
- `POST /api/client/galleries/[id]/favorite` — Favoritar foto
- `POST /api/client/galleries/[id]/selection` — Enviar seleção
- `GET /api/client/proposals` — Propostas do cliente
- `GET /api/client/contracts` — Contratos do cliente
- `POST /api/client/contracts/[id]/sign` — Assinar contrato
- `GET /api/client/invoices` — Faturas do cliente

#### Settings
- `GET /api/settings/studio` — Configurações do estúdio
- `PATCH /api/settings/studio` — Atualizar configurações
- `PATCH /api/settings/password` — Alterar senha
- `GET /api/settings/integrations` — Status das integrações
- `POST /api/settings/integrations/[provider]` — Conectar integração

### PARTE E — Validação Zod Schemas

Criar `src/lib/validations.ts` com schemas Zod para TODAS as entidades:

```typescript
import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(["lead", "negotiation", "scheduled", "photographed", "editing", "delivered", "recurring"]).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  birthday: z.string().optional(),
  instagram: z.string().optional(),
  referralSource: z.string().optional(),
});

export const shootSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  value: z.number().min(0).optional(),
  packageName: z.string().optional(),
  notes: z.string().optional(),
  briefing: z.string().optional(),
});

export const gallerySchema = z.object({
  name: z.string().min(2),
  clientId: z.string(),
  shootId: z.string().optional(),
  password: z.string().optional(),
  allowDownload: z.boolean().optional(),
  allowFavorites: z.boolean().optional(),
  maxSelections: z.number().optional(),
  expiresAt: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export const photoSchema = z.object({
  galleryId: z.string(),
  url: z.string().url(),
  filename: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  sizeMb: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isPortfolio: z.boolean().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(5),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(50),
  coverUrl: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  publishAt: z.string().optional(),
});

export const proposalSchema = z.object({
  clientId: z.string(),
  service: z.string(),
  package: z.string().optional(),
  validUntil: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })),
  discount: z.number().min(0).optional(),
});

export const contractSchema = z.object({
  clientId: z.string(),
  proposalId: z.string().optional(),
  shootId: z.string().optional(),
  title: z.string(),
  service: z.string(),
  value: z.number().min(0),
  terms: z.string(),
  clauses: z.array(z.string()).optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string(),
  shootId: z.string().optional(),
  description: z.string(),
  amount: z.number().min(0),
  dueDate: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["backlog", "today", "in_progress", "waiting_client", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  clientId: z.string().optional(),
  shootId: z.string().optional(),
});

export const messageSchema = z.object({
  clientId: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().min(1),
  type: z.enum(["inquiry", "gallery_comment", "approval", "general"]).optional(),
});

export const automationSchema = z.object({
  name: z.string(),
  trigger: z.enum(["before_shoot", "after_shoot", "gallery_ready", "payment_due", "birthday", "proposal_followup", "review_request"]),
  triggerValue: z.number().optional(),
  action: z.string(),
  template: z.string(),
  isActive: z.boolean().optional(),
});

// Query params schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
```

### PARTE F — Seed Expandido

Atualizar `src/db/seed.ts` para incluir:
- 3 usuários (admin, photographer, client)
- 2 estúdios
- 15+ clientes (variados status)
- 12+ ensaios (todos os status, datas passadas e futuras)
- 10+ galerias (todos os status)
- 50+ fotos (distribuídas entre galerias)
- 10+ posts de blog (publicados, rascunhos, agendados)
- 10+ propostas (todos os status)
- 8+ contratos (todos os status)
- 25+ faturas (distribuídas nos últimos 6 meses para gráficos bonitos)
- 20+ tarefas (distribuídas no kanban)
- 15+ mensagens (lidas e não lidas)
- 8+ automações (ativas e inativas)
- 12+ notificações (lidas e não lidas)

Os dados devem ser realistas e coerentes entre si (ex: ensaio tem cliente válido, galeria tem fotos, etc).

### Ao finalizar:
1. Rodar `npx drizzle-kit push`
2. Rodar `npx tsx src/db/seed.ts`
3. Testar todas as APIs com `build_and_start`
4. Fazer `git add . && git commit -m "feat: complete API infrastructure + hooks + constants + seed" && git push`

---

# 📌 PROMPT 2: INTEGRAÇÕES EXTERNAS E SERVIÇOS

## Contexto
Você é o CHAT 1 (BACKEND). O projeto já tem todas as API routes básicas funcionando. Agora é hora de integrar serviços externos para funcionalidades premium.

## Missão
Implementar integrações com serviços externos de forma modular e extensível.

### PARTE A — Estrutura de Integrações

Criar `src/lib/integrations/` com arquivos separados para cada integração:

```
src/lib/integrations/
├── index.ts              # Export all integrations
├── types.ts              # Shared types
├── email.ts              # Email service (Resend/Nodemailer)
├── storage.ts            # Cloud storage (Cloudflare R2/S3)
├── payment.ts            # Payment gateway (Stripe)
├── calendar.ts           # Calendar sync (Google Calendar)
├── whatsapp.ts           # WhatsApp Business API
├── sms.ts                # SMS service (Twilio)
├── pdf.ts                # PDF generation
└── analytics.ts          # External analytics
```

### PARTE B — Email Service

Criar integração de email com templates HTML bonitos:

```typescript
// src/lib/integrations/email.ts
export interface EmailService {
  send(options: {
    to: string;
    subject: string;
    template: EmailTemplate;
    variables: Record<string, string>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export type EmailTemplate =
  | "welcome"
  | "proposal_sent"
  | "proposal_accepted"
  | "contract_sent"
  | "contract_signed"
  | "gallery_ready"
  | "payment_reminder"
  | "payment_received"
  | "shoot_reminder"
  | "review_request"
  | "birthday"
  | "password_reset";

// Templates HTML responsivos e elegantes no estilo NoirFrame (all-black premium)
```

Criar `src/lib/email-templates/` com templates HTML para cada tipo de email.

### PARTE C — Cloud Storage

Integração para upload de fotos:

```typescript
// src/lib/integrations/storage.ts
export interface StorageService {
  upload(file: Buffer, filename: string, folder: string): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<boolean>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  listFiles(folder: string): Promise<{ key: string; size: number; lastModified: Date }[]>;
}

// Implementar com Cloudflare R2 ou S3-compatible
// Incluir: compressão automática, geração de thumbnails, watermark
```

API routes:
- `POST /api/upload/photo` — Upload de foto com resize automático
- `POST /api/upload/document` — Upload de PDF/documento
- `DELETE /api/upload/[key]` — Deletar arquivo

### PARTE D — Payment Gateway (Stripe)

Integração completa com Stripe:

```typescript
// src/lib/integrations/payment.ts
export interface PaymentService {
  createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string>;
  createPaymentIntent(amount: number, customerId: string, metadata?: Record<string, string>): Promise<{ clientSecret: string; id: string }>;
  createSubscription(customerId: string, priceId: string): Promise<{ subscriptionId: string; status: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  createPaymentLink(amount: number, description: string): Promise<string>;
  getPaymentStatus(paymentIntentId: string): Promise<string>;
}
```

API routes:
- `POST /api/payments/create-intent` — Criar payment intent
- `POST /api/payments/create-link` — Criar link de pagamento
- `POST /api/webhooks/stripe` — Webhook do Stripe (atualiza status das faturas)

### PARTE E — WhatsApp Business API

Integração para automações via WhatsApp:

```typescript
// src/lib/integrations/whatsapp.ts
export interface WhatsAppService {
  sendMessage(phone: string, message: string): Promise<{ messageId: string }>;
  sendTemplate(phone: string, templateName: string, variables: string[]): Promise<{ messageId: string }>;
  sendMedia(phone: string, mediaUrl: string, caption?: string): Promise<{ messageId: string }>;
}

// Templates disponíveis: shoot_reminder, gallery_ready, payment_reminder, birthday
```

API routes:
- `POST /api/whatsapp/send` — Enviar mensagem
- `POST /api/webhooks/whatsapp` — Receber mensagens (para inbox)

### PARTE F — PDF Generation

Geração de PDFs para contratos, propostas e faturas:

```typescript
// src/lib/integrations/pdf.ts
export interface PDFService {
  generateContract(contract: Contract): Promise<Buffer>;
  generateProposal(proposal: Proposal): Promise<Buffer>;
  generateInvoice(invoice: Invoice): Promise<Buffer>;
  generateReport(data: AnalyticsData, period: string): Promise<Buffer>;
}

// Templates bonitos no estilo NoirFrame
// Incluir: logo do estúdio, cores da marca, assinatura digital
```

API routes:
- `GET /api/contracts/[id]/pdf` — Baixar PDF do contrato
- `GET /api/proposals/[id]/pdf` — Baixar PDF da proposta
- `GET /api/invoices/[id]/pdf` — Baixar PDF da fatura
- `GET /api/analytics/report` — Gerar relatório em PDF

### PARTE G — Google Calendar Sync

Sincronização bidirecional com Google Calendar:

```typescript
// src/lib/integrations/calendar.ts
export interface CalendarService {
  connect(authCode: string): Promise<{ accessToken: string; refreshToken: string }>;
  createEvent(event: { title: string; start: Date; end: Date; location?: string; description?: string }): Promise<string>;
  updateEvent(eventId: string, updates: Partial<Event>): Promise<boolean>;
  deleteEvent(eventId: string): Promise<boolean>;
  listEvents(start: Date, end: Date): Promise<Event[]>;
  syncFromGoogle(): Promise<{ created: number; updated: number; deleted: number }>;
}
```

API routes:
- `GET /api/integrations/google/auth` — Iniciar OAuth
- `GET /api/integrations/google/callback` — Callback OAuth
- `POST /api/integrations/google/sync` — Sincronizar calendário
- `DELETE /api/integrations/google/disconnect` — Desconectar

### PARTE H — Webhooks Internos

Sistema de webhooks para o próprio NoirFrame:

```typescript
// src/lib/webhooks.ts
export async function triggerWebhook(
  event: WebhookEvent,
  studioId: string,
  payload: Record<string, any>
): Promise<void>;

export type WebhookEvent =
  | "client.created"
  | "shoot.created"
  | "shoot.status_changed"
  | "gallery.sent"
  | "gallery.selection_received"
  | "proposal.sent"
  | "proposal.accepted"
  | "proposal.declined"
  | "contract.signed"
  | "invoice.paid"
  | "invoice.overdue";
```

Tabela `webhooks` para configurar URLs personalizadas por estúdio.

API routes:
- `GET /api/settings/webhooks` — Listar webhooks configurados
- `POST /api/settings/webhooks` — Criar webhook
- `DELETE /api/settings/webhooks/[id]` — Deletar webhook
- `POST /api/settings/webhooks/[id]/test` — Testar webhook

### Ao finalizar:
1. Testar cada integração isoladamente
2. Documentar variáveis de ambiente necessárias em `.env.example`
3. Fazer `git add . && git commit -m "feat: external integrations (email, storage, payment, whatsapp, pdf, calendar)" && git push`

---

# 📌 PROMPT 3: SISTEMA DE AUTOMAÇÕES E JOBS EM BACKGROUND

## Contexto
Você é o CHAT 1 (BACKEND). O projeto já tem APIs e integrações. Agora é hora de implementar o sistema de automações que roda em background.

## Missão
Criar um sistema robusto de automações e jobs agendados que funcionam mesmo quando o usuário não está online.

### PARTE A — Sistema de Queue/Jobs

Implementar sistema de jobs em background usando a API do Next.js:

```typescript
// src/lib/jobs/index.ts
export interface Job {
  id: string;
  type: JobType;
  payload: Record<string, any>;
  scheduledFor: Date;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  processedAt?: Date;
}

export type JobType =
  | "send_email"
  | "send_whatsapp"
  | "send_sms"
  | "generate_pdf"
  | "sync_calendar"
  | "process_automation"
  | "cleanup_old_files"
  | "check_overdue_invoices"
  | "send_birthday_wishes"
  | "send_shoot_reminders"
  | "calculate_analytics"
  | "backup_data";
```

Tabela `jobs` no banco para persistir jobs.

### PARTE B — Job Processors

Criar processors para cada tipo de job:

```typescript
// src/lib/jobs/processors/
├── email.processor.ts
├── whatsapp.processor.ts
├── sms.processor.ts
├── pdf.processor.ts
├── calendar.processor.ts
├── automation.processor.ts
├── cleanup.processor.ts
├── invoices.processor.ts
├── birthday.processor.ts
├── reminders.processor.ts
├── analytics.processor.ts
└── backup.processor.ts
```

Cada processor deve:
- Ser idempotente (rodar múltiplas vezes sem efeitos colaterais)
- Ter tratamento de erros robusto
- Atualizar status do job no banco
- Logar execução para debugging

### PARTE C — Cron Jobs

Implementar API routes que são chamadas por serviços de cron externos (ou Vercel Cron):

```typescript
// Rotas de cron (protegidas por secret header)
GET /api/cron/process-jobs          — Processa jobs pendentes (a cada 1 min)
GET /api/cron/check-overdue         — Verifica faturas vencidas (diário 9h)
GET /api/cron/send-reminders        — Envia lembretes de ensaios (diário 8h)
GET /api/cron/birthday-wishes       — Envia parabéns (diário 7h)
GET /api/cron/expire-proposals      — Expira propostas vencidas (diário 0h)
GET /api/cron/cleanup               — Limpa arquivos antigos (semanal)
GET /api/cron/calculate-analytics   — Calcula métricas (diário 3h)
GET /api/cron/sync-calendars        — Sincroniza calendários (a cada 30 min)
```

### PARTE D — Motor de Automações

Sistema que processa as automações configuradas pelo usuário:

```typescript
// src/lib/automation-engine.ts
export class AutomationEngine {
  // Processa uma automação específica
  async process(automation: Automation, context: AutomationContext): Promise<void>;
  
  // Verifica todas as automações pendentes
  async checkPendingAutomations(): Promise<number>;
  
  // Agenda uma automação para execução
  async scheduleAutomation(automation: Automation, executeAt: Date): Promise<string>;
  
  // Cancela uma automação agendada
  async cancelScheduledAutomation(jobId: string): Promise<boolean>;
}

export interface AutomationContext {
  client?: Client;
  shoot?: Shoot;
  gallery?: Gallery;
  proposal?: Proposal;
  contract?: Contract;
  invoice?: Invoice;
}
```

Triggers suportados:
- `before_shoot(days)` — X dias antes do ensaio
- `after_shoot(days)` — X dias depois do ensaio
- `gallery_ready` — Quando galeria é enviada
- `payment_due(days)` — X dias antes do vencimento
- `payment_overdue(days)` — X dias depois do vencimento
- `birthday` — No aniversário do cliente
- `proposal_followup(days)` — X dias depois de enviar proposta sem resposta
- `contract_reminder(days)` — X dias depois de enviar contrato sem assinatura
- `review_request(days)` — X dias depois da entrega

Ações suportadas:
- `send_email(template, variables)`
- `send_whatsapp(template, variables)`
- `send_sms(message)`
- `create_task(title, priority)`
- `create_notification(message)`
- `update_client_status(status)`
- `webhook(url, payload)`

### PARTE E — Sistema de Notificações em Tempo Real

Implementar notificações push usando Server-Sent Events ou Web Push:

```typescript
// src/lib/notifications.ts
export class NotificationService {
  // Envia notificação para um usuário
  async send(userId: string, notification: {
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<void>;
  
  // Envia notificação para todos os usuários de um estúdio
  async broadcast(studioId: string, notification: Notification): Promise<void>;
  
  // Configurar Web Push
  async subscribeToWebPush(userId: string, subscription: PushSubscription): Promise<void>;
}
```

API routes:
- `GET /api/notifications/stream` — SSE endpoint para notificações em tempo real
- `POST /api/notifications/subscribe` — Registrar subscription de Web Push
- `POST /api/notifications/test` — Enviar notificação de teste

### PARTE F — Relatórios Automáticos

Sistema de relatórios automáticos por email:

```typescript
// Relatórios disponíveis
export type ReportType =
  | "weekly_summary"      // Resumo semanal (toda segunda 8h)
  | "monthly_revenue"     // Receita mensal (dia 1 de cada mês)
  | "quarterly_analytics" // Análise trimestral
  | "overdue_invoices"    // Faturas em atraso (semanal)
  | "upcoming_deadlines"  // Prazos próximos (diário);
```

Configurável por estúdio na página de settings.

### PARTE G — Logs e Monitoramento

Sistema de logs para debugging de automações:

```typescript
// Tabela automation_logs
export interface AutomationLog {
  id: string;
  automationId: string;
  jobId: string;
  status: "triggered" | "processing" | "completed" | "failed" | "skipped";
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration: number;
  createdAt: Date;
}
```

API routes:
- `GET /api/automations/[id]/logs` — Histórico de execuções
- `GET /api/admin/logs` — Todos os logs (admin)

### Ao finalizar:
1. Testar cada automação manualmente
2. Criar job de teste para cada processor
3. Fazer `git add . && git commit -m "feat: automation engine + background jobs + cron + notifications" && git push`

---

# 📌 PROMPT 4: SEGURANÇA, PERFORMANCE E OBSERVABILIDADE

## Contexto
Você é o CHAT 1 (BACKEND). O projeto está funcional. Agora é hora de torná-lo enterprise-ready com segurança robusta, performance otimizada e observabilidade completa.

## Missão
Implementar todas as práticas de segurança, otimizações de performance e ferramentas de monitoramento.

### PARTE A — Segurança Avançada

#### Rate Limiting por endpoint
```typescript
// src/middleware/rate-limit.ts
export const rateLimits = {
  "/api/auth/login": { window: 60, max: 5 },      // 5 tentativas/min
  "/api/auth/register": { window: 3600, max: 3 }, // 3 registros/hora
  "/api/upload/*": { window: 60, max: 10 },       // 10 uploads/min
  "/api/*": { window: 60, max: 100 },             // 100 requests/min geral
};
```

#### Proteção CSRF
```typescript
// Tokens CSRF para formulários
export function generateCSRFToken(): string;
export function validateCSRFToken(token: string): boolean;
```

#### Content Security Policy
```typescript
// next.config.ts headers
const securityHeaders = {
  "Content-Security-Policy": "...",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

#### Sanitização de Input
```typescript
// src/lib/sanitize.ts
export function sanitizeHTML(input: string): string;
export function sanitizeFilename(input: string): string;
export function sanitizeSQL(input: string): string; // extra safety
```

#### Audit Logs Detalhados
```typescript
// Logar TODAS as ações sensíveis
export async function auditLog(event: {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}): Promise<void>;

export type AuditAction =
  | "login"
  | "logout"
  | "password_change"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "share"
  | "sign"
  | "payment";
```

API routes:
- `GET /api/admin/audit-logs` — Listar logs (admin)
- `GET /api/settings/security/activity` — Atividade do usuário

#### Session Management
```typescript
// Controle de sessões ativas
export async function createSession(userId: string, metadata: SessionMetadata): Promise<string>;
export async function revokeSession(sessionId: string): Promise<void>;
export async function revokeAllSessions(userId: string): Promise<void>;
export async function getActiveSessions(userId: string): Promise<Session[]>;
```

API routes:
- `GET /api/settings/security/sessions` — Listar sessões ativas
- `DELETE /api/settings/security/sessions/[id]` — Revogar sessão
- `POST /api/settings/security/sessions/revoke-all` — Revogar todas

#### Two-Factor Authentication (2FA)
```typescript
// TOTP-based 2FA
export async function enable2FA(userId: string): Promise<{ secret: string; qrCode: string }>;
export async function verify2FA(userId: string, token: string): Promise<boolean>;
export async function disable2FA(userId: string, password: string): Promise<boolean>;
```

API routes:
- `POST /api/settings/security/2fa/enable` — Iniciar configuração
- `POST /api/settings/security/2fa/verify` — Verificar e ativar
- `POST /api/settings/security/2fa/disable` — Desativar
- `POST /api/auth/2fa/validate` — Validar token no login

### PARTE B — Performance

#### Database Optimization
```typescript
// Índices otimizados para queries frequentes
// - Index composto para listagens paginadas
// - Index parcial para soft deletes
// - Index de texto para busca

// Query optimization
export function withPagination<T>(query: SQL, page: number, pageSize: number): SQL;
export function withSearch<T>(query: SQL, searchTerm: string, columns: string[]): SQL;
export function withDateRange<T>(query: SQL, column: string, start?: Date, end?: Date): SQL;
```

#### Response Caching
```typescript
// Cache headers para respostas
export function withCache(response: NextResponse, maxAge: number, staleWhileRevalidate?: number): NextResponse;

// Cache em memória para dados frequentes
export const cache = new Map<string, { data: any; expiresAt: number }>();
export function getCached<T>(key: string): T | null;
export function setCached<T>(key: string, data: T, ttlSeconds: number): void;
```

#### Lazy Loading de Dados
```typescript
// Campos que não são carregados por padrão
export const DEFAULT_SELECT = {
  clients: ["id", "name", "email", "status", "createdAt"],
  shoots: ["id", "name", "date", "status", "value"],
  // ... expandir via ?include=details
};
```

#### Compression
```typescript
// Compressão de respostas JSON grandes
// Compressão de imagens no upload
// Geração de thumbnails on-demand
```

#### Connection Pooling
```typescript
// Pool de conexões otimizado para serverless
export const pool = new Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

### PARTE C — Observabilidade

#### Structured Logging
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, metadata?: Record<string, any>) => void;
  warn: (message: string, metadata?: Record<string, any>) => void;
  error: (message: string, error?: Error, metadata?: Record<string, any>) => void;
  debug: (message: string, metadata?: Record<string, any>) => void;
};

// Formato JSON estruturado para agregação
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info",
  "message": "Client created",
  "service": "noirframe",
  "environment": "production",
  "traceId": "abc123",
  "userId": "user_123",
  "studioId": "studio_456",
  "duration": 45,
  "metadata": { ... }
}
```

#### Request Tracing
```typescript
// Trace ID em todas as requisições
export function getTraceId(req: NextRequest): string;
export function withTracing(handler: Handler): Handler;
```

#### Metrics Collection
```typescript
// src/lib/metrics.ts
export const metrics = {
  // Contadores
  increment(name: string, tags?: Record<string, string>): void;
  
  // Histogramas (latência, tamanhos)
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  
  // Gauges (valores absolutos)
  gauge(name: string, value: number, tags?: Record<string, string>): void;
};

// Métricas importantes
- api_requests_total
- api_request_duration_ms
- api_errors_total
- db_query_duration_ms
- active_sessions
- jobs_processed_total
- email_sent_total
- storage_used_bytes
```

API routes:
- `GET /api/admin/metrics/prometheus` — Métricas em formato Prometheus
- `GET /api/admin/health/detailed` — Health check detalhado

#### Error Tracking
```typescript
// Captura e agrupamento de erros
export function captureException(error: Error, context?: Record<string, any>): void;
export function captureMessage(message: string, level: "info" | "warning" | "error"): void;

// Integração com Sentry (opcional)
```

#### Alerting Rules
```typescript
// Configuração de alertas
export const alerts = {
  highErrorRate: {
    condition: "error_rate > 5%",
    window: "5m",
    severity: "critical",
    notify: ["email", "slack"],
  },
  slowQueries: {
    condition: "db_query_duration_p99 > 1000ms",
    window: "10m",
    severity: "warning",
    notify: ["slack"],
  },
  // ...
};
```

### PARTE D — Backup e Disaster Recovery

```typescript
// Backup automático do banco
export async function createBackup(): Promise<{ filename: string; size: number }>;
export async function restoreBackup(filename: string): Promise<boolean>;
export async function listBackups(): Promise<Backup[]>;

// Exportação de dados do estúdio (LGPD/GDPR)
export async function exportStudioData(studioId: string): Promise<Buffer>;
export async function deleteStudioData(studioId: string): Promise<void>;
```

API routes:
- `GET /api/admin/backups` — Listar backups
- `POST /api/admin/backups` — Criar backup
- `POST /api/admin/backups/[id]/restore` — Restaurar backup
- `GET /api/settings/data/export` — Exportar dados do estúdio
- `DELETE /api/settings/data/delete` — Deletar conta e dados

### Ao finalizar:
1. Rodar testes de segurança
2. Verificar headers de segurança
3. Testar rate limiting
4. Fazer `git add . && git commit -m "feat: security hardening + performance optimization + observability" && git push`

---

# 📌 PROMPT 5: INTELIGÊNCIA ARTIFICIAL E FEATURES AVANÇADAS

## Contexto
Você é o CHAT 1 (BACKEND). O projeto está seguro e performático. Agora é hora de adicionar funcionalidades de IA e features avançadas que diferenciam o NoirFrame da concorrência.

## Missão
Implementar recursos de inteligência artificial e funcionalidades avançadas que tornam o NoirFrame um SaaS de classe mundial.

### PARTE A — Assistente IA Aprimorado

Expandir o NLP parser existente para ser mais inteligente:

```typescript
// src/lib/ai/assistant.ts
export class NoirAssistant {
  // Parser de linguagem natural aprimorado
  async parse(input: string, context: AssistantContext): Promise<ParsedIntent[]>;
  
  // Sugestões contextuais baseadas no histórico
  async getSuggestions(context: AssistantContext): Promise<Suggestion[]>;
  
  // Geração de texto (propostas, contratos, emails)
  async generateText(type: TextType, context: Record<string, any>): Promise<string>;
  
  // Análise de sentimento de mensagens
  async analyzeSentiment(message: string): Promise<"positive" | "neutral" | "negative">;
  
  // Resumo automático de conversas
  async summarizeConversation(messages: Message[]): Promise<string>;
}

export interface AssistantContext {
  userId: string;
  studioId: string;
  currentPage?: string;
  recentActions?: Action[];
  upcomingShoots?: Shoot[];
  pendingTasks?: Task[];
}

export type TextType =
  | "proposal"
  | "contract"
  | "email_followup"
  | "email_reminder"
  | "blog_post"
  | "social_caption"
  | "client_response";
```

API routes:
- `POST /api/assistant/parse` — Parse de comando (já existe, expandir)
- `POST /api/assistant/suggest` — Sugestões contextuais
- `POST /api/assistant/generate` — Geração de texto
- `POST /api/assistant/analyze` — Análise de sentimento/texto

Intents suportados (expandir para 30+):
```typescript
export type Intent =
  // Clientes
  | "create_client"
  | "find_client"
  | "update_client"
  | "list_clients"
  | "client_history"
  
  // Ensaios
  | "schedule_shoot"
  | "reschedule_shoot"
  | "cancel_shoot"
  | "shoot_details"
  | "upcoming_shoots"
  
  // Financeiro
  | "create_invoice"
  | "check_payments"
  | "revenue_summary"
  | "overdue_invoices"
  
  // Tarefas
  | "create_task"
  | "list_tasks"
  | "complete_task"
  | "reschedule_task"
  
  // Propostas/Contratos
  | "create_proposal"
  | "send_proposal"
  | "create_contract"
  | "send_contract"
  
  // Galerias
  | "create_gallery"
  | "send_gallery"
  | "check_selections"
  
  // Relatórios
  | "weekly_summary"
  | "monthly_report"
  | "performance_metrics"
  
  // Navegação
  | "go_to_page"
  | "search"
  | "help";
```

### PARTE B — Smart Pricing

Sistema de precificação inteligente:

```typescript
// src/lib/ai/pricing.ts
export class SmartPricing {
  // Sugere preço baseado em histórico e mercado
  async suggestPrice(shootType: string, context: PricingContext): Promise<{
    suggested: number;
    min: number;
    max: number;
    factors: PricingFactor[];
  }>;
  
  // Analisa competitividade dos preços
  async analyzeCompetitiveness(studioId: string): Promise<PricingAnalysis>;
  
  // Sugere pacotes baseado em perfil do cliente
  async suggestPackages(clientProfile: ClientProfile): Promise<Package[]>;
}

export interface PricingContext {
  shootType: string;
  duration?: number;
  location?: string;
  season?: string;
  clientHistory?: Invoice[];
  marketAverage?: number;
}
```

API routes:
- `POST /api/ai/pricing/suggest` — Sugerir preço
- `GET /api/ai/pricing/analysis` — Análise de precificação

### PARTE C — Predictive Analytics

Análises preditivas para o negócio:

```typescript
// src/lib/ai/predictions.ts
export class PredictiveAnalytics {
  // Previsão de receita para próximos meses
  async predictRevenue(months: number): Promise<{
    predictions: { month: string; predicted: number; confidence: number }[];
    factors: string[];
  }>;
  
  // Previsão de churn de clientes
  async predictChurn(clientId: string): Promise<{
    probability: number;
    riskLevel: "low" | "medium" | "high";
    reasons: string[];
    recommendations: string[];
  }>;
  
  // Melhor horário para contato
  async predictBestContactTime(clientId: string): Promise<{
    dayOfWeek: string;
    timeRange: string;
    confidence: number;
  }>;
  
  // Probabilidade de conversão
  async predictConversion(leadId: string): Promise<{
    probability: number;
    suggestedActions: string[];
  }>;
  
  // Demanda sazonal
  async predictDemand(period: string): Promise<{
    expectedShoots: number;
    peakDays: string[];
    recommendations: string[];
  }>;
}
```

API routes:
- `GET /api/ai/predictions/revenue` — Previsão de receita
- `GET /api/ai/predictions/churn/[clientId]` — Risco de churn
- `GET /api/ai/predictions/demand` — Previsão de demanda
- `GET /api/analytics/insights` — Insights automáticos

### PARTE D — Smart Automations

Automações inteligentes que aprendem com o comportamento:

```typescript
// src/lib/ai/smart-automations.ts
export class SmartAutomations {
  // Sugere automações baseado no comportamento
  async suggestAutomations(studioId: string): Promise<{
    suggestions: AutomationSuggestion[];
    potentialImpact: string;
  }>;
  
  // Otimiza horários de envio de emails
  async optimizeSendTime(clientId: string, emailType: string): Promise<Date>;
  
  // Personaliza mensagens automaticamente
  async personalizeMessage(template: string, clientId: string): Promise<string>;
  
  // Detecta anomalias (ex: cliente sumiu, pagamento atrasado incomum)
  async detectAnomalies(studioId: string): Promise<Anomaly[]>;
}
```

### PARTE E — Image Analysis (Fotos)

Análise de imagens com IA:

```typescript
// src/lib/ai/image-analysis.ts
export class ImageAnalysis {
  // Análise automática de fotos
  async analyze(imageUrl: string): Promise<{
    quality: number;
    composition: number;
    lighting: number;
    tags: string[];
    faces: number;
    suggestedCategory: string;
  }>;
  
  // Seleção automática das melhores fotos
  async selectBest(images: string[], count: number): Promise<string[]>;
  
  // Detecção de fotos similares/duplicadas
  async findDuplicates(galleryId: string): Promise<{ original: string; duplicate: string; similarity: number }[]>;
  
  // Geração automática de tags
  async autoTag(images: string[]): Promise<{ imageUrl: string; tags: string[] }[]>;
  
  // Sugestão de capa para galeria
  async suggestCover(galleryId: string): Promise<string>;
}
```

API routes:
- `POST /api/ai/images/analyze` — Analisar imagem
- `POST /api/ai/images/select-best` — Selecionar melhores
- `POST /api/ai/images/auto-tag` — Tags automáticas
- `GET /api/galleries/[id]/suggested-cover` — Sugerir capa

### PARTE F — Content Generation

Geração de conteúdo com IA:

```typescript
// src/lib/ai/content.ts
export class ContentGenerator {
  // Gera post de blog
  async generateBlogPost(topic: string, style: string): Promise<{
    title: string;
    excerpt: string;
    content: string;
    suggestedTags: string[];
    seoTitle: string;
    seoDescription: string;
  }>;
  
  // Gera caption para redes sociais
  async generateCaption(imageDescription: string, platform: "instagram" | "facebook" | "linkedin"): Promise<string>;
  
  // Gera descrição de serviço
  async generateServiceDescription(serviceType: string): Promise<string>;
  
  // Gera bio do fotógrafo
  async generateBio(info: { name: string; specialty: string[]; experience: number; style: string }): Promise<string>;
  
  // Gera resposta para cliente
  async generateClientResponse(message: string, context: string): Promise<string>;
}
```

API routes:
- `POST /api/ai/content/blog` — Gerar post de blog
- `POST /api/ai/content/caption` — Gerar caption social
- `POST /api/ai/content/response` — Gerar resposta para cliente

### PARTE G — Business Intelligence Dashboard API

APIs para dashboard de BI avançado:

```typescript
// src/lib/analytics/bi.ts
export class BusinessIntelligence {
  // KPIs principais
  async getKPIs(studioId: string, period: string): Promise<{
    revenue: { current: number; previous: number; change: number };
    clients: { total: number; new: number; churn: number };
    shoots: { completed: number; scheduled: number; cancelRate: number };
    conversion: { leads: number; converted: number; rate: number };
    satisfaction: { nps: number; reviews: number; avgRating: number };
  }>;
  
  // Cohort analysis
  async getCohortAnalysis(studioId: string): Promise<CohortData>;
  
  // Funil de conversão
  async getFunnel(studioId: string, period: string): Promise<FunnelStage[]>;
  
  // Revenue breakdown
  async getRevenueBreakdown(studioId: string, period: string): Promise<{
    byType: { type: string; revenue: number }[];
    byClient: { clientId: string; name: string; revenue: number }[];
    byMonth: { month: string; revenue: number }[];
    recurring: number;
    oneTime: number;
  }>;
  
  // Client lifetime value
  async getClientLTV(clientId: string): Promise<{
    currentLTV: number;
    predictedLTV: number;
    avgOrderValue: number;
    purchaseFrequency: number;
  }>;
}
```

API routes:
- `GET /api/analytics/kpis` — KPIs principais
- `GET /api/analytics/funnel` — Funil de conversão
- `GET /api/analytics/cohort` — Análise de cohort
- `GET /api/analytics/revenue-breakdown` — Breakdown de receita
- `GET /api/analytics/client-ltv/[id]` — LTV do cliente
- `GET /api/analytics/trends` — Tendências e insights

### PARTE H — Multi-tenancy Avançado

Suporte enterprise para múltiplos estúdios:

```typescript
// Permissões granulares por usuário
export type Permission =
  | "clients:read" | "clients:write" | "clients:delete"
  | "shoots:read" | "shoots:write" | "shoots:delete"
  | "finance:read" | "finance:write"
  | "gallery:read" | "gallery:write" | "gallery:delete"
  | "settings:read" | "settings:write"
  | "team:read" | "team:write" | "team:delete"
  | "reports:read" | "reports:export"
  | "admin:full";

// Roles customizáveis
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  isDefault: boolean;
}
```

API routes:
- `GET /api/settings/team` — Listar membros da equipe
- `POST /api/settings/team/invite` — Convidar membro
- `PATCH /api/settings/team/[id]/role` — Alterar role
- `DELETE /api/settings/team/[id]` — Remover membro
- `GET /api/settings/roles` — Listar roles
- `POST /api/settings/roles` — Criar role customizada

### Ao finalizar:
1. Testar todas as funcionalidades de IA
2. Documentar APIs de IA
3. Fazer `git add . && git commit -m "feat: AI features + predictive analytics + content generation + BI" && git push`

---

# 📋 ORDEM DE EXECUÇÃO

```
PROMPT 1 ──────────────> Base completa (APIs, hooks, constants, seed)
     ↓
PROMPT 2 ──────────────> Integrações externas (email, storage, payment)
     ↓
PROMPT 3 ──────────────> Automações e jobs (background processing)
     ↓
PROMPT 4 ──────────────> Segurança e performance (enterprise-ready)
     ↓
PROMPT 5 ──────────────> IA e features avançadas (diferencial competitivo)
```

Cada prompt deve ser executado completamente antes de passar para o próximo. Ao final dos 5 prompts, o backend do NoirFrame estará completo e pronto para produção.

---

# ⚠️ LEMBRETE IMPORTANTE

- Nunca edite arquivos de páginas (`src/app/app/`, `src/app/admin/`, `src/app/client/`, `src/components/`)
- Sempre faça `git pull` antes de começar um novo prompt
- Sempre faça `git push` ao terminar um prompt
- Teste todas as APIs com `build_and_start` antes de fazer push
- Documente variáveis de ambiente necessárias em `.env.example`
