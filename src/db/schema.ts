import { pgTable, text, timestamp, integer, boolean, real, jsonb, varchar, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "photographer", "client"]);
export const shootStatusEnum = pgEnum("shoot_status", ["lead", "confirmed", "photographed", "editing", "delivered", "paid", "cancelled"]);
export const galleryStatusEnum = pgEnum("gallery_status", ["draft", "sent", "viewed", "selection_received", "delivered"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "sent", "accepted", "declined", "expired"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "sent", "signed", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "overdue", "cancelled", "refunded"]);
export const taskStatusEnum = pgEnum("task_status", ["backlog", "today", "in_progress", "waiting_client", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);
export const blogStatusEnum = pgEnum("blog_status", ["draft", "published", "scheduled"]);

// ============ USERS ============
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("photographer"),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  studioId: text("studio_id"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("users_email_idx").on(t.email),
  index("users_role_idx").on(t.role),
  index("users_studio_idx").on(t.studioId),
]);

// ============ STUDIOS ============
export const studios = pgTable("studios", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  specialty: text("specialty").array(),
  city: varchar("city", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  bio: text("bio"),
  brandColor: varchar("brand_color", { length: 10 }).default("#c9a96e"),
  planId: text("plan_id"),
  storageUsedMb: integer("storage_used_mb").notNull().default(0),
  storageLimitMb: integer("storage_limit_mb").notNull().default(25600),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("studios_owner_idx").on(t.ownerId),
  index("studios_slug_idx").on(t.slug),
]);

// ============ CLIENTS ============
export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  userId: text("user_id"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("lead"),
  type: varchar("type", { length: 100 }),
  notes: text("notes"),
  tags: text("tags").array().default([]),
  totalRevenue: integer("total_revenue").notNull().default(0),
  shootCount: integer("shoot_count").notNull().default(0),
  birthday: varchar("birthday", { length: 10 }),
  instagram: varchar("instagram", { length: 255 }),
  referralSource: varchar("referral_source", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  index("clients_studio_idx").on(t.studioId),
  index("clients_status_idx").on(t.status),
  index("clients_user_idx").on(t.userId),
]);

// ============ SHOOTS ============
export const shoots = pgTable("shoots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  date: varchar("date", { length: 10 }),
  time: varchar("time", { length: 5 }),
  endTime: varchar("end_time", { length: 5 }),
  location: text("location"),
  status: shootStatusEnum("status").notNull().default("lead"),
  value: integer("value").notNull().default(0),
  packageName: varchar("package_name", { length: 255 }),
  notes: text("notes"),
  briefing: text("briefing"),
  shotList: text("shot_list").array(),
  deliveryDeadline: varchar("delivery_deadline", { length: 10 }),
  galleryId: text("gallery_id"),
  proposalId: text("proposal_id"),
  contractId: text("contract_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  index("shoots_studio_idx").on(t.studioId),
  index("shoots_client_idx").on(t.clientId),
  index("shoots_status_idx").on(t.status),
  index("shoots_date_idx").on(t.date),
]);

export const shootChecklist = pgTable("shoot_checklist", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  shootId: text("shoot_id").notNull(),
  item: text("item").notNull(),
  done: boolean("done").notNull().default(false),
  order: integer("order").notNull().default(0),
});

