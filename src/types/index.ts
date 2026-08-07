// Core Types for NoirFrame SaaS

export type UserRole = 'admin' | 'photographer' | 'client';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type ShootStatus = 'lead' | 'confirmed' | 'photographed' | 'editing' | 'delivered' | 'paid';
export type GalleryStatus = 'draft' | 'sent' | 'viewed' | 'selection_received' | 'delivered';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type TaskStatus = 'backlog' | 'today' | 'in_progress' | 'waiting_client' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type MessageType = 'inquiry' | 'gallery_comment' | 'approval' | 'general';
export type AutomationTrigger = 'before_shoot' | 'after_shoot' | 'gallery_ready' | 'payment_due' | 'birthday' | 'proposal_followup' | 'review_request';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Photographer extends User {
  role: 'photographer';
  studioName: string;
  specialty: string[];
  city: string;
  instagram?: string;
  website?: string;
  bio?: string;
  planId: string;
  storageUsed: number;
  storageLimit: number;
  clientCount: number;
  galleryCount: number;
  brandColor: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
}

export interface Client {
  id: string;
  photographerId: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  status: 'lead' | 'negotiation' | 'scheduled' | 'photographed' | 'editing' | 'delivered' | 'recurring';
  type: string;
  notes?: string;
  tags: string[];
  totalRevenue: number;
  shootCount: number;
  createdAt: string;
  lastContactAt?: string;
  birthday?: string;
  instagram?: string;
  referralSource?: string;
  avatar?: string;
}

export interface Shoot {
  id: string;
  photographerId: string;
  clientId: string;
  clientName: string;
  name: string;
  type: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  status: ShootStatus;
  value: number;
  package?: string;
  notes?: string;
  briefing?: string;
  shotList?: string[];
  references?: string[];
  checklist: { item: string; done: boolean }[];
  deliveryDeadline?: string;
  galleryId?: string;
  proposalId?: string;
  contractId?: string;
  createdAt: string;
}

export interface Gallery {
  id: string;
  photographerId: string;
  clientId: string;
  clientName: string;
  shootId?: string;
  name: string;
  slug: string;
  coverUrl: string;
  photos: GalleryPhoto[];
  status: GalleryStatus;
  password?: string;
  allowDownload: boolean;
  allowFavorites: boolean;
  maxSelections?: number;
  watermark: boolean;
  expiresAt?: string;
  message?: string;
  clientSelections: string[];
  viewCount: number;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  order: number;
  isFavorite: boolean;
  isSelected: boolean;
}

export interface Photo {
  id: string;
  photographerId: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  clientId?: string;
  clientName?: string;
  shootId?: string;
  galleryId?: string;
  tags: string[];
  isPortfolio: boolean;
  isCover: boolean;
  uploadedAt: string;
  size?: number;
  width?: number;
  height?: number;
  exif?: Record<string, string>;
}

export interface BlogPost {
  id: string;
  photographerId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  photographerId: string;
  clientId: string;
  clientName: string;
  shootId?: string;
  service: string;
  package: string;
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  validUntil: string;
  status: ProposalStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
}

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Contract {
  id: string;
  photographerId: string;
  clientId: string;
  clientName: string;
  shootId?: string;
  proposalId?: string;
  title: string;
  service: string;
  value: number;
  terms: string;
  clauses: string[];
  status: ContractStatus;
  signedAt?: string;
  signatureUrl?: string;
  createdAt: string;
  sentAt?: string;
}

export interface Invoice {
  id: string;
  photographerId: string;
  clientId: string;
  clientName: string;
  shootId?: string;
  contractId?: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Task {
  id: string;
  photographerId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  clientId?: string;
  shootId?: string;
  galleryId?: string;
  checklist?: { item: string; done: boolean }[];
  createdAt: string;
  completedAt?: string;
}

export interface Message {
  id: string;
  photographerId: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  type: MessageType;
  subject: string;
  content: string;
  isRead: boolean;
  galleryId?: string;
  replyTo?: string;
  replies: MessageReply[];
  createdAt: string;
}

export interface MessageReply {
  id: string;
  content: string;
  isFromPhotographer: boolean;
  createdAt: string;
}

export interface Automation {
  id: string;
  photographerId: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: Record<string, unknown>;
  channel: 'email' | 'whatsapp';
  subject?: string;
  message: string;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  storageGB: number;
  maxClients: number;
  maxGalleries: number;
  features: string[];
  hasPortfolio: boolean;
  hasBlog: boolean;
  hasAutomations: boolean;
  hasClientPortal: boolean;
  hasPriority: boolean;
  isPopular: boolean;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  content: string;
  isFromSupport: boolean;
  createdAt: string;
}

export interface PortfolioSettings {
  photographerId: string;
  headline: string;
  bio: string;
  services: PortfolioService[];
  testimonials: Testimonial[];
  sections: PortfolioSection[];
  layout: 'grid' | 'masonry' | 'slider';
  accentColor: string;
  showBlog: boolean;
  showContact: boolean;
  contactEmail?: string;
  socialLinks: Record<string, string>;
}

export interface PortfolioService {
  id: string;
  name: string;
  description: string;
  startingPrice?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface PortfolioSection {
  id: string;
  name: string;
  photoIds: string[];
  order: number;
}

export interface AppSettings {
  photographerId: string;
  timezone: string;
  currency: string;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  watermarkDefault: boolean;
  defaultGalleryExpiry: number;
  defaultSelectionLimit?: number;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'calendar' | 'messaging' | 'storage' | 'payment' | 'social' | 'automation';
  isConnected: boolean;
  connectedAt?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Dashboard Stats
export interface DashboardStats {
  monthlyRevenue: number;
  pendingPayments: number;
  upcomingShoots: number;
  newLeads: number;
  pendingGalleries: number;
  pendingTasks: number;
  conversionRate: number;
  avgDeliveryDays: number;
}

export interface AdminStats {
  totalPhotographers: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  newUsersThisMonth: number;
  totalGalleries: number;
  totalStorage: number;
  openTickets: number;
}
