import { z } from "zod";

// ============ COMMON SCHEMAS ============

export const idSchema = z.string().uuid("ID inválido");

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ============ AUTH SCHEMAS ============

export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  studioName: z.string().min(2, "Nome do estúdio deve ter pelo menos 2 caracteres").max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

// ============ CLIENT SCHEMAS ============

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  city: z.string().max(255).optional().or(z.literal("")),
  type: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["lead", "negotiation", "scheduled", "photographed", "editing", "delivered", "recurring"]).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  birthday: z.string().max(10).optional().or(z.literal("")),
  instagram: z.string().max(255).optional().or(z.literal("")),
  referralSource: z.string().max(255).optional().or(z.literal("")),
});

export const clientUpdateSchema = clientSchema.partial();

// ============ SHOOT SCHEMAS ============

export const shootSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  clientId: z.string().uuid().optional().or(z.literal("")),
  clientName: z.string().max(255).optional().or(z.literal("")),
  type: z.string().max(100).optional().or(z.literal("")),
  date: z.string().max(10).optional().or(z.literal("")),
  time: z.string().max(5).optional().or(z.literal("")),
  endTime: z.string().max(5).optional().or(z.literal("")),
  location: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["lead", "confirmed", "photographed", "editing", "delivered", "paid", "cancelled"]).optional(),
  value: z.coerce.number().min(0).optional().default(0),
  packageName: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  briefing: z.string().max(5000).optional().or(z.literal("")),
  deliveryDeadline: z.string().max(10).optional().or(z.literal("")),
});

export const shootUpdateSchema = shootSchema.partial();

export const shootChecklistItemSchema = z.object({
  item: z.string().min(1).max(255),
  done: z.boolean().default(false),
});

// ============ GALLERY SCHEMAS ============

export const gallerySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  clientId: z.string().uuid("Cliente é obrigatório"),
  clientName: z.string().max(255).optional(),
  shootId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "sent", "viewed", "selection_received", "delivered"]).optional().default("draft"),
  password: z.string().max(100).optional().or(z.literal("")),
  allowDownload: z.boolean().optional().default(true),
  allowFavorites: z.boolean().optional().default(true),
  maxSelections: z.coerce.number().min(0).optional(),
  expiresAt: z.string().optional().or(z.literal("")),
  welcomeMessage: z.string().max(2000).optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
});

export const galleryUpdateSchema = gallerySchema.partial();

// ============ PHOTO SCHEMAS ============

export const photoSchema = z.object({
  galleryId: z.string().uuid("Galeria é obrigatória"),
  url: z.string().url("URL inválida"),
  filename: z.string().max(255).optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  sizeMb: z.coerce.number().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPortfolio: z.boolean().optional().default(false),
  order: z.coerce.number().optional(),
});

export const photoUpdateSchema = z.object({
  tags: z.array(z.string()).optional(),
  isPortfolio: z.boolean().optional(),
  order: z.coerce.number().optional(),
});

export const photoBulkSchema = z.object({
  galleryId: z.string().uuid("Galeria é obrigatória"),
  photos: z.array(z.object({
    url: z.string().url("URL inválida"),
    filename: z.string().max(255).optional(),
  })).min(1, "Pelo menos uma foto é necessária").max(50, "Máximo de 50 fotos por vez"),
});

// ============ BLOG SCHEMAS ============

export const blogPostSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(255),
  slug: z.string().max(255).optional(),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(50, "Conteúdo deve ter pelo menos 50 caracteres"),
  coverUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(100).optional().or(z.literal("")),
  seoDescription: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled"]).optional().default("draft"),
  publishAt: z.string().optional().or(z.literal("")),
});

export const blogPostUpdateSchema = blogPostSchema.partial();

// ============ PROPOSAL SCHEMAS ============

export const proposalItemSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  unitPrice: z.coerce.number().min(0, "Preço não pode ser negativo"),
});

export const proposalSchema = z.object({
  clientId: z.string().uuid("Cliente é obrigatório"),
  clientName: z.string().max(255).optional(),
  shootId: z.string().uuid().optional().or(z.literal("")),
  service: z.string().min(1, "Serviço é obrigatório").max(255),
  package: z.string().max(255).optional().or(z.literal("")),
  validUntil: z.string().min(1, "Data de validade é obrigatória"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(proposalItemSchema).min(1, "Pelo menos um item é necessário"),
  discount: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["draft", "sent", "accepted", "declined", "expired"]).optional().default("draft"),
});

