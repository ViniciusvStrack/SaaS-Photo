// ============ STATUS DE ENSAIOS ============
export const SHOOT_STATUS = {
  lead: { label: "Lead", color: "bg-slate-500", textColor: "text-slate-500", icon: "UserPlus" },
  confirmed: { label: "Confirmado", color: "bg-blue-500", textColor: "text-blue-500", icon: "CheckCircle" },
  photographed: { label: "Fotografado", color: "bg-purple-500", textColor: "text-purple-500", icon: "Camera" },
  editing: { label: "Em Edição", color: "bg-amber-500", textColor: "text-amber-500", icon: "Edit" },
  delivered: { label: "Entregue", color: "bg-green-500", textColor: "text-green-500", icon: "Package" },
  paid: { label: "Pago", color: "bg-emerald-600", textColor: "text-emerald-600", icon: "DollarSign" },
  cancelled: { label: "Cancelado", color: "bg-red-500", textColor: "text-red-500", icon: "X" },
} as const;

export const SHOOT_STATUS_FLOW = ["lead", "confirmed", "photographed", "editing", "delivered", "paid"] as const;

// ============ STATUS DE GALERIAS ============
export const GALLERY_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviada", color: "bg-blue-500", textColor: "text-blue-500" },
  viewed: { label: "Visualizada", color: "bg-purple-500", textColor: "text-purple-500" },
  selection_received: { label: "Seleção Recebida", color: "bg-amber-500", textColor: "text-amber-500" },
  delivered: { label: "Entregue", color: "bg-green-500", textColor: "text-green-500" },
} as const;

export const GALLERY_STATUS_FLOW = ["draft", "sent", "viewed", "selection_received", "delivered"] as const;

// ============ STATUS DE PROPOSTAS ============
export const PROPOSAL_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviada", color: "bg-blue-500", textColor: "text-blue-500" },
  accepted: { label: "Aceita", color: "bg-green-500", textColor: "text-green-500" },
  declined: { label: "Recusada", color: "bg-red-500", textColor: "text-red-500" },
  expired: { label: "Expirada", color: "bg-slate-400", textColor: "text-slate-400" },
} as const;

// ============ STATUS DE CONTRATOS ============
export const CONTRACT_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  sent: { label: "Enviado", color: "bg-blue-500", textColor: "text-blue-500" },
  signed: { label: "Assinado", color: "bg-green-500", textColor: "text-green-500" },
  completed: { label: "Concluído", color: "bg-emerald-600", textColor: "text-emerald-600" },
  cancelled: { label: "Cancelado", color: "bg-red-500", textColor: "text-red-500" },
} as const;

// ============ STATUS DE PAGAMENTOS ============
export const PAYMENT_STATUS = {
  pending: { label: "Pendente", color: "bg-amber-500", textColor: "text-amber-500" },
  paid: { label: "Pago", color: "bg-green-500", textColor: "text-green-500" },
  overdue: { label: "Atrasado", color: "bg-red-500", textColor: "text-red-500" },
  cancelled: { label: "Cancelado", color: "bg-slate-500", textColor: "text-slate-500" },
  refunded: { label: "Reembolsado", color: "bg-purple-500", textColor: "text-purple-500" },
} as const;

// ============ STATUS DE TAREFAS ============
export const TASK_STATUS = {
  backlog: { label: "Backlog", color: "bg-slate-500", textColor: "text-slate-500" },
  today: { label: "Hoje", color: "bg-blue-500", textColor: "text-blue-500" },
  in_progress: { label: "Em Progresso", color: "bg-amber-500", textColor: "text-amber-500" },
  waiting_client: { label: "Aguardando Cliente", color: "bg-purple-500", textColor: "text-purple-500" },
  done: { label: "Concluído", color: "bg-green-500", textColor: "text-green-500" },
} as const;

export const TASK_STATUS_FLOW = ["backlog", "today", "in_progress", "waiting_client", "done"] as const;

// ============ STATUS DE CLIENTES ============
export const CLIENT_STATUS = {
  lead: { label: "Lead", color: "bg-slate-500", textColor: "text-slate-500" },
  negotiation: { label: "Negociação", color: "bg-blue-500", textColor: "text-blue-500" },
  scheduled: { label: "Agendado", color: "bg-purple-500", textColor: "text-purple-500" },
  photographed: { label: "Fotografado", color: "bg-amber-500", textColor: "text-amber-500" },
  editing: { label: "Em Edição", color: "bg-orange-500", textColor: "text-orange-500" },
  delivered: { label: "Entregue", color: "bg-green-500", textColor: "text-green-500" },
  recurring: { label: "Recorrente", color: "bg-emerald-600", textColor: "text-emerald-600" },
} as const;

