import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hashSync } from "bcryptjs";
import {
  users, studios, clients, shoots, shootChecklist, galleries, photos,
  blogPosts, proposals, proposalItems, contracts, invoices, tasks,
  messages, messageReplies, automations, notifications, auditLogs,
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

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

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
    phone: "(11) 99876-5432",
    instagram: "@studiolumiere",
    website: "https://studiolumiere.com.br",
    bio: "Fotógrafa apaixonada por capturar momentos autênticos e criar memórias que duram para sempre.",
    brandColor: "#c9a96e",
    planId: "studio",
    storageLimitMb: 204800,
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
      lastLoginAt: new Date(),
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

  // ============ CLIENTS (15) ============
  const clientsData = [
    { id: "c1", studioId: studio.id, userId: "user-client", name: "Marina Oliveira", email: "marina@email.com", phone: "(11) 98765-4321", city: "São Paulo", status: "recurring", type: "Casamento", notes: "Cliente VIP, indica bastante. Já fez 4 ensaios conosco.", tags: ["vip", "casamento"], totalRevenue: 28500, shootCount: 4, birthday: "1992-08-15", instagram: "@marina.oliveira", referralSource: "Instagram" },
    { id: "c2", studioId: studio.id, name: "Rafael & Ana", email: "rafael.ana@email.com", phone: "(21) 91234-5678", city: "Rio de Janeiro", status: "scheduled", type: "Casamento", notes: "Casamento em junho na fazenda", tags: ["casamento2025"], totalRevenue: 12500, shootCount: 1, referralSource: "Indicação" },
    { id: "c3", studioId: studio.id, name: "Studio Belle Mode", email: "contato@bellemode.com", phone: "(11) 95555-1234", city: "São Paulo", status: "editing", type: "Moda", tags: ["corporativo", "moda", "recorrente"], totalRevenue: 36000, shootCount: 3, referralSource: "Google" },
    { id: "c4", studioId: studio.id, name: "Luciana Ferreira", email: "lu.ferreira@email.com", phone: "(31) 97777-8888", city: "Belo Horizonte", status: "delivered", type: "Newborn", tags: ["newborn"], totalRevenue: 1800, shootCount: 2, birthday: "1988-03-22", instagram: "@lu.ferreira" },
    { id: "c5", studioId: studio.id, name: "Tech Corp Brasil", email: "marketing@techcorp.com.br", phone: "(11) 93333-2222", city: "São Paulo", status: "negotiation", type: "Corporativo", tags: ["corporativo", "enterprise"], totalRevenue: 0, shootCount: 0, referralSource: "LinkedIn" },
    { id: "c6", studioId: studio.id, name: "Juliana Santos", email: "ju.santos@email.com", phone: "(41) 96666-3333", city: "Curitiba", status: "lead", type: "15 Anos", tags: ["15anos"], totalRevenue: 0, shootCount: 0, birthday: "2009-11-05", referralSource: "Instagram" },
    { id: "c7", studioId: studio.id, name: "Marcos Andrade", email: "marcos.a@email.com", phone: "(11) 94444-7777", city: "São Paulo", status: "photographed", type: "Evento", tags: ["evento", "corporativo"], totalRevenue: 3500, shootCount: 1 },
    { id: "c8", studioId: studio.id, name: "Bianca & Pedro", email: "bianca.pedro@email.com", phone: "(21) 92222-6666", city: "Niterói", status: "scheduled", type: "Casamento", tags: ["casamento2025", "destination"], totalRevenue: 15000, shootCount: 1, referralSource: "Indicação" },
    { id: "c9", studioId: studio.id, name: "Fernanda Lima", email: "fernanda.lima@email.com", phone: "(11) 91111-9999", city: "São Paulo", status: "lead", type: "Gestante", tags: ["gestante"], totalRevenue: 0, shootCount: 0, birthday: "1995-06-12", referralSource: "Instagram" },
    { id: "c10", studioId: studio.id, name: "Grupo Meridian", email: "eventos@meridian.com.br", phone: "(11) 92222-1111", city: "São Paulo", status: "recurring", type: "Corporativo", tags: ["corporativo", "recorrente"], totalRevenue: 22000, shootCount: 5, referralSource: "Google" },
    { id: "c11", studioId: studio.id, name: "Camila Duarte", email: "camila.d@email.com", phone: "(19) 98888-5555", city: "Campinas", status: "delivered", type: "Família", tags: ["família"], totalRevenue: 2200, shootCount: 1, birthday: "1990-01-30" },
    { id: "c12", studioId: studio.id, name: "Diego & Mariana", email: "diego.mariana@email.com", phone: "(11) 97777-2222", city: "São Paulo", status: "lead", type: "Casamento", tags: ["casamento2026"], totalRevenue: 0, shootCount: 0, referralSource: "Site" },
    { id: "c13", studioId: studio.id, name: "Paula Mendes", email: "paula.m@email.com", phone: "(21) 93333-8888", city: "Rio de Janeiro", status: "negotiation", type: "Ensaio", tags: ["ensaio", "retrato"], totalRevenue: 0, shootCount: 0, referralSource: "Instagram" },
    { id: "c14", studioId: studio.id, name: "Restaurante Oliva", email: "chef@oliva.com.br", phone: "(11) 95555-7777", city: "São Paulo", status: "photographed", type: "Produto", tags: ["produto", "gastronomia"], totalRevenue: 4500, shootCount: 2 },
    { id: "c15", studioId: studio.id, name: "Amanda & Thiago", email: "amanda.thiago@email.com", phone: "(31) 94444-3333", city: "Belo Horizonte", status: "editing", type: "Casamento", tags: ["casamento2025"], totalRevenue: 9000, shootCount: 1, referralSource: "Indicação" },
  ];
  await db.insert(clients).values(clientsData);

  // ============ SHOOTS (12) ============
  const shootsData = [
    { id: "s1", studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", name: "Casamento Marina & João", type: "Casamento", date: daysFromNow(30), time: "15:00", endTime: "23:00", location: "Fazenda Santa Maria, Campinas", status: "confirmed" as const, value: 8500, packageName: "Premium", briefing: "Estilo rústico-chique. Cerimônia ao ar livre.", notes: "Levar lentes 85mm e 35mm" },
    { id: "s2", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", name: "Ensaio Pré-Wedding", type: "Ensaio", date: daysFromNow(14), time: "16:30", endTime: "18:30", location: "Jardim Botânico, RJ", status: "confirmed" as const, value: 2800, briefing: "Estilo natural, golden hour" },
    { id: "s3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", name: "Campanha Verão 2025", type: "Moda", date: daysFromNow(-10), time: "09:00", endTime: "17:00", location: "Estúdio Central, SP", status: "editing" as const, value: 12000, briefing: "10 looks, fundo branco e externas" },
    { id: "s4", studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", name: "Newborn Valentina", type: "Newborn", date: daysFromNow(-25), time: "10:00", endTime: "13:00", location: "Residência da cliente, BH", status: "delivered" as const, value: 1800 },
    { id: "s5", studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", name: "Evento 50 Anos", type: "Evento", date: daysFromNow(-15), time: "19:00", endTime: "23:00", location: "Buffet Estrela, SP", status: "photographed" as const, value: 3500 },
    { id: "s6", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", name: "Casamento na Praia", type: "Casamento", date: daysFromNow(45), time: "16:00", endTime: "23:00", location: "Praia de Camboinhas, Niterói", status: "confirmed" as const, value: 15000, packageName: "Destination Premium", briefing: "Cerimônia na areia, recepção no restaurante" },
    { id: "s7", studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", name: "Cobertura Evento Corporativo", type: "Corporativo", date: daysFromNow(-5), time: "08:00", endTime: "18:00", location: "Centro de Convenções, SP", status: "editing" as const, value: 5500 },
    { id: "s8", studioId: studio.id, clientId: "c11", clientName: "Camila Duarte", name: "Ensaio Família Duarte", type: "Família", date: daysFromNow(-30), time: "15:00", endTime: "17:00", location: "Parque do Ibirapuera, SP", status: "delivered" as const, value: 2200 },
    { id: "s9", studioId: studio.id, clientId: "c14", clientName: "Restaurante Oliva", name: "Fotos Cardápio", type: "Produto", date: daysFromNow(-8), time: "09:00", endTime: "14:00", location: "Restaurante Oliva, SP", status: "photographed" as const, value: 2500 },
    { id: "s10", studioId: studio.id, clientId: "c15", clientName: "Amanda & Thiago", name: "Casamento Amanda & Thiago", type: "Casamento", date: daysFromNow(-3), time: "14:00", endTime: "22:00", location: "Casa de Campo, BH", status: "editing" as const, value: 9000, packageName: "Classic" },
    { id: "s11", studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", name: "Ensaio Gestante Marina", type: "Gestante", date: daysFromNow(7), time: "16:00", endTime: "18:00", location: "Praia de Santos", status: "confirmed" as const, value: 1800 },
    { id: "s12", studioId: studio.id, clientId: "c14", clientName: "Restaurante Oliva", name: "Fotos Ambiente Novo", type: "Produto", date: daysFromNow(-40), time: "07:00", endTime: "11:00", location: "Restaurante Oliva, SP", status: "paid" as const, value: 2000 },
  ];
  await db.insert(shoots).values(shootsData);

  // Shoot checklists
  await db.insert(shootChecklist).values([
    { shootId: "s1", item: "Contrato enviado", done: true, order: 0 },
    { shootId: "s1", item: "Pagamento sinal confirmado", done: true, order: 1 },
    { shootId: "s1", item: "Briefing preenchido", done: true, order: 2 },
    { shootId: "s1", item: "Equipamento preparado", done: false, order: 3 },
    { shootId: "s1", item: "Backup configurado", done: false, order: 4 },
    { shootId: "s1", item: "Second shooter confirmado", done: true, order: 5 },
    { shootId: "s2", item: "Contrato enviado", done: true, order: 0 },
    { shootId: "s2", item: "Briefing preenchido", done: false, order: 1 },
    { shootId: "s6", item: "Contrato assinado", done: true, order: 0 },
    { shootId: "s6", item: "Passagem aérea", done: true, order: 1 },
    { shootId: "s6", item: "Hotel reservado", done: true, order: 2 },
    { shootId: "s6", item: "Visita técnica ao local", done: false, order: 3 },
  ]);

  // ============ GALLERIES (8) ============
  await db.insert(galleries).values([
    { id: "g1", studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", shootId: "s1", name: "Casamento Marina & João — Prévia", slug: "marina-joao-preview", coverUrl: PHOTO_URLS[0], status: "selection_received", password: "marina2024", allowFavorites: true, maxSelections: 30, watermark: true, message: "Marina, aqui está a prévia! Selecione suas favoritas 💛", viewCount: 24 },
    { id: "g2", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", name: "Pré-Wedding Rafael & Ana", slug: "rafael-ana-prewedding", coverUrl: PHOTO_URLS[2], status: "sent", password: "rafaelana", allowDownload: true, allowFavorites: true, message: "Olha que lindos! Escolham as melhores.", viewCount: 0 },
    { id: "g3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", shootId: "s3", name: "Campanha Verão", slug: "bellemode-verao25", coverUrl: PHOTO_URLS[8], status: "viewed", password: "bellemode25", allowFavorites: true, maxSelections: 50, watermark: true, viewCount: 5 },
    { id: "g4", studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", shootId: "s4", name: "Newborn Valentina", slug: "valentina-newborn", coverUrl: PHOTO_URLS[6], status: "delivered", allowDownload: true, message: "Aqui estão todas as fotos da Valentina! 🥰", viewCount: 12 },
    { id: "g5", studioId: studio.id, clientId: "c11", clientName: "Camila Duarte", shootId: "s8", name: "Família Duarte", slug: "familia-duarte", coverUrl: PHOTO_URLS[3], status: "delivered", allowDownload: true, viewCount: 8 },
    { id: "g6", studioId: studio.id, clientId: "c14", clientName: "Restaurante Oliva", shootId: "s12", name: "Ambiente Oliva", slug: "oliva-ambiente", coverUrl: PHOTO_URLS[5], status: "delivered", allowDownload: true, viewCount: 3 },
    { id: "g7", studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", shootId: "s5", name: "Evento 50 Anos Marcos", slug: "marcos-50-anos", coverUrl: PHOTO_URLS[1], status: "draft", viewCount: 0 },
    { id: "g8", studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", shootId: "s7", name: "Evento Meridian 2025", slug: "meridian-evento-2025", coverUrl: PHOTO_URLS[7], status: "draft", viewCount: 0 },
  ]);

  // ============ PHOTOS (50+) ============
  const allPhotos = [];
  for (let i = 0; i < PHOTO_URLS.length; i++) {
    // Photos in galleries
    const galleryIds = ["g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8"];
    for (let g = 0; g < galleryIds.length; g++) {
      allPhotos.push({
        studioId: studio.id,
        galleryId: galleryIds[g],
        url: PHOTO_URLS[(i + g) % PHOTO_URLS.length],
        filename: `IMG_${3000 + g * 10 + i}.jpg`,
        tags: ["editada"],
        isPortfolio: i < 3 && g < 4,
        order: i,
        width: 1920,
        height: 1280,
        sizeBytes: 3500000 + Math.floor(Math.random() * 2000000),
      });
    }
  }
  // Portfolio-only photos
  for (let i = 0; i < 6; i++) {
    allPhotos.push({
      studioId: studio.id,
      url: PHOTO_URLS[i],
      filename: `PORTFOLIO_${i}.jpg`,
      tags: ["portfolio", "destaque"],
      isPortfolio: true,
      order: i,
      width: 2400,
      height: 1600,
    });
  }
  await db.insert(photos).values(allPhotos);

  // ============ BLOG POSTS (8) ============
  await db.insert(blogPosts).values([
    { studioId: studio.id, title: "5 Dicas para um Casamento Inesquecível", slug: "dicas-casamento", excerpt: "Como preparar seus clientes para o grande dia e capturar cada emoção.", content: "O casamento é um dos momentos mais especiais na vida de um casal. Como fotógrafa, meu papel vai além de simplesmente registrar — eu preciso capturar emoções, olhares, sorrisos e todos aqueles momentos únicos que fazem o dia tão especial.\n\n## 1. Conheça o casal\nAntes do grande dia, marque uma reunião casual. Conheça a história deles, como se conheceram, o que os faz rir.\n\n## 2. Visite o local\nSempre faça uma visita técnica ao local da cerimônia e recepção. Identifique os melhores ângulos.\n\n## 3. Prepare uma timeline\nTrabalhe com o cerimonialista para ter uma timeline detalhada do dia.\n\n## 4. Tenha backup de tudo\nDois corpos de câmera, cartões extras, baterias carregadas.\n\n## 5. Capture os detalhes\nAlianças, buquê, sapatos, convites — os detalhes contam a história completa.", coverUrl: PHOTO_URLS[0], category: "Casamentos", tags: ["casamento", "dicas", "noivas"], status: "published", seoTitle: "5 Dicas Essenciais para Fotografar Casamentos", seoDescription: "Guia completo com dicas profissionais para fotografia de casamento.", viewCount: 342, publishedAt: daysAgo(45) },
    { studioId: studio.id, title: "Making Of: Campanha Editorial", slug: "making-of-campanha", excerpt: "Bastidores de uma produção de moda com a Studio Belle Mode.", content: "Neste post compartilho os bastidores da nossa última campanha editorial para a Studio Belle Mode...\n\nForam 10 looks, 8 horas de produção e uma equipe incrível. A direção de arte apostou em cores neutras com toques de dourado.", coverUrl: PHOTO_URLS[8], category: "Bastidores", tags: ["moda", "bastidores", "editorial"], status: "published", viewCount: 215, publishedAt: daysAgo(35) },
    { studioId: studio.id, title: "Como Cobrar Pelo Seu Trabalho", slug: "guia-precificacao", excerpt: "Guia completo de precificação para fotógrafos profissionais.", content: "Precificar fotografia é uma das maiores dúvidas de fotógrafos iniciantes. Neste guia completo, compartilho minha experiência de 8 anos no mercado.\n\n## Custos Fixos\nAluguel do estúdio, equipamento, software de edição, seguro.\n\n## Custos Variáveis\nDeslocamento, assistente, locação.\n\n## Margem de Lucro\nSempre calcule pelo menos 40% de margem sobre seus custos.\n\n## Valor Percebido\nSua marca, portfólio e experiência justificam preços mais altos.", coverUrl: PHOTO_URLS[4], category: "Negócios", tags: ["negócio", "precificação", "dicas"], status: "published", viewCount: 567, publishedAt: daysAgo(60) },
    { studioId: studio.id, title: "Tendências de Fotografia 2025", slug: "tendencias-2025", excerpt: "Principais tendências visuais e tecnológicas do ano.", content: "O mundo da fotografia está em constante evolução. Veja as principais tendências para 2025:\n\n1. **Film look digital** — Grãos e cores analógicas\n2. **Minimalismo** — Menos é mais\n3. **IA como assistente** — Edição e organização\n4. **Vídeo curto** — Reels e TikTok\n5. **Sustentabilidade** — Prints eco-friendly", coverUrl: PHOTO_URLS[9], category: "Dicas", tags: ["tendências", "2025"], status: "draft", viewCount: 0 },
    { studioId: studio.id, title: "Iluminação Natural: O Guia Definitivo", slug: "iluminacao-natural", excerpt: "Domine a luz natural para fotos incríveis em qualquer situação.", content: "A iluminação natural é a ferramenta mais poderosa de um fotógrafo. Neste guia, explico como aproveitá-la ao máximo em diferentes situações...\n\n## Golden Hour\nOs 30 minutos antes do pôr do sol criam a luz mais bonita.\n\n## Luz Difusa\nDias nublados são perfeitos para retratos sem sombras duras.\n\n## Contraluz\nCrie silhuetas e efeitos dramáticos com luz atrás do assunto.", coverUrl: PHOTO_URLS[3], category: "Dicas", tags: ["iluminação", "técnica", "dicas"], status: "published", viewCount: 189, publishedAt: daysAgo(20) },
    { studioId: studio.id, title: "Equipamentos Essenciais para Iniciantes", slug: "equipamentos-iniciantes", excerpt: "O que você realmente precisa para começar na fotografia profissional.", content: "Muitos fotógrafos iniciantes ficam perdidos com tantas opções de equipamento. Aqui está o essencial...", coverUrl: PHOTO_URLS[1], category: "Equipamentos", tags: ["equipamento", "iniciantes"], status: "published", viewCount: 423, publishedAt: daysAgo(75) },
    { studioId: studio.id, title: "Como Entregar Galerias que Encantam", slug: "galerias-que-encantam", excerpt: "Transforme a entrega de fotos em uma experiência memorável.", content: "A experiência de entrega das fotos é tão importante quanto a sessão em si. Veja como criar um momento especial...", coverUrl: PHOTO_URLS[6], category: "Dicas", tags: ["entrega", "experiência", "galeria"], status: "published", viewCount: 156, publishedAt: daysAgo(10) },
    { studioId: studio.id, title: "Fotografia de Produto: Dicas para Restaurantes", slug: "foto-produto-restaurantes", excerpt: "Como fotografar pratos que dão água na boca.", content: "A fotografia gastronômica é um nicho crescente e lucrativo. Compartilho minhas técnicas favoritas...", coverUrl: PHOTO_URLS[5], category: "Dicas", tags: ["produto", "gastronomia"], status: "scheduled", viewCount: 0, scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  ]);

  // ============ PROPOSALS (8) ============
  await db.insert(proposals).values([
    { id: "pr1", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", service: "Casamento Completo", packageName: "Premium", subtotal: 11800, discount: 0, total: 11800, validUntil: daysFromNow(30), status: "accepted", notes: "Inclui pré-wedding", createdAt: daysAgo(60) },
    { id: "pr2", studioId: studio.id, clientId: "c5", clientName: "Tech Corp Brasil", service: "Fotografia Corporativa", packageName: "Business", subtotal: 6800, discount: 500, total: 6300, validUntil: daysFromNow(15), status: "sent", createdAt: daysAgo(7) },
    { id: "pr3", studioId: studio.id, clientId: "c6", clientName: "Juliana Santos", service: "Ensaio 15 Anos", packageName: "Classic", subtotal: 2200, discount: 0, total: 2200, validUntil: daysFromNow(20), status: "sent", createdAt: daysAgo(5) },
    { id: "pr4", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", service: "Casamento na Praia", packageName: "Destination", subtotal: 15000, discount: 0, total: 15000, validUntil: daysFromNow(60), status: "accepted", createdAt: daysAgo(45) },
    { id: "pr5", studioId: studio.id, clientId: "c9", clientName: "Fernanda Lima", service: "Ensaio Gestante", packageName: "Essence", subtotal: 1500, discount: 0, total: 1500, validUntil: daysFromNow(10), status: "sent", createdAt: daysAgo(3) },
    { id: "pr6", studioId: studio.id, clientId: "c12", clientName: "Diego & Mariana", service: "Casamento 2026", packageName: "Premium", subtotal: 12000, discount: 1000, total: 11000, validUntil: daysFromNow(30), status: "draft", createdAt: daysAgo(1) },
    { id: "pr7", studioId: studio.id, clientId: "c13", clientName: "Paula Mendes", service: "Ensaio Retrato", packageName: "Portrait", subtotal: 800, discount: 0, total: 800, validUntil: daysFromNow(-5), status: "expired", createdAt: daysAgo(30) },
    { id: "pr8", studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", service: "Pacote Anual Corporativo", packageName: "Enterprise", subtotal: 24000, discount: 2000, total: 22000, validUntil: daysFromNow(45), status: "accepted", notes: "5 eventos + retratos executivos", createdAt: daysAgo(90) },
  ]);

  // Proposal items
  await db.insert(proposalItems).values([
    { proposalId: "pr1", description: "Cobertura completa (12h)", quantity: 1, unitPrice: 7000, total: 7000, order: 0 },
    { proposalId: "pr1", description: "Ensaio pré-wedding", quantity: 1, unitPrice: 2800, total: 2800, order: 1 },
    { proposalId: "pr1", description: "Álbum 30x30", quantity: 1, unitPrice: 2000, total: 2000, order: 2 },
    { proposalId: "pr2", description: "Retratos executivos", quantity: 10, unitPrice: 450, total: 4500, order: 0 },
    { proposalId: "pr2", description: "Fotos do escritório", quantity: 1, unitPrice: 2300, total: 2300, order: 1 },
    { proposalId: "pr3", description: "Ensaio completo (2h)", quantity: 1, unitPrice: 1500, total: 1500, order: 0 },
    { proposalId: "pr3", description: "Tratamento de 30 fotos", quantity: 1, unitPrice: 700, total: 700, order: 1 },
    { proposalId: "pr4", description: "Casamento destination (14h)", quantity: 1, unitPrice: 12000, total: 12000, order: 0 },
    { proposalId: "pr4", description: "Deslocamento e hospedagem", quantity: 1, unitPrice: 3000, total: 3000, order: 1 },
    { proposalId: "pr5", description: "Ensaio gestante (1.5h)", quantity: 1, unitPrice: 1200, total: 1200, order: 0 },
    { proposalId: "pr5", description: "Tratamento de 20 fotos", quantity: 1, unitPrice: 300, total: 300, order: 1 },
  ]);

  // ============ CONTRACTS (6) ============
  await db.insert(contracts).values([
    { id: "ct1", studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", proposalId: "pr1", title: "Contrato de Casamento", service: "Casamento Completo Premium", value: 11800, terms: "O fotógrafo se compromete a realizar a cobertura completa do casamento conforme especificado na proposta aceita.", clauses: ["Entrega em até 60 dias", "Backup por 1 ano", "Inclui ensaio pré-wedding"], status: "signed", signedAt: daysAgo(50), sentAt: daysAgo(55) },
    { id: "ct2", studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", proposalId: "pr4", title: "Contrato Casamento Praia", service: "Casamento Destination", value: 15000, terms: "Contrato para cobertura de casamento destination incluindo deslocamento.", clauses: ["Inclui deslocamento", "Entrega em até 90 dias", "Second shooter incluso"], status: "signed", signedAt: daysAgo(40), sentAt: daysAgo(43) },
    { id: "ct3", studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", title: "Contrato Campanha", service: "Campanha Moda Verão", value: 12000, terms: "Contrato para produção fotográfica de campanha editorial.", clauses: ["Direitos comerciais por 1 ano", "Entrega em 15 dias úteis"], status: "completed", signedAt: daysAgo(80), sentAt: daysAgo(85) },
    { id: "ct4", studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", proposalId: "pr8", title: "Contrato Anual Corporativo", service: "Pacote Anual Corporativo", value: 22000, terms: "Contrato anual para cobertura de 5 eventos e sessão de retratos.", clauses: ["Vigência 12 meses", "Pagamento em 4x", "Agendamento com 15 dias de antecedência"], status: "signed", signedAt: daysAgo(85), sentAt: daysAgo(88) },
    { id: "ct5", studioId: studio.id, clientId: "c15", clientName: "Amanda & Thiago", title: "Contrato Casamento", service: "Casamento Classic", value: 9000, terms: "Contrato para cobertura fotográfica de casamento.", clauses: ["Entrega em 45 dias", "300+ fotos editadas"], status: "signed", signedAt: daysAgo(20), sentAt: daysAgo(25) },
    { id: "ct6", studioId: studio.id, clientId: "c5", clientName: "Tech Corp Brasil", title: "Contrato Fotografia Corporativa", service: "Fotografia Corporativa", value: 6300, terms: "Proposta de serviço fotográfico corporativo.", clauses: ["Entrega em 10 dias úteis"], status: "sent", sentAt: daysAgo(5) },
  ]);

  // ============ INVOICES (25) - Distributed over 6 months ============
  await db.insert(invoices).values([
    // 6 months ago
    { studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", description: "Campanha — Parcela 1/2", total: 6000, status: "paid", dueDate: daysFromNow(-165), paidAt: daysAgo(166), createdAt: monthsAgo(6) },
    { studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", description: "Evento Janeiro — Cobertura", total: 4400, status: "paid", dueDate: daysFromNow(-150), paidAt: daysAgo(151), createdAt: monthsAgo(6) },
    // 5 months ago
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", description: "Ensaio Retrato", total: 1200, status: "paid", dueDate: daysFromNow(-135), paidAt: daysAgo(134), createdAt: monthsAgo(5) },
    { studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", description: "Campanha — Parcela 2/2", total: 6000, status: "paid", dueDate: daysFromNow(-120), paidAt: daysAgo(119), createdAt: monthsAgo(5) },
    // 4 months ago
    { studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", description: "Retratos Executivos Março", total: 4500, status: "paid", dueDate: daysFromNow(-105), paidAt: daysAgo(104), createdAt: monthsAgo(4) },
    { studioId: studio.id, clientId: "c14", clientName: "Restaurante Oliva", description: "Fotos Ambiente", total: 2000, status: "paid", dueDate: daysFromNow(-100), paidAt: daysAgo(100), createdAt: monthsAgo(4) },
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", contractId: "ct1", description: "Casamento — Sinal", total: 3540, status: "paid", dueDate: daysFromNow(-90), paidAt: daysAgo(90), createdAt: monthsAgo(4) },
    // 3 months ago
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", contractId: "ct2", description: "Casamento — Sinal", total: 4500, status: "paid", dueDate: daysFromNow(-75), paidAt: daysAgo(76), createdAt: monthsAgo(3) },
    { studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", description: "Evento Abril", total: 4400, status: "paid", dueDate: daysFromNow(-70), paidAt: daysAgo(69), createdAt: monthsAgo(3) },
    // 2 months ago
    { studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", description: "Newborn — Pagamento Total", total: 1800, status: "paid", dueDate: daysFromNow(-50), paidAt: daysAgo(50), createdAt: monthsAgo(2) },
    { studioId: studio.id, clientId: "c11", clientName: "Camila Duarte", description: "Ensaio Família", total: 2200, status: "paid", dueDate: daysFromNow(-45), paidAt: daysAgo(44), createdAt: monthsAgo(2) },
    { studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", description: "Evento — Sinal", total: 1750, status: "paid", dueDate: daysFromNow(-40), paidAt: daysAgo(39), createdAt: monthsAgo(2) },
    // 1 month ago
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", description: "Casamento — Parcela 3/3", total: 2833, status: "paid", dueDate: daysFromNow(-25), paidAt: daysAgo(26), createdAt: monthsAgo(1) },
    { studioId: studio.id, clientId: "c15", clientName: "Amanda & Thiago", description: "Casamento — Sinal", total: 3000, status: "paid", dueDate: daysFromNow(-20), paidAt: daysAgo(19), createdAt: monthsAgo(1) },
    { studioId: studio.id, clientId: "c14", clientName: "Restaurante Oliva", description: "Fotos Cardápio", total: 2500, status: "paid", dueDate: daysFromNow(-15), paidAt: daysAgo(14), createdAt: monthsAgo(1) },
    // Current month - pending and overdue
    { studioId: studio.id, clientId: "c7", clientName: "Marcos Andrade", description: "Evento — Parcela 2/2", total: 1750, status: "pending", dueDate: daysFromNow(10), createdAt: daysAgo(15) },
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", description: "Casamento — Parcela 2/3", total: 5250, status: "pending", dueDate: daysFromNow(15), createdAt: daysAgo(10) },
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", description: "Casamento — Parcela 2/3", total: 3930, status: "pending", dueDate: daysFromNow(25), createdAt: daysAgo(5) },
    { studioId: studio.id, clientId: "c15", clientName: "Amanda & Thiago", description: "Casamento — Parcela 2/3", total: 3000, status: "pending", dueDate: daysFromNow(20), createdAt: daysAgo(3) },
    { studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", description: "Evento Corporativo Junho", total: 5500, status: "pending", dueDate: daysFromNow(5), createdAt: daysAgo(8) },
    // Overdue
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", description: "Casamento — Parcela 3/3", total: 4330, status: "overdue", dueDate: daysFromNow(-3), createdAt: daysAgo(30) },
    // Future
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", description: "Casamento — Parcela 3/3", total: 5250, status: "pending", dueDate: daysFromNow(45), createdAt: daysAgo(1) },
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", description: "Ensaio Gestante", total: 1800, status: "pending", dueDate: daysFromNow(7), createdAt: daysAgo(2) },
  ]);

  // ============ TASKS (20) ============
  await db.insert(tasks).values([
    { studioId: studio.id, title: "Finalizar edição Belle Mode", status: "in_progress", priority: "high", dueDate: daysFromNow(3), clientId: "c3", shootId: "s3", description: "Tratar as últimas 30 fotos da campanha" },
    { studioId: studio.id, title: "Enviar prévia Marcos", status: "today", priority: "high", dueDate: daysFromNow(0), clientId: "c7" },
    { studioId: studio.id, title: "Preparar equipamento pré-wedding", status: "today", priority: "medium", dueDate: daysFromNow(0), shootId: "s2", description: "Verificar lentes, baterias e cartões" },
    { studioId: studio.id, title: "Publicar post tendências", status: "backlog", priority: "low", dueDate: daysFromNow(10), description: "Revisar e publicar rascunho sobre tendências 2025" },
    { studioId: studio.id, title: "Enviar contrato Tech Corp", status: "waiting_client", priority: "medium", dueDate: daysFromNow(5), clientId: "c5" },
    { studioId: studio.id, title: "Backup fotos casamento Marina", status: "done", priority: "high", completedAt: daysAgo(5) },
    { studioId: studio.id, title: "Responder Juliana Santos", status: "done", priority: "medium", clientId: "c6", completedAt: daysAgo(3) },
    { studioId: studio.id, title: "Agendar reunião Bianca", status: "today", priority: "low", clientId: "c8", description: "Definir detalhes do casamento" },
    { studioId: studio.id, title: "Editar fotos Restaurante Oliva", status: "in_progress", priority: "medium", clientId: "c14", shootId: "s9", description: "40 fotos do cardápio novo" },
    { studioId: studio.id, title: "Montar proposta Diego & Mariana", status: "today", priority: "high", clientId: "c12", description: "Casamento 2026, orçamento detalhado" },
    { studioId: studio.id, title: "Visitar local casamento Bianca", status: "backlog", priority: "medium", clientId: "c8", shootId: "s6", dueDate: daysFromNow(20) },
    { studioId: studio.id, title: "Postar stories bastidores", status: "backlog", priority: "low", description: "Postar bastidores da campanha Belle Mode" },
    { studioId: studio.id, title: "Renovar seguro equipamento", status: "backlog", priority: "medium", dueDate: daysFromNow(30) },
    { studioId: studio.id, title: "Atualizar portfólio site", status: "backlog", priority: "low", description: "Adicionar fotos recentes ao portfólio online" },
    { studioId: studio.id, title: "Cobrar parcela Rafael & Ana", status: "today", priority: "urgent", clientId: "c2", description: "Parcela 3/3 está em atraso" },
    { studioId: studio.id, title: "Editar casamento Amanda", status: "in_progress", priority: "high", clientId: "c15", shootId: "s10", dueDate: daysFromNow(7) },
    { studioId: studio.id, title: "Enviar galeria Meridian", status: "waiting_client", priority: "medium", clientId: "c10", shootId: "s7", description: "Aguardando aprovação do gerente de marketing" },
    { studioId: studio.id, title: "Comprar fundo novo estúdio", status: "done", priority: "low", completedAt: daysAgo(10) },
    { studioId: studio.id, title: "Preparar álbum Marina", status: "waiting_client", priority: "medium", clientId: "c1", description: "Aguardando seleção final das fotos" },
    { studioId: studio.id, title: "Responder Paula Mendes", status: "done", priority: "medium", clientId: "c13", completedAt: daysAgo(1) },
  ]);

  // ============ MESSAGES (12) ============
  const [msg1] = await db.insert(messages).values([
    { studioId: studio.id, clientId: "c6", clientName: "Juliana Santos", clientEmail: "ju.santos@email.com", type: "inquiry", subject: "Orçamento ensaio 15 anos", content: "Olá! Gostaria de saber valores para ensaio de 15 anos. Vi seu trabalho no Instagram e amei! Pode me enviar informações?", isRead: true },
    { studioId: studio.id, clientId: "c5", clientName: "Tech Corp Brasil", clientEmail: "marketing@techcorp.com.br", type: "inquiry", subject: "Proposta fotografia corporativa", content: "Boa tarde, gostaríamos de agendar uma reunião para discutir uma proposta de fotografia corporativa para nossa empresa. Temos cerca de 50 colaboradores.", isRead: false },
    { studioId: studio.id, clientId: "c1", clientName: "Marina Oliveira", clientEmail: "marina@email.com", type: "gallery_comment", subject: "Adorei a prévia!", content: "As fotos estão MARAVILHOSAS! Não consigo escolher minhas favoritas, são todas lindas demais! 😍", isRead: true, galleryId: "g1" },
    { studioId: studio.id, clientName: "Visitante Site", clientEmail: "contato@email.com", type: "inquiry", subject: "Orçamento casamento 2026", content: "Vi o portfólio e gostei muito do estilo. Gostaria de orçamento para casamento em março de 2026.", isRead: false },
    { studioId: studio.id, clientId: "c9", clientName: "Fernanda Lima", clientEmail: "fernanda.lima@email.com", type: "inquiry", subject: "Ensaio gestante", content: "Oi! Estou com 7 meses de gestação e gostaria de fazer um ensaio. Vocês fazem ensaio externo?", isRead: false },
    { studioId: studio.id, clientId: "c13", clientName: "Paula Mendes", clientEmail: "paula.m@email.com", type: "inquiry", subject: "Ensaio retrato profissional", content: "Preciso de fotos profissionais para LinkedIn e site pessoal. Quanto custa?", isRead: true },
    { studioId: studio.id, clientId: "c3", clientName: "Studio Belle Mode", clientEmail: "contato@bellemode.com", type: "approval", subject: "Aprovação fotos campanha", content: "Ana, precisamos da aprovação final das fotos até sexta. A equipe de marketing está aguardando para o lançamento.", isRead: false },
    { studioId: studio.id, clientId: "c2", clientName: "Rafael & Ana", clientEmail: "rafael.ana@email.com", type: "gallery_comment", subject: "Perfeitas!", content: "O pré-wedding ficou incrível! Estamos muito ansiosos para o casamento!", isRead: true, galleryId: "g2" },
    { studioId: studio.id, clientId: "c10", clientName: "Grupo Meridian", clientEmail: "eventos@meridian.com.br", type: "inquiry", subject: "Próximo evento", content: "Gostaríamos de agendar a cobertura do nosso evento de julho. Mesmos termos do contrato anual.", isRead: false },
    { studioId: studio.id, clientId: "c8", clientName: "Bianca & Pedro", clientEmail: "bianca.pedro@email.com", type: "inquiry", subject: "Dúvida sobre o dia", content: "Ana, temos uma dúvida sobre o horário da cerimônia. Pode ser às 16:30 em vez de 16:00?", isRead: true },
    { studioId: studio.id, clientName: "Ricardo Silva", clientEmail: "ricardo.s@email.com", type: "inquiry", subject: "Disponibilidade formatura", content: "Olá, gostaria de saber se vocês cobrem formaturas. Temos uma turma de 40 alunos.", isRead: false },
    { studioId: studio.id, clientId: "c4", clientName: "Luciana Ferreira", clientEmail: "lu.ferreira@email.com", type: "gallery_comment", subject: "Valentina ficou linda!", content: "As fotos da Valentina ficaram maravilhosas! Obrigada pelo carinho com nossa bebê. ❤️", isRead: true, galleryId: "g4" },
  ]).returning();

  await db.insert(messageReplies).values([
    { messageId: msg1.id, content: "Olá Juliana! Muito obrigada pelo interesse! Vou enviar uma proposta detalhada por email com todos os pacotes disponíveis para ensaio de 15 anos. Abraço! 💛", isFromPhotographer: true },
  ]);

  // ============ AUTOMATIONS (8) ============
  await db.insert(automations).values([
    { studioId: studio.id, name: "Lembrete pré-ensaio (2 dias)", trigger: "before_shoot", triggerConfig: { days: 2 }, channel: "email", subject: "Seu ensaio está chegando! 📸", message: "Olá {cliente}! Faltam 2 dias para o nosso ensaio. Confirme sua presença!", isActive: true, triggerCount: 24 },
    { studioId: studio.id, name: "Agradecimento pós-ensaio", trigger: "after_shoot", triggerConfig: { days: 1 }, channel: "whatsapp", message: "Oi {cliente}! Foi um prazer fotografar você! As fotos ficaram incríveis 🙌", isActive: true, triggerCount: 45 },
    { studioId: studio.id, name: "Aviso galeria pronta", trigger: "gallery_ready", channel: "email", subject: "Suas fotos estão prontas! 🎉", message: "Sua galeria está pronta para visualização. Acesse o link para ver e selecionar suas favoritas.", isActive: true, triggerCount: 32 },
    { studioId: studio.id, name: "Lembrete pagamento (3 dias)", trigger: "payment_due", triggerConfig: { days: 3 }, channel: "email", subject: "Lembrete de pagamento", message: "Olá {cliente}, lembrete amigável de que o pagamento de {valor} vence em 3 dias.", isActive: true, triggerCount: 18 },
    { studioId: studio.id, name: "Parabéns aniversário", trigger: "birthday", channel: "whatsapp", message: "Feliz aniversário, {cliente}! 🎂🎉 Que seu dia seja repleto de momentos lindos!", isActive: true, triggerCount: 8 },
    { studioId: studio.id, name: "Follow-up proposta (5 dias)", trigger: "proposal_followup", triggerConfig: { days: 5 }, channel: "email", subject: "Sobre nossa proposta", message: "Olá {cliente}, gostaria de saber se teve a oportunidade de analisar nossa proposta.", isActive: true, triggerCount: 12 },
    { studioId: studio.id, name: "Pedido de avaliação", trigger: "review_request", triggerConfig: { days: 7 }, channel: "email", subject: "Como foi sua experiência?", message: "Olá {cliente}! Gostaríamos muito de saber como foi sua experiência conosco.", isActive: false, triggerCount: 0 },
    { studioId: studio.id, name: "Lembrete pagamento atrasado", trigger: "payment_due", triggerConfig: { days: -1 }, channel: "email", subject: "Pagamento em atraso", message: "Olá {cliente}, identificamos que o pagamento referente a {descricao} está em atraso.", isActive: true, triggerCount: 5 },
  ]);

  // ============ NOTIFICATIONS (12) ============
  await db.insert(notifications).values([
    { userId: "user-photographer", type: "success", title: "Pagamento confirmado", message: "Marina Oliveira confirmou pagamento de R$ 2.833,00", link: "/app/finance", isRead: false, createdAt: daysAgo(0) },
    { userId: "user-photographer", type: "info", title: "Nova mensagem", message: "Tech Corp respondeu sobre a proposta corporativa", link: "/app/inbox", isRead: false, createdAt: daysAgo(0) },
    { userId: "user-photographer", type: "warning", title: "Proposta expirando", message: "Proposta para Juliana Santos vence em 5 dias", link: "/app/proposals", isRead: true, createdAt: daysAgo(1) },
    { userId: "user-photographer", type: "warning", title: "Pagamento em atraso", message: "Parcela de Rafael & Ana está 3 dias em atraso", link: "/app/finance", isRead: false, createdAt: daysAgo(0) },
    { userId: "user-photographer", type: "info", title: "Seleção recebida", message: "Marina Oliveira enviou seleção da galeria", link: "/app/galleries", isRead: true, createdAt: daysAgo(2) },
    { userId: "user-photographer", type: "success", title: "Contrato assinado", message: "Bianca & Pedro assinaram o contrato de casamento", link: "/app/contracts", isRead: true, createdAt: daysAgo(5) },
    { userId: "user-photographer", type: "info", title: "Nova mensagem de contato", message: "Visitante do site enviou mensagem sobre orçamento", link: "/app/inbox", isRead: false, createdAt: daysAgo(1) },
    { userId: "user-photographer", type: "success", title: "Ensaio confirmado", message: "Ensaio de gestante com Marina confirmado para próxima semana", link: "/app/shoots", isRead: true, createdAt: daysAgo(3) },
    { userId: "user-photographer", type: "info", title: "Nova mensagem", message: "Fernanda Lima perguntou sobre ensaio gestante", link: "/app/inbox", isRead: false, createdAt: daysAgo(0) },
    { userId: "user-photographer", type: "warning", title: "Prazo se aproximando", message: "Edição das fotos da Belle Mode vence em 3 dias", link: "/app/tasks", isRead: false, createdAt: daysAgo(0) },
    { userId: "user-client", type: "info", title: "Galeria disponível", message: "Sua galeria 'Casamento Marina & João — Prévia' está pronta!", link: "/client/galleries", isRead: false, createdAt: daysAgo(2) },
    { userId: "user-client", type: "info", title: "Nova proposta", message: "Você recebeu uma nova proposta de ensaio gestante", link: "/client/proposals", isRead: false, createdAt: daysAgo(1) },
  ]);

  console.log("✅ Seed completed successfully!");
  console.log("📊 Data summary:");
  console.log("   Users:         3 (admin, photographer, client)");
  console.log("   Studios:       1");
  console.log("   Clients:       15");
  console.log("   Shoots:        12 (all statuses)");
  console.log("   Galleries:     8 (all statuses)");
  console.log("   Photos:        86+");
  console.log("   Blog Posts:    8 (published, draft, scheduled)");
  console.log("   Proposals:     8 (all statuses)");
  console.log("   Contracts:     6 (signed, completed, sent)");
  console.log("   Invoices:      23 (distributed over 6 months)");
  console.log("   Tasks:         20 (distributed across kanban)");
  console.log("   Messages:      12 (read and unread)");
  console.log("   Automations:   8 (active and inactive)");
  console.log("   Notifications: 12");
  console.log("");
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