export const proposalUpdateSchema = proposalSchema.partial();

// ============ CONTRACT SCHEMAS ============

export const contractSchema = z.object({
  clientId: z.string().uuid("Cliente é obrigatório"),
  clientName: z.string().max(255).optional(),
  proposalId: z.string().uuid().optional().or(z.literal("")),
  shootId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, "Título é obrigatório").max(255),
  service: z.string().min(1, "Serviço é obrigatório").max(255),
  value: z.coerce.number().min(0, "Valor não pode ser negativo"),
  terms: z.string().min(50, "Termos devem ter pelo menos 50 caracteres"),
  clauses: z.array(z.string()).optional().default([]),
  status: z.enum(["draft", "sent", "signed", "completed", "cancelled"]).optional().default("draft"),
});

export const contractUpdateSchema = contractSchema.partial();

export const contractSignSchema = z.object({
  signatureHash: z.string().min(1, "Assinatura é obrigatória"),
  signedAt: z.string().optional(),
  ipAddress: z.string().optional(),
});

// ============ INVOICE SCHEMAS ============

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid("Cliente é obrigatório"),
  clientName: z.string().max(255).optional(),
  shootId: z.string().uuid().optional().or(z.literal("")),
  contractId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  amount: z.coerce.number().min(0, "Valor não pode ser negativo"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  items: z.array(invoiceItemSchema).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]).optional().default("pending"),
});

export const invoiceUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]).optional(),
  paidAt: z.string().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

// ============ TASK SCHEMAS ============

export const taskSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["backlog", "today", "in_progress", "waiting_client", "done"]).optional().default("backlog"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
  shootId: z.string().uuid().optional().or(z.literal("")),
  galleryId: z.string().uuid().optional().or(z.literal("")),
});

export const taskUpdateSchema = taskSchema.partial();

// ============ MESSAGE SCHEMAS ============

export const messageSchema = z.object({
  clientId: z.string().uuid().optional().or(z.literal("")),
  clientName: z.string().max(255).optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  subject: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  type: z.enum(["inquiry", "gallery_comment", "approval", "general"]).optional().default("general"),
  galleryId: z.string().uuid().optional().or(z.literal("")),
});

export const messageReplySchema = z.object({
  content: z.string().min(1, "Resposta é obrigatória"),
});

// ============ AUTOMATION SCHEMAS ============

export const automationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
  trigger: z.enum([
    "before_shoot",
    "after_shoot",
    "gallery_ready",
    "payment_due",
    "payment_overdue",
    "birthday",
    "proposal_followup",
    "contract_reminder",
    "review_request",
  ]),
  triggerConfig: z.record(z.string(), z.unknown()).optional().default({}),
  channel: z.enum(["email", "whatsapp", "sms"]).optional().default("email"),
  subject: z.string().max(500).optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const automationUpdateSchema = automationSchema.partial();

// ============ NOTIFICATION SCHEMAS ============

export const notificationSchema = z.object({
  type: z.enum(["info", "success", "warning", "error", "payment", "gallery", "client", "shoot", "message"]).optional().default("info"),
  title: z.string().min(1, "Título é obrigatório").max(255),
  message: z.string().max(1000).optional(),
  link: z.string().max(500).optional(),
});

// ============ SETTINGS SCHEMAS ============

export const studioSettingsSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().max(255).optional(),
  specialty: z.array(z.string()).optional(),
  city: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),
  brandColor: z.string().max(10).optional(),
});

export const userSettingsSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

// ============ ADMIN SCHEMAS ============

export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["admin", "photographer", "client"]).optional(),
});

export const adminStudioUpdateSchema = z.object({
  planId: z.string().optional(),
  storageLimitMb: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

// ============ CLIENT PORTAL SCHEMAS ============

export const gallerySelectionSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos uma foto"),
  notes: z.string().max(1000).optional(),
});

export const photoFavoriteSchema = z.object({
  photoId: z.string().uuid("Foto inválida"),
  isFavorite: z.boolean(),
});

// ============ TYPE EXPORTS ============

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ShootInput = z.infer<typeof shootSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type PhotoInput = z.infer<typeof photoSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AutomationInput = z.infer<typeof automationSchema>;