// ============ GALLERIES ============
export const galleries = pgTable("galleries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  shootId: text("shoot_id"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  coverUrl: text("cover_url"),
  status: galleryStatusEnum("status").notNull().default("draft"),
  password: varchar("password", { length: 255 }),
  allowDownload: boolean("allow_download").notNull().default(false),
  allowFavorites: boolean("allow_favorites").notNull().default(true),
  maxSelections: integer("max_selections"),
  watermark: boolean("watermark").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  message: text("message"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (t) => [
  index("galleries_studio_idx").on(t.studioId),
  index("galleries_client_idx").on(t.clientId),
  index("galleries_slug_idx").on(t.slug),
  index("galleries_status_idx").on(t.status),
]);

// ============ PHOTOS ============
export const photos = pgTable("photos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  galleryId: text("gallery_id"),
  clientId: text("client_id"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  filename: varchar("filename", { length: 500 }),
  mimeType: varchar("mime_type", { length: 50 }),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  tags: text("tags").array().default([]),
  isPortfolio: boolean("is_portfolio").notNull().default(false),
  isCover: boolean("is_cover").notNull().default(false),
  order: integer("order").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (t) => [
  index("photos_studio_idx").on(t.studioId),
  index("photos_gallery_idx").on(t.galleryId),
]);

export const photoFavorites = pgTable("photo_favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  photoId: text("photo_id").notNull(),
  galleryId: text("gallery_id").notNull(),
  clientId: text("client_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ BLOG ============
export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverUrl: text("cover_url"),
  category: varchar("category", { length: 100 }),
  tags: text("tags").array().default([]),
  status: blogStatusEnum("status").notNull().default("draft"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  viewCount: integer("view_count").notNull().default(0),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("blog_studio_idx").on(t.studioId),
  index("blog_slug_idx").on(t.slug),
  index("blog_status_idx").on(t.status),
]);

// ============ PROPOSALS ============
export const proposals = pgTable("proposals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  shootId: text("shoot_id"),
  service: varchar("service", { length: 255 }),
  packageName: varchar("package_name", { length: 255 }),
  subtotal: integer("subtotal").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull().default(0),
  validUntil: varchar("valid_until", { length: 10 }),
  status: proposalStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  terms: text("terms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("proposals_studio_idx").on(t.studioId),
  index("proposals_client_idx").on(t.clientId),
  index("proposals_status_idx").on(t.status),
]);

export const proposalItems = pgTable("proposal_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  proposalId: text("proposal_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
  total: integer("total").notNull().default(0),
  order: integer("order").notNull().default(0),
});

// ============ CONTRACTS ============
export const contracts = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  shootId: text("shoot_id"),
  proposalId: text("proposal_id"),
  title: varchar("title", { length: 255 }).notNull(),
  service: varchar("service", { length: 255 }),
  value: integer("value").notNull().default(0),
  terms: text("terms"),
  clauses: text("clauses").array().default([]),
  status: contractStatusEnum("status").notNull().default("draft"),
  signedAt: timestamp("signed_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("contracts_studio_idx").on(t.studioId),
  index("contracts_client_idx").on(t.clientId),
  index("contracts_status_idx").on(t.status),
]);

// ============ INVOICES ============
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  shootId: text("shoot_id"),
  contractId: text("contract_id"),
  description: text("description"),
  total: integer("total").notNull().default(0),
  status: paymentStatusEnum("status").notNull().default("pending"),
  dueDate: varchar("due_date", { length: 10 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("invoices_studio_idx").on(t.studioId),
  index("invoices_status_idx").on(t.status),
]);

// ============ TASKS ============
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("backlog"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueDate: varchar("due_date", { length: 10 }),
  clientId: text("client_id"),
  shootId: text("shoot_id"),
  galleryId: text("gallery_id"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("tasks_studio_idx").on(t.studioId),
  index("tasks_status_idx").on(t.status),
]);

// ============ MESSAGES ============
export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  clientId: text("client_id"),
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email", { length: 255 }),
  subject: varchar("subject", { length: 500 }),
  content: text("content"),
  type: varchar("type", { length: 50 }).default("general"),
  isRead: boolean("is_read").notNull().default(false),
  galleryId: text("gallery_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("messages_studio_idx").on(t.studioId),
  index("messages_read_idx").on(t.isRead),
]);

export const messageReplies = pgTable("message_replies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  messageId: text("message_id").notNull(),
  content: text("content").notNull(),
  isFromPhotographer: boolean("is_from_photographer").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ AUTOMATIONS ============
export const automations = pgTable("automations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studioId: text("studio_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 100 }).notNull(),
  triggerConfig: jsonb("trigger_config").default({}),
  channel: varchar("channel", { length: 50 }).notNull().default("email"),
  subject: varchar("subject", { length: 500 }),
  message: text("message"),
  isActive: boolean("is_active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  triggerCount: integer("trigger_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("automations_studio_idx").on(t.studioId),
]);

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("notifications_user_idx").on(t.userId),
  index("notifications_read_idx").on(t.isRead),
]);

// ============ AUDIT LOGS ============
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id"),
  studioId: text("studio_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("audit_studio_idx").on(t.studioId),
  index("audit_action_idx").on(t.action),
]);