// ============ STATUS DE BLOG ============
export const BLOG_STATUS = {
  draft: { label: "Rascunho", color: "bg-slate-500", textColor: "text-slate-500" },
  published: { label: "Publicado", color: "bg-green-500", textColor: "text-green-500" },
  scheduled: { label: "Agendado", color: "bg-blue-500", textColor: "text-blue-500" },
} as const;

// ============ STATUS DE MENSAGENS ============
export const MESSAGE_STATUS = {
  unread: { label: "Não Lida", color: "bg-blue-500", textColor: "text-blue-500" },
  read: { label: "Lida", color: "bg-slate-400", textColor: "text-slate-400" },
  replied: { label: "Respondida", color: "bg-green-500", textColor: "text-green-500" },
} as const;

// ============ PRIORIDADES ============
export const PRIORITY = {
  low: { label: "Baixa", color: "bg-slate-400", textColor: "text-slate-400", order: 1 },
  medium: { label: "Média", color: "bg-blue-500", textColor: "text-blue-500", order: 2 },
  high: { label: "Alta", color: "bg-amber-500", textColor: "text-amber-500", order: 3 },
  urgent: { label: "Urgente", color: "bg-red-500", textColor: "text-red-500", order: 4 },
} as const;

// ============ TIPOS DE ENSAIO ============
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

// ============ CATEGORIAS DE BLOG ============
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

// ============ TIPOS DE MENSAGEM ============
export const MESSAGE_TYPES = {
  inquiry: { label: "Consulta", icon: "HelpCircle" },
  gallery_comment: { label: "Comentário de Galeria", icon: "Image" },
  approval: { label: "Aprovação", icon: "CheckCircle" },
  general: { label: "Geral", icon: "MessageSquare" },
} as const;

// ============ PLANOS DO SAAS ============
export const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 79,
    priceYearly: 790,
    storage: 10,
    features: [
      "Até 5 clientes/mês",
      "1 galeria ativa",
      "Marca d'água básica",
      "Suporte por email",
    ],
    limits: {
      clientsPerMonth: 5,
      activeGalleries: 1,
      storageGb: 10,
      teamMembers: 1,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 149,
    priceYearly: 1490,
    storage: 50,
    features: [
      "Clientes ilimitados",
      "Galerias ilimitadas",
      "Contratos digitais",
      "Automações básicas",
      "Suporte prioritário",
    ],
    limits: {
      clientsPerMonth: -1,
      activeGalleries: -1,
      storageGb: 50,
      teamMembers: 1,
    },
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: 299,
    priceYearly: 2990,
    storage: 200,
    features: [
      "Tudo do Professional",
      "Multi-usuário (3)",
      "Assistente IA",
      "Integrações",
      "Suporte VIP",
    ],
    limits: {
      clientsPerMonth: -1,
      activeGalleries: -1,
      storageGb: 200,
      teamMembers: 3,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 599,
    priceYearly: 5990,
    storage: 1000,
    features: [
      "Tudo do Studio",
      "Usuários ilimitados",
      "API personalizada",
      "White-label",
      "Gerente de conta dedicado",
    ],
    limits: {
      clientsPerMonth: -1,
      activeGalleries: -1,
      storageGb: 1000,
      teamMembers: -1,
    },
  },
} as const;

// ============ AUTOMAÇÕES ============
export const AUTOMATION_TRIGGERS = {
  before_shoot: { label: "Antes do Ensaio", description: "Envia lembrete X dias antes", icon: "Calendar" },
  after_shoot: { label: "Após o Ensaio", description: "Envia agradecimento após ensaio", icon: "CheckCircle" },
  gallery_ready: { label: "Galeria Pronta", description: "Notifica quando galeria está pronta", icon: "Image" },
  payment_due: { label: "Pagamento Pendente", description: "Lembra sobre pagamento próximo do vencimento", icon: "Clock" },
  payment_overdue: { label: "Pagamento Atrasado", description: "Lembra sobre pagamento atrasado", icon: "AlertCircle" },
  birthday: { label: "Aniversário", description: "Envia felicitações no aniversário do cliente", icon: "Gift" },
  proposal_followup: { label: "Follow-up Proposta", description: "Lembra sobre proposta sem resposta", icon: "FileText" },
  contract_reminder: { label: "Lembrete Contrato", description: "Lembra sobre contrato não assinado", icon: "FileSignature" },
  review_request: { label: "Pedido de Avaliação", description: "Solicita avaliação após entrega", icon: "Star" },
} as const;

