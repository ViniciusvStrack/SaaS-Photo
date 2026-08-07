import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hashSync } from "bcryptjs";
import {
  users, studios, clients, shoots, shootChecklist, galleries, photos,
  blogPosts, proposals, proposalItems, contracts, invoices, tasks,
  messages, messageReplies, automations, notifications,
} from "./schema";

const PHOTO_URLS = [
  "https://images.pexels.com/photos/34206662/pexels-photo-34206662.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/16229516/pexels-photo-16229516.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13611240/pexels-photo-13611240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/10289219/pexels-photo-10289219.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/32552856/pexels-photo-32552856.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/34294462/pexels-photo-34294462.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/29002695/pexels-photo-29002695.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/32453331/pexels-photo-32453331.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/23911182/pexels-photo-23911182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/28863302/pexels-photo-28863302.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("🌱 Seeding NoirFrame database...");

  // WARNING: Dev-only credentials. Use strong passwords in production.
  const adminHash = hashSync("admin", 12);
  const studioHash = hashSync("studio", 12);
  const clientHash = hashSync("cliente", 12);

  // Create studio first
  const [studio] = await db.insert(studios).values({
    id: "studio-1",
    ownerId: "user-photographer",
    name: "Studio Lumière",
    slug: "studio-lumiere",
    specialty: ["casamento", "moda", "retrato"],
    city: "São Paulo, SP",
    email: "contato@studiolumiere.com.br",
    instagram: "@studiolumiere",
    bio: "Fotógrafa apaixonada por capturar momentos autênticos.",
    brandColor: "#c9a96e",
    storageLimitMb: 102400,
    storageUsedMb: 46200,
  }).returning();

  // Create users
  await db.insert(users).values([
    {
      id: "user-admin",
      email: "admin",
      passwordHash: adminHash,
      name: "Admin NoirFrame",
      role: "admin",
      avatar: "NF",
      isActive: true,
    },
    {
      id: "user-photographer",
      email: "studio",
      passwordHash: studioHash,
      name: "Ana Luísa Rodrigues",
      role: "photographer",
      avatar: "AL",
      phone: "(11) 99876-5432",
      studioId: studio.id,
      isActive: true,
    },
    {
      id: "user-client",
      email: "cliente",
      passwordHash: clientHash,
      name: "Marina Oliveira",
      role: "client",
      avatar: "MO",
      phone: "(11) 98765-4321",
      studioId: studio.id,
      isActive: true,
    },
  ]);

  // Clients
  const clientsData = [
    { id: "c1", studioId: studio.id, userId: "user-client", name: "Marina Oliveira", email: "marina@email.com", phone: "(11) 98765-4321", city: "São Paulo", status: "recurring", type: "Casamento", notes: "Cliente VIP, indica bastante", tags: ["vip"], totalRevenue: 28500, shootCount: 4 },
    { id: "c2", studioId: studio.id, name: "Rafael & Ana", email: "rafael.ana@email.com", phone: "(21) 91234-5678", city: "Rio de Janeiro", status: "scheduled", type: "Casamento", notes: "Casamento em junho na fazenda", tags: ["casamento2025"], totalRevenue: 12500, shootCount: 1 },
    { id: "c3", studioId: studio.id, name: "Studio Belle Mode", email: "contato@bellemode.com", phone: "(11) 95555-1234", city: "São Paulo", status: "editing", type: "Moda", tags: ["corporativo", "moda"], totalRevenue: 36000, shootCount: 3 },
    { id: "c4", studioId: studio.id, name: "Luciana Ferreira", email: "lu.ferreira@email.com", phone: "(31) 97777-8888", city: "Belo Horizonte", status: "delivered", type: "Newborn", tags: ["newborn"], totalRevenue: 1800, shootCount: 2 },
    { id: "c5", studioId: studio.id, name: "Tech Corp Brasil", email: "marketing@techcorp.com.br", phone: "(11) 93333-2222", city: "São Paulo", status: "negotiation", type: "Corporativo", tags: ["corporativo"], totalRevenue: 0, shootCount: 0 },
    { id: "c6", studioId: studio.id, name: "Juliana Santos", email: "ju.santos@email.com", phone: "(41) 96666-3333", city: "Curitiba", status: "lead", type: "Retrato", tags: ["15anos"], totalRevenue: 0, shootCount: 0 },
    { id: "c7", studioId: studio.id, name: "Marcos Andrade", email: "marcos.a@email.com", phone: "(11) 94444-7777", city: "São Paulo", status: "photographed", type: "Evento", tags: ["evento"], totalRevenue: 3500, shootCount: 1 },
    { id: "c8", studioId: studio.id, name: "Bianca & Pedro", email: "bianca.pedro@email.com", phone: "(21) 92222-6666", city: "Niterói", status: "scheduled", type: "Casamento", tags: ["casamento2025"], totalRevenue: 15000, shootCount: 1 },
  ];
  await db.insert(clients).values(clientsData);

  // Shoots
  const shootsData = [
    { id: "s1", studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", name: "Casamento Marina & João", type: "Casamento", date: "2025-06-15", time: "15:00", location: "Fazenda Santa Maria, Campinas", status: "confirmed" as const, value: 8500, packageName: "Premium" },
    { id: "s2", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", name: "Ensaio Pré-Wedding", type: "Pré-Wedding", date: "2025-05-28", time: "16:30", location: "Jardim Botânico, RJ", status: "confirmed" as const, value: 2800 },
    { id: "s3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", name: "Campanha Verão 2025", type: "Moda", date: "2025-05-20", time: "09:00", location: "Estúdio Central, SP", status: "editing" as const, value: 12000 },
    { id: "s4", studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", name: "Newborn Valentina", type: "Newborn", date: "2025-04-28", time: "10:00", location: "Residência da cliente, BH", status: "delivered" as const, value: 1800 },
    { id: "s5", studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", name: "Evento 50 Anos", type: "Evento", date: "2025-05-10", time: "19:00", location: "Buffet Estrela, SP", status: "photographed" as const, value: 3500 },
    { id: "s6", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", name: "Casamento na Praia", type: "Casamento", date: "2025-07-20", time: "16:00", location: "Praia de Camboinhas", status: "confirmed" as const, value: 15000 },
  ];
  await db.insert(shoots).values(shootsData);

  // Shoot checklists
  const checklistItems = [
    { shootId: "s1", item: "Contrato enviado", done: true, order: 0 },
    { shootId: "s1", item: "Pagamento confirmado", done: true, order: 1 },
    { shootId: "s1", item: "Briefing preenchido", done: true, order: 2 },
    { shootId: "s1", item: "Equipamento preparado", done: false, order: 3 },
    { shootId: "s1", item: "Backup configurado", done: false, order: 4 },
    { shootId: "s2", item: "Contrato enviado", done: true, order: 0 },
    { shootId: "s2", item: "Briefing preenchido", done: false, order: 1 },
  ];
  await db.insert(shootChecklist).values(checklistItems);

  // Galleries
  await db.insert(galleries).values([
    { id: "g1", studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", shootId: "s1", name: "Casamento Marina & João — Prévia", slug: "marina-joao-preview", coverUrl: PHOTO_URLS[0], status: "selection_received", password: "marina2024", allowFavorites: true, maxSelections: 30, watermark: true, message: "Marina, aqui está a prévia! Selecione suas favoritas 💛", viewCount: 24 },
    { id: "g2", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", name: "Pré-Wedding Rafael & Ana", slug: "rafael-ana-prewedding", coverUrl: PHOTO_URLS[2], status: "sent", password: "rafaelana", allowDownload: true, allowFavorites: true, message: "Olha que lindos! Escolham as melhores.", viewCount: 0 },
    { id: "g3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", shootId: "s3", name: "Campanha Verão", slug: "bellemode-verao25", coverUrl: PHOTO_URLS[8], status: "viewed", password: "bellemode25", allowFavorites: true, maxSelections: 50, watermark: true, viewCount: 5 },
    { id: "g4", studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", shootId: "s4", name: "Newborn Valentina", slug: "valentina-newborn", coverUrl: PHOTO_URLS[6], status: "delivered", allowDownload: true, message: "Aqui estão todas as fotos da Valentina! 🥰", viewCount: 12 },
  ]);

  // Photos
  const photoValues = PHOTO_URLS.flatMap((url, i) => [
    { studioId: studio.id, galleryId: i < 4 ? ["g1", "g2", "g3", "g4"][i] : null, url, filename: `IMG_${2000 + i}.jpg`, tags: ["editada"], isPortfolio: i < 6, order: i },
    { studioId: studio.id, url, filename: `IMG_${2100 + i}.jpg`, tags: ["selecionada"], isPortfolio: false, order: i + 20 },
  ]);
  await db.insert(photos).values(photoValues);

  // Blog posts
  await db.insert(blogPosts).values([
    { studioId: studio.id, title: "5 Dicas para um Casamento Inesquecível", slug: "dicas-casamento", excerpt: "Como preparar seus clientes para o grande dia.", content: "O casamento é um dos momentos mais especiais...", coverUrl: PHOTO_URLS[0], category: "Casamentos", tags: ["casamento", "dicas"], status: "published", viewCount: 342, publishedAt: new Date("2025-04-10") },
    { studioId: studio.id, title: "Making Of: Campanha Editorial", slug: "making-of-campanha", excerpt: "Bastidores de uma produção de moda.", content: "Neste post compartilho os bastidores...", coverUrl: PHOTO_URLS[8], category: "Bastidores", tags: ["moda", "bastidores"], status: "published", viewCount: 215, publishedAt: new Date("2025-03-22") },
    { studioId: studio.id, title: "Como Cobrar Pelo Seu Trabalho", slug: "guia-precificacao", excerpt: "Guia de precificação para fotógrafos.", content: "Precificar fotografia é uma das maiores dúvidas...", coverUrl: PHOTO_URLS[4], category: "Negócio", tags: ["negócio"], status: "published", viewCount: 567, publishedAt: new Date("2025-02-15") },
    { studioId: studio.id, title: "Tendências de Fotografia 2025", slug: "tendencias-2025", excerpt: "Principais tendências visuais.", content: "O mundo da fotografia está em constante evolução...", coverUrl: PHOTO_URLS[9], category: "Tendências", tags: ["tendências"], status: "draft", viewCount: 0 },
  ]);

  // Proposals
  await db.insert(proposals).values([
    { id: "pr1", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", service: "Casamento Completo", packageName: "Premium", subtotal: 11800, discount: 0, total: 11800, validUntil: "2025-06-30", status: "accepted" },
    { id: "pr2", studioId: studio.id, clientId: "c5", clientName: "Tech Corp Brasil", service: "Fotografia Corporativa", packageName: "Business", subtotal: 6800, discount: 0, total: 6800, validUntil: "2025-06-15", status: "sent" },
    { id: "pr3", studioId: studio.id, clientId: "c6", clientName: "Juliana Santos", service: "Ensaio 15 Anos", packageName: "Classic", subtotal: 2200, discount: 0, total: 2200, validUntil: "2025-06-20", status: "sent" },
    { id: "pr4", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", service: "Casamento na Praia", packageName: "Destination", subtotal: 15000, discount: 0, total: 15000, validUntil: "2025-07-01", status: "accepted" },
  ]);

  // Proposal items
  await db.insert(proposalItems).values([
    { proposalId: "pr1", description: "Cobertura completa (12h)", quantity: 1, unitPrice: 7000, total: 7000, order: 0 },
    { proposalId: "pr1", description: "Ensaio pré-wedding", quantity: 1, unitPrice: 2800, total: 2800, order: 1 },
    { proposalId: "pr1", description: "Álbum 30x30", quantity: 1, unitPrice: 2000, total: 2000, order: 2 },
    { proposalId: "pr2", description: "Retratos executivos", quantity: 10, unitPrice: 450, total: 4500, order: 0 },
    { proposalId: "pr2", description: "Fotos do escritório", quantity: 1, unitPrice: 2300, total: 2300, order: 1 },
  ]);

  // Contracts
  await db.insert(contracts).values([
    { id: "ct1", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", proposalId: "pr1", title: "Contrato de Casamento", service: "Casamento Completo Premium", value: 11800, clauses: ["Entrega em até 60 dias", "Backup por 1 ano"], status: "signed", signedAt: new Date("2025-03-10") },
    { id: "ct2", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", proposalId: "pr4", title: "Contrato Casamento Praia", service: "Casamento Destination", value: 15000, clauses: ["Inclui deslocamento"], status: "signed", signedAt: new Date("2025-04-20") },
    { id: "ct3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", title: "Contrato Campanha", service: "Campanha Moda Verão", value: 12000, clauses: ["Direitos comerciais 1 ano"], status: "completed", signedAt: new Date("2025-02-01") },
  ]);

  // Invoices
  await db.insert(invoices).values([
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", description: "Casamento — Parcela 3/3", total: 2833, status: "paid", dueDate: "2025-05-15", paidAt: new Date("2025-05-14") },
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", contractId: "ct1", description: "Casamento — Sinal", total: 3540, status: "paid", dueDate: "2025-03-15", paidAt: new Date("2025-03-15") },
    { studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", description: "Campanha — Parcela 2/2", total: 6000, status: "paid", dueDate: "2025-05-20", paidAt: new Date("2025-05-18") },
    { studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", description: "Newborn — Pagamento", total: 1800, status: "paid", dueDate: "2025-04-28", paidAt: new Date("2025-04-28") },
    { studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", description: "Evento — Sinal", total: 1750, status: "paid", dueDate: "2025-04-20", paidAt: new Date("2025-04-19") },
    { studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", description: "Evento — Parcela 2/2", total: 1750, status: "pending", dueDate: "2025-06-10" },
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", contractId: "ct2", description: "Casamento — Sinal", total: 4500, status: "paid", dueDate: "2025-05-01", paidAt: new Date("2025-04-30") },
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", description: "Casamento — Parcela 2/3", total: 5250, status: "pending", dueDate: "2025-06-15" },
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", description: "Casamento — Parcela 3/3", total: 4720, status: "pending", dueDate: "2025-06-30" },
    { studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", description: "Campanha — Parcela 1/2", total: 6000, status: "paid", dueDate: "2025-02-15", paidAt: new Date("2025-02-14") },
  ]);

  // Tasks
  await db.insert(tasks).values([
    { studioId: studio.id, title: "Finalizar edição Belle Mode", status: "in_progress", priority: "high", dueDate: "2025-05-25", clientId: "c3", shootId: "s3" },
    { studioId: studio.id, title: "Enviar prévia Marcos", status: "today", priority: "high", dueDate: "2025-05-18", clientId: "c7" },
    { studioId: studio.id, title: "Preparar equipamento pré-wedding", status: "today", priority: "medium", dueDate: "2025-05-27", shootId: "s2" },
    { studioId: studio.id, title: "Publicar post tendências", status: "backlog", priority: "low", dueDate: "2025-05-30" },
    { studioId: studio.id, title: "Enviar contrato Tech Corp", status: "waiting_client", priority: "medium", dueDate: "2025-05-20", clientId: "c5" },
    { studioId: studio.id, title: "Backup fotos casamento Marina", status: "done", priority: "high", completedAt: new Date("2025-05-15") },
    { studioId: studio.id, title: "Responder Juliana Santos", status: "done", priority: "medium", clientId: "c6", completedAt: new Date("2025-05-14") },
    { studioId: studio.id, title: "Agendar reunião Bianca", status: "today", priority: "low", clientId: "c8" },
  ]);

  // Messages
  const [msg1] = await db.insert(messages).values([
    { studioId: studio.id, clientId: "c6", clientName: "Juliana Santos", clientEmail: "ju.santos@email.com", type: "inquiry", subject: "Orçamento ensaio 15 anos", content: "Olá! Gostaria de saber valores para ensaio de 15 anos.", isRead: true },
    { studioId: studio.id, clientId: "c5", clientName: "Tech Corp Brasil", clientEmail: "marketing@techcorp.com.br", type: "inquiry", subject: "Proposta fotografia corporativa", content: "Boa tarde, gostaríamos de agendar uma reunião.", isRead: false },
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", clientEmail: "marina@email.com", type: "gallery_comment", subject: "Adorei a prévia!", content: "As fotos estão MARAVILHOSAS!", isRead: true },
    { studioId: studio.id, clientName: "Visitante Site", clientEmail: "contato@email.com", type: "inquiry", subject: "Orçamento casamento", content: "Vi o portfólio e gostei muito. Gostaria de orçamento.", isRead: false },
  ]).returning();

  await db.insert(messageReplies).values([
    { messageId: msg1.id, content: "Olá Juliana! Vou enviar uma proposta detalhada por email.", isFromPhotographer: true },
  ]);

  // Automations
  await db.insert(automations).values([
    { studioId: studio.id, name: "Lembrete pré-ensaio", trigger: "before_shoot", channel: "email", subject: "Seu ensaio está chegando!", message: "Olá {cliente}! Faltam 2 dias para o nosso ensaio.", isActive: true, triggerCount: 24 },
    { studioId: studio.id, name: "Agradecimento pós-ensaio", trigger: "after_shoot", channel: "whatsapp", message: "Oi {cliente}! Foi um prazer fotografar você!", isActive: true, triggerCount: 45 },
    { studioId: studio.id, name: "Aviso galeria pronta", trigger: "gallery_ready", channel: "email", subject: "Suas fotos estão prontas!", message: "Sua galeria está pronta para visualização.", isActive: true, triggerCount: 32 },
    { studioId: studio.id, name: "Lembrete pagamento", trigger: "payment_due", channel: "email", subject: "Lembrete de pagamento", message: "Lembrete de que o pagamento vence em breve.", isActive: true, triggerCount: 18 },
  ]);

  // Notifications
  await db.insert(notifications).values([
    { userId: "user-photographer", type: "success", title: "Pagamento confirmado", message: "Marina Oliveira confirmou pagamento de R$ 2.833", link: "/app/finance", isRead: false },
    { userId: "user-photographer", type: "info", title: "Nova mensagem", message: "Tech Corp respondeu sua proposta", link: "/app/inbox", isRead: false },
    { userId: "user-photographer", type: "warning", title: "Proposta expirando", message: "Proposta para Juliana vence em 5 dias", link: "/app/proposals", isRead: true },
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("📧 Login credentials (dev only):");
  console.log("   Admin:      admin / admin");
  console.log("   Fotógrafo:  studio / studio");
  console.log("   Cliente:    cliente / cliente");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