export const AUTOMATION_ACTIONS = {
  send_email: { label: "Enviar Email", icon: "Mail" },
  send_whatsapp: { label: "Enviar WhatsApp", icon: "MessageCircle" },
  send_sms: { label: "Enviar SMS", icon: "Smartphone" },
  create_task: { label: "Criar Tarefa", icon: "CheckSquare" },
  create_notification: { label: "Criar Notificação", icon: "Bell" },
  update_status: { label: "Atualizar Status", icon: "RefreshCw" },
  webhook: { label: "Chamar Webhook", icon: "Globe" },
} as const;

// ============ MENSAGENS DE ERRO ============
export const ERROR_MESSAGES = {
  network: "Erro de conexão. Verifique sua internet.",
  unauthorized: "Sessão expirada. Faça login novamente.",
  forbidden: "Você não tem permissão para esta ação.",
  not_found: "Recurso não encontrado.",
  validation: "Dados inválidos. Verifique os campos.",
  server: "Erro interno. Tente novamente mais tarde.",
  rate_limit: "Muitas requisições. Aguarde um momento.",
  upload_size: "Arquivo muito grande. Máximo permitido: 10MB.",
  upload_type: "Tipo de arquivo não suportado.",
} as const;

// ============ FORMATOS DE DATA ============
export const DATE_FORMATS = {
  short: "dd/MM/yyyy",
  long: "dd 'de' MMMM 'de' yyyy",
  withTime: "dd/MM/yyyy 'às' HH:mm",
  time: "HH:mm",
  month: "MMMM yyyy",
  weekday: "EEEE, dd/MM",
  iso: "yyyy-MM-dd",
  isoWithTime: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============ PAGINAÇÃO ============
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// ============ LIMITES ============
export const LIMITS = {
  maxUploadSizeMb: 10,
  maxBatchUpload: 50,
  maxTagsPerPhoto: 20,
  maxSelections: 100,
  sessionTimeoutMinutes: 60 * 24 * 7, // 7 days
  passwordMinLength: 8,
  nameMinLength: 2,
  nameMaxLength: 100,
  bioMaxLength: 500,
  notesMaxLength: 2000,
} as const;

// ============ CORES DA MARCA ============
export const BRAND_COLORS = [
  "#c9a96e", // Gold (default)
  "#8b7355", // Bronze
  "#6b5b4f", // Brown
  "#4a4a4a", // Charcoal
  "#2c3e50", // Navy
  "#1a1a2e", // Dark Blue
  "#16213e", // Midnight
  "#0f3460", // Royal Blue
  "#533483", // Purple
  "#e94560", // Rose
] as const;

// ============ ÍCONES DE NOTIFICAÇÃO ============
export const NOTIFICATION_TYPES = {
  info: { color: "bg-blue-500", icon: "Info" },
  success: { color: "bg-green-500", icon: "CheckCircle" },
  warning: { color: "bg-amber-500", icon: "AlertTriangle" },
  error: { color: "bg-red-500", icon: "XCircle" },
  payment: { color: "bg-emerald-500", icon: "DollarSign" },
  gallery: { color: "bg-purple-500", icon: "Image" },
  client: { color: "bg-blue-500", icon: "User" },
  shoot: { color: "bg-amber-500", icon: "Camera" },
  message: { color: "bg-indigo-500", icon: "MessageSquare" },
} as const;

// ============ HELPERS ============
export function getStatusInfo<T extends Record<string, { label: string; color: string }>>(
  statusMap: T,
  status: keyof T
): { label: string; color: string } {
  return statusMap[status] || { label: String(status), color: "bg-slate-500" };
}

export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value / 100);
}

export function formatDate(date: string | Date, format: keyof typeof DATE_FORMATS = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (format === "short") {
    return d.toLocaleDateString("pt-BR");
  }
  if (format === "withTime") {
    return d.toLocaleString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  if (format === "long") {
    return d.toLocaleDateString("pt-BR", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  }
  if (format === "time") {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  if (format === "month") {
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
  if (format === "weekday") {
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
  }
  
  return d.toISOString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
