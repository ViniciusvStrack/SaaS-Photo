import type {
  User, Photographer, Client, Shoot, Gallery, GalleryPhoto, Photo, BlogPost,
  Proposal, ProposalItem, Contract, Invoice, Task, Message, Automation,
  SubscriptionPlan, Notification, SupportTicket, PortfolioSettings, Integration
} from '@/types';

// Photo URLs from Pexels
export const PHOTO_URLS = [
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
  "https://images.pexels.com/photos/17180388/pexels-photo-17180388.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/33647303/pexels-photo-33647303.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/34921742/pexels-photo-34921742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/18889257/pexels-photo-18889257.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/38765828/pexels-photo-38765828.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/36991336/pexels-photo-36991336.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

// Users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin',
    password: 'admin',
    name: 'Admin NoirFrame',
    role: 'admin',
    avatar: 'NF',
    createdAt: '2024-01-01',
    lastLogin: '2025-05-15',
    isActive: true,
  },
  {
    id: 'photo-1',
    email: 'studio',
    password: 'studio',
    name: 'Ana Luísa Rodrigues',
    role: 'photographer',
    avatar: 'AL',
    phone: '(11) 99876-5432',
    createdAt: '2024-06-15',
    lastLogin: '2025-05-15',
    isActive: true,
  },
  {
    id: 'photo-2',
    email: 'marcos@studio.com',
    password: 'marcos123',
    name: 'Marcos Vinicius',
    role: 'photographer',
    avatar: 'MV',
    phone: '(21) 98765-1234',
    createdAt: '2024-08-20',
    lastLogin: '2025-05-14',
    isActive: true,
  },
  {
    id: 'photo-3',
    email: 'julia@foto.com',
    password: 'julia123',
    name: 'Julia Mendes',
    role: 'photographer',
    avatar: 'JM',
    phone: '(31) 97654-3210',
    createdAt: '2024-10-01',
    lastLogin: '2025-05-13',
    isActive: true,
  },
  {
    id: 'client-1',
    email: 'cliente',
    password: 'cliente',
    name: 'Marina Oliveira',
    role: 'client',
    avatar: 'MO',
    phone: '(11) 98765-4321',
    createdAt: '2024-12-01',
    lastLogin: '2025-05-10',
    isActive: true,
  },
];

// Photographers (extended user data)
export const mockPhotographers: Photographer[] = [
  {
    ...mockUsers[1],
    role: 'photographer',
    studioName: 'Studio Lumière',
    specialty: ['casamento', 'moda', 'retrato'],
    city: 'São Paulo, SP',
    instagram: '@studiolumiere',
    website: 'studiolumiere.com.br',
    bio: 'Fotógrafa apaixonada por capturar momentos autênticos. Especialista em casamentos e moda editorial.',
    planId: 'plan-completo',
    storageUsed: 45.2,
    storageLimit: 100,
    clientCount: 48,
    galleryCount: 32,
    brandColor: '#c9a96e',
    subscriptionStatus: 'active',
  },
  {
    ...mockUsers[2],
    role: 'photographer',
    studioName: 'MV Fotografia',
    specialty: ['casamento', 'evento', 'corporativo'],
    city: 'Rio de Janeiro, RJ',
    instagram: '@mvfotografia',
    website: 'mvfotografia.com.br',
    bio: 'Capturando momentos especiais há mais de 10 anos.',
    planId: 'plan-completo',
    storageUsed: 78.5,
    storageLimit: 250,
    clientCount: 120,
    galleryCount: 85,
    brandColor: '#4a90d9',
    subscriptionStatus: 'active',
  },
  {
    ...mockUsers[3],
    role: 'photographer',
    studioName: 'Julia Mendes Photo',
    specialty: ['newborn', 'família', 'gestante'],
    city: 'Belo Horizonte, MG',
    instagram: '@juliamendesphoto',
    bio: 'Especialista em fotografia de família e newborn.',
    planId: 'plan-completo',
    storageUsed: 12.3,
    storageLimit: 25,
    clientCount: 25,
    galleryCount: 18,
    brandColor: '#e0b0d5',
    subscriptionStatus: 'trial',
    trialEndsAt: '2025-06-01',
  },
];

// Clients
export const mockClients: Client[] = [
  { id: 'c1', photographerId: 'photo-1', name: 'Marina Oliveira', email: 'marina@email.com', phone: '(11) 98765-4321', city: 'São Paulo', status: 'recurring', type: 'Casamento', notes: 'Cliente VIP, indica bastante', tags: ['vip', 'indicação'], totalRevenue: 28500, shootCount: 4, createdAt: '2024-01-15', instagram: '@marinaoliveira' },
  { id: 'c2', photographerId: 'photo-1', name: 'Rafael & Ana', email: 'rafael.ana@email.com', phone: '(21) 91234-5678', city: 'Rio de Janeiro', status: 'scheduled', type: 'Casamento', notes: 'Casamento em junho na fazenda', tags: ['casamento2025'], totalRevenue: 12500, shootCount: 1, createdAt: '2024-03-10' },
  { id: 'c3', photographerId: 'photo-1', name: 'Studio Belle Mode', email: 'contato@bellemode.com', phone: '(11) 95555-1234', city: 'São Paulo', status: 'editing', type: 'Moda', notes: 'Campanha verão 2025', tags: ['corporativo', 'moda'], totalRevenue: 36000, shootCount: 3, createdAt: '2024-02-20' },
  { id: 'c4', photographerId: 'photo-1', name: 'Luciana Ferreira', email: 'lu.ferreira@email.com', phone: '(31) 97777-8888', city: 'Belo Horizonte', status: 'delivered', type: 'Newborn', notes: 'Bebê Valentina, 12 dias', tags: ['newborn'], totalRevenue: 1800, shootCount: 2, createdAt: '2024-04-05' },
  { id: 'c5', photographerId: 'photo-1', name: 'Tech Corp Brasil', email: 'marketing@techcorp.com.br', phone: '(11) 93333-2222', city: 'São Paulo', status: 'negotiation', type: 'Corporativo', notes: 'Fotos para relatório anual e LinkedIn', tags: ['corporativo', 'lead-quente'], totalRevenue: 0, shootCount: 0, createdAt: '2025-05-01' },
  { id: 'c6', photographerId: 'photo-1', name: 'Juliana Santos', email: 'ju.santos@email.com', phone: '(41) 96666-3333', city: 'Curitiba', status: 'lead', type: 'Retrato', notes: 'Quer ensaio de 15 anos da filha', tags: ['15anos'], totalRevenue: 0, shootCount: 0, createdAt: '2025-05-10' },
  { id: 'c7', photographerId: 'photo-1', name: 'Marcos Andrade', email: 'marcos.a@email.com', phone: '(11) 94444-7777', city: 'São Paulo', status: 'photographed', type: 'Evento', notes: 'Aniversário de 50 anos, 200 convidados', tags: ['evento'], totalRevenue: 3500, shootCount: 1, createdAt: '2024-03-25' },
  { id: 'c8', photographerId: 'photo-1', name: 'Bianca & Pedro', email: 'bianca.pedro@email.com', phone: '(21) 92222-6666', city: 'Niterói', status: 'scheduled', type: 'Casamento', notes: 'Casamento na praia, pôr do sol', tags: ['casamento2025', 'destino'], totalRevenue: 15000, shootCount: 1, createdAt: '2024-04-20' },
  { id: 'c9', photographerId: 'photo-1', name: 'Carla Moreira', email: 'carla.m@email.com', phone: '(11) 91111-2222', city: 'São Paulo', status: 'recurring', type: 'Moda', notes: 'Modelo profissional, lookbooks', tags: ['modelo', 'recorrente'], totalRevenue: 8500, shootCount: 6, createdAt: '2023-11-15', birthday: '1995-03-22' },
  { id: 'c10', photographerId: 'photo-1', name: 'Felipe Gomes', email: 'felipe.g@email.com', phone: '(19) 93333-4444', city: 'Campinas', status: 'delivered', type: 'Corporativo', notes: 'CEO, fotos para LinkedIn e site', tags: ['corporativo'], totalRevenue: 2200, shootCount: 1, createdAt: '2024-08-10' },
  { id: 'c11', photographerId: 'photo-1', name: 'Restaurante Sabor & Arte', email: 'contato@saborarte.com', phone: '(11) 95555-6666', city: 'São Paulo', status: 'editing', type: 'Produto', notes: 'Fotos do cardápio novo', tags: ['gastronomia', 'produto'], totalRevenue: 4500, shootCount: 2, createdAt: '2024-09-01' },
  { id: 'c12', photographerId: 'photo-1', name: 'Daniela & Thiago', email: 'dani.thiago@email.com', phone: '(11) 97777-3333', city: 'São Paulo', status: 'lead', type: 'Casamento', notes: 'Indicação da Marina', tags: ['casamento2026', 'indicação'], totalRevenue: 0, shootCount: 0, createdAt: '2025-05-12', referralSource: 'Marina Oliveira' },
  { id: 'c13', photographerId: 'photo-2', name: 'Patricia Lima', email: 'patricia@email.com', phone: '(21) 98888-1111', city: 'Rio de Janeiro', status: 'scheduled', type: 'Casamento', notes: 'Casamento em Búzios', tags: ['destino'], totalRevenue: 18000, shootCount: 1, createdAt: '2024-07-15' },
  { id: 'c14', photographerId: 'photo-2', name: 'Empresa XYZ', email: 'rh@xyz.com', phone: '(21) 3333-4444', city: 'Rio de Janeiro', status: 'delivered', type: 'Corporativo', notes: 'Evento anual da empresa', tags: ['corporativo'], totalRevenue: 8000, shootCount: 2, createdAt: '2024-05-20' },
  { id: 'c15', photographerId: 'photo-3', name: 'Amanda Costa', email: 'amanda.c@email.com', phone: '(31) 96666-7777', city: 'Belo Horizonte', status: 'delivered', type: 'Newborn', notes: 'Bebê Lorenzo', tags: ['newborn'], totalRevenue: 1500, shootCount: 1, createdAt: '2024-11-10' },
  { id: 'c16', photographerId: 'photo-3', name: 'Família Rodrigues', email: 'rodrigues.fam@email.com', phone: '(31) 95555-8888', city: 'Belo Horizonte', status: 'scheduled', type: 'Família', notes: 'Ensaio de Natal', tags: ['família', 'natal'], totalRevenue: 1200, shootCount: 2, createdAt: '2024-10-05' },
  { id: 'c17', photographerId: 'photo-1', name: 'Isabella Martins', email: 'isa.martins@email.com', phone: '(11) 94444-5555', city: 'São Paulo', status: 'photographed', type: 'Retrato', notes: 'Ensaio autoral', tags: ['autoral', 'fine-art'], totalRevenue: 1800, shootCount: 1, createdAt: '2025-04-20' },
  { id: 'c18', photographerId: 'photo-1', name: 'Dr. Roberto Silva', email: 'dr.roberto@clinica.com', phone: '(11) 93333-8888', city: 'São Paulo', status: 'negotiation', type: 'Corporativo', notes: 'Fotos para clínica médica', tags: ['corporativo', 'saúde'], totalRevenue: 0, shootCount: 0, createdAt: '2025-05-08' },
];

// Shoots
export const mockShoots: Shoot[] = [
  { id: 's1', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', name: 'Casamento Marina & João', type: 'Casamento', date: '2025-06-15', time: '15:00', endTime: '23:00', location: 'Fazenda Santa Maria, Campinas', status: 'confirmed', value: 8500, package: 'Premium', notes: 'Cerimônia ao ar livre + festa', briefing: 'Estilo romântico, fotos espontâneas', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Pagamento confirmado', done: true }, { item: 'Briefing preenchido', done: true }, { item: 'Locação definida', done: true }, { item: 'Equipamentos preparados', done: false }, { item: 'Backup feito', done: false }], deliveryDeadline: '2025-07-30', proposalId: 'pr1', contractId: 'ct1', createdAt: '2024-12-01' },
  { id: 's2', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', name: 'Ensaio Pré-Wedding', type: 'Pré-Wedding', date: '2025-05-28', time: '16:30', location: 'Jardim Botânico, Rio de Janeiro', status: 'confirmed', value: 2800, package: 'Classic', notes: 'Estilo romântico e natural', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Pagamento confirmado', done: true }, { item: 'Briefing preenchido', done: false }], deliveryDeadline: '2025-06-15', createdAt: '2025-03-01' },
  { id: 's3', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', name: 'Campanha Verão 2025', type: 'Moda', date: '2025-05-20', time: '09:00', endTime: '18:00', location: 'Estúdio Central, SP', status: 'editing', value: 12000, package: 'Business', notes: '15 looks, 3 modelos', briefing: 'Minimalista, fundo neutro, luz natural', shotList: ['Look 1 - frente', 'Look 1 - perfil', 'Look 2 - movimento'], checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Pagamento confirmado', done: true }, { item: 'Briefing preenchido', done: true }, { item: 'Backup feito', done: true }, { item: 'Prévia enviada', done: true }, { item: 'Edição finalizada', done: false }], galleryId: 'g3', createdAt: '2025-02-15' },
  { id: 's4', photographerId: 'photo-1', clientId: 'c4', clientName: 'Luciana Ferreira', name: 'Newborn Valentina', type: 'Newborn', date: '2025-04-28', time: '10:00', location: 'Residência da cliente, BH', status: 'delivered', value: 1800, package: 'Newborn Completo', notes: 'Estilo lifestyle, cores neutras', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Pagamento confirmado', done: true }, { item: 'Entrega enviada', done: true }], galleryId: 'g4', createdAt: '2025-04-01' },
  { id: 's5', photographerId: 'photo-1', clientId: 'c7', clientName: 'Marcos Andrade', name: 'Evento 50 Anos', type: 'Evento', date: '2025-05-10', time: '19:00', location: 'Buffet Estrela, São Paulo', status: 'photographed', value: 3500, package: 'Cobertura Completa', notes: '200 convidados', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Backup feito', done: true }, { item: 'Prévia enviada', done: false }], createdAt: '2025-04-01' },
  { id: 's6', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', name: 'Casamento Praia', type: 'Casamento', date: '2025-07-20', time: '16:00', location: 'Praia de Camboinhas, Niterói', status: 'confirmed', value: 15000, package: 'Destination', notes: 'Cerimônia ao pôr do sol', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Pagamento sinal', done: true }, { item: 'Briefing preenchido', done: false }], deliveryDeadline: '2025-09-15', proposalId: 'pr4', contractId: 'ct2', createdAt: '2025-04-15' },
  { id: 's7', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', name: 'Lookbook Inverno', type: 'Moda', date: '2025-05-25', time: '14:00', location: 'Estúdio Lumière', status: 'confirmed', value: 2500, notes: '10 looks, estilo editorial', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Looks confirmados', done: true }], createdAt: '2025-05-01' },
  { id: 's8', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', name: 'Cardápio Novo', type: 'Produto', date: '2025-05-18', time: '08:00', location: 'Restaurante - Vila Madalena', status: 'editing', value: 3000, notes: '25 pratos para fotografar', checklist: [{ item: 'Lista de pratos', done: true }, { item: 'Ensaio realizado', done: true }, { item: 'Edição em andamento', done: false }], createdAt: '2025-05-05' },
  { id: 's9', photographerId: 'photo-1', clientId: 'c17', clientName: 'Isabella Martins', name: 'Ensaio Fine Art', type: 'Retrato', date: '2025-05-22', time: '06:00', location: 'Parque Ibirapuera', status: 'photographed', value: 1800, notes: 'Golden hour, estilo artístico', checklist: [{ item: 'Locação confirmada', done: true }, { item: 'Ensaio realizado', done: true }], createdAt: '2025-05-15' },
  { id: 's10', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', name: 'Casamento em Búzios', type: 'Casamento', date: '2025-08-10', time: '17:00', location: 'Pousada Vista Mar, Búzios', status: 'confirmed', value: 18000, package: 'Destination Premium', checklist: [{ item: 'Contrato assinado', done: true }, { item: 'Hospedagem reservada', done: true }], createdAt: '2024-07-20' },
  { id: 's11', photographerId: 'photo-3', clientId: 'c15', clientName: 'Amanda Costa', name: 'Newborn Lorenzo', type: 'Newborn', date: '2025-04-15', time: '09:00', location: 'Studio Julia Mendes', status: 'delivered', value: 1500, checklist: [{ item: 'Entrega realizada', done: true }], galleryId: 'g11', createdAt: '2025-04-01' },
  { id: 's12', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', name: 'Casamento Rafael & Ana', type: 'Casamento', date: '2025-09-20', time: '15:30', location: 'Fazenda Dona Carolina', status: 'confirmed', value: 12500, package: 'Premium', checklist: [{ item: 'Contrato enviado', done: true }, { item: 'Sinal pago', done: true }], deliveryDeadline: '2025-11-20', createdAt: '2025-03-15' },
  { id: 's13', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', name: 'Ensaio Gestante', type: 'Gestante', date: '2025-06-01', time: '16:00', location: 'Praia de Santos', status: 'confirmed', value: 1800, notes: '7 meses de gestação', checklist: [{ item: 'Data confirmada', done: true }], createdAt: '2025-05-01' },
  { id: 's14', photographerId: 'photo-1', clientId: 'c10', clientName: 'Felipe Gomes', name: 'Retrato Corporativo', type: 'Corporativo', date: '2025-04-05', time: '14:00', location: 'Escritório do cliente', status: 'delivered', value: 2200, checklist: [{ item: 'Entrega realizada', done: true }], galleryId: 'g10', createdAt: '2025-03-20' },
  { id: 's15', photographerId: 'photo-2', clientId: 'c14', clientName: 'Empresa XYZ', name: 'Evento Corporativo', type: 'Evento', date: '2025-04-20', time: '18:00', location: 'Hotel Windsor', status: 'delivered', value: 8000, checklist: [{ item: 'Fotos entregues', done: true }], createdAt: '2025-03-01' },
  { id: 's16', photographerId: 'photo-3', clientId: 'c16', clientName: 'Família Rodrigues', name: 'Ensaio Família', type: 'Família', date: '2025-06-15', time: '10:00', location: 'Parque das Mangabeiras', status: 'confirmed', value: 1200, checklist: [{ item: 'Data confirmada', done: true }], createdAt: '2025-05-10' },
];

// Generate gallery photos
const generateGalleryPhotos = (count: number, startIndex: number = 0): GalleryPhoto[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `gp-${startIndex + i}`,
    url: PHOTO_URLS[(startIndex + i) % PHOTO_URLS.length],
    thumbnailUrl: PHOTO_URLS[(startIndex + i) % PHOTO_URLS.length],
    filename: `IMG_${(2000 + startIndex + i).toString()}.jpg`,
    order: i,
    isFavorite: Math.random() > 0.7,
    isSelected: false,
  }));
};

// Galleries
export const mockGalleries: Gallery[] = [
  { id: 'g1', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', shootId: 's1', name: 'Casamento Marina & João — Prévia', slug: 'marina-joao-preview', coverUrl: PHOTO_URLS[0], photos: generateGalleryPhotos(45), status: 'selection_received', password: 'marina2024', allowDownload: false, allowFavorites: true, maxSelections: 30, watermark: true, expiresAt: '2025-08-20', message: 'Marina, aqui está a prévia do seu grande dia! Selecione suas favoritas 💛', clientSelections: ['gp-0', 'gp-3', 'gp-7', 'gp-12'], viewCount: 24, createdAt: '2025-01-20', sentAt: '2025-01-21', viewedAt: '2025-01-21' },
  { id: 'g2', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', name: 'Pré-Wedding Rafael & Ana', slug: 'rafael-ana-prewedding', coverUrl: PHOTO_URLS[2], photos: generateGalleryPhotos(32, 5), status: 'sent', password: 'rafaelana', allowDownload: true, allowFavorites: true, watermark: false, expiresAt: '2025-07-15', message: 'Olha que lindos vocês ficaram! Escolham as melhores para o álbum.', clientSelections: [], viewCount: 0, createdAt: '2025-05-15' },
  { id: 'g3', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', shootId: 's3', name: 'Campanha Verão 2025', slug: 'bellemode-verao25', coverUrl: PHOTO_URLS[8], photos: generateGalleryPhotos(120, 10), status: 'viewed', password: 'bellemode25', allowDownload: false, allowFavorites: true, maxSelections: 50, watermark: true, message: 'Confira as imagens da campanha. Aguardo a seleção!', clientSelections: [], viewCount: 5, createdAt: '2025-05-22', sentAt: '2025-05-22', viewedAt: '2025-05-23' },
  { id: 'g4', photographerId: 'photo-1', clientId: 'c4', clientName: 'Luciana Ferreira', shootId: 's4', name: 'Newborn Valentina', slug: 'valentina-newborn', coverUrl: PHOTO_URLS[6], photos: generateGalleryPhotos(28, 15), status: 'delivered', password: 'valentina', allowDownload: true, allowFavorites: false, watermark: false, message: 'Luciana, aqui estão todas as fotos da Valentina! Pode baixar à vontade 🥰', clientSelections: [], viewCount: 12, createdAt: '2025-05-05', sentAt: '2025-05-06', viewedAt: '2025-05-06' },
  { id: 'g5', photographerId: 'photo-1', clientId: 'c7', clientName: 'Marcos Andrade', shootId: 's5', name: 'Evento 50 Anos', slug: 'marcos-50anos', coverUrl: PHOTO_URLS[4], photos: generateGalleryPhotos(85, 20), status: 'draft', allowDownload: false, allowFavorites: false, watermark: true, message: '', clientSelections: [], viewCount: 0, createdAt: '2025-05-12' },
  { id: 'g6', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', name: 'Lookbook Outono', slug: 'carla-outono', coverUrl: PHOTO_URLS[12], photos: generateGalleryPhotos(40, 25), status: 'delivered', allowDownload: true, allowFavorites: false, watermark: false, clientSelections: [], viewCount: 8, createdAt: '2025-03-20' },
  { id: 'g7', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', name: 'Ensaio Família 2024', slug: 'marina-familia-2024', coverUrl: PHOTO_URLS[1], photos: generateGalleryPhotos(35, 30), status: 'delivered', allowDownload: true, allowFavorites: false, watermark: false, clientSelections: [], viewCount: 15, createdAt: '2024-12-10' },
  { id: 'g8', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', name: 'Ensaio Noivado', slug: 'patricia-noivado', coverUrl: PHOTO_URLS[5], photos: generateGalleryPhotos(50, 35), status: 'delivered', allowDownload: true, allowFavorites: true, watermark: false, clientSelections: ['gp-35', 'gp-38', 'gp-42'], viewCount: 22, createdAt: '2025-02-15' },
  { id: 'g9', photographerId: 'photo-2', clientId: 'c14', clientName: 'Empresa XYZ', shootId: 's15', name: 'Evento Corporativo XYZ', slug: 'xyz-evento', coverUrl: PHOTO_URLS[14], photos: generateGalleryPhotos(180, 40), status: 'delivered', allowDownload: true, allowFavorites: false, watermark: false, clientSelections: [], viewCount: 45, createdAt: '2025-04-25' },
  { id: 'g10', photographerId: 'photo-1', clientId: 'c10', clientName: 'Felipe Gomes', shootId: 's14', name: 'Retratos Corporativos', slug: 'felipe-corporativo', coverUrl: PHOTO_URLS[11], photos: generateGalleryPhotos(15, 50), status: 'delivered', allowDownload: true, allowFavorites: false, watermark: false, clientSelections: [], viewCount: 3, createdAt: '2025-04-10' },
  { id: 'g11', photographerId: 'photo-3', clientId: 'c15', clientName: 'Amanda Costa', shootId: 's11', name: 'Newborn Lorenzo', slug: 'lorenzo-newborn', coverUrl: PHOTO_URLS[7], photos: generateGalleryPhotos(25, 55), status: 'delivered', allowDownload: true, allowFavorites: false, watermark: false, clientSelections: [], viewCount: 18, createdAt: '2025-04-20' },
  { id: 'g12', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', shootId: 's8', name: 'Cardápio Primavera', slug: 'saborarte-cardapio', coverUrl: PHOTO_URLS[17], photos: generateGalleryPhotos(30, 60), status: 'draft', allowDownload: false, allowFavorites: true, maxSelections: 25, watermark: true, clientSelections: [], viewCount: 0, createdAt: '2025-05-19' },
];

// Photos (for photo library)
export const mockPhotos: Photo[] = PHOTO_URLS.flatMap((url, i) => ([
  { id: `photo-${i * 4 + 1}`, photographerId: 'photo-1', url, thumbnailUrl: url, filename: `IMG_${2000 + i * 4}.jpg`, clientId: mockClients[i % 12]?.id, clientName: mockClients[i % 12]?.name, tags: ['editada', 'selecionada'], isPortfolio: i < 8, isCover: i === 0, uploadedAt: `2025-0${(i % 5) + 1}-${((i * 3) % 28 + 1).toString().padStart(2, '0')}`, width: 1200, height: 800 },
  { id: `photo-${i * 4 + 2}`, photographerId: 'photo-1', url, thumbnailUrl: url, filename: `IMG_${2001 + i * 4}.jpg`, clientId: mockClients[(i + 1) % 12]?.id, clientName: mockClients[(i + 1) % 12]?.name, tags: ['editada'], isPortfolio: false, isCover: false, uploadedAt: `2025-0${(i % 5) + 1}-${((i * 2) % 28 + 1).toString().padStart(2, '0')}`, width: 1200, height: 800 },
  { id: `photo-${i * 4 + 3}`, photographerId: 'photo-1', url, thumbnailUrl: url, filename: `IMG_${2002 + i * 4}.jpg`, tags: ['raw'], isPortfolio: false, isCover: false, uploadedAt: `2025-0${(i % 5) + 1}-${((i * 4) % 28 + 1).toString().padStart(2, '0')}`, width: 1200, height: 800 },
  { id: `photo-${i * 4 + 4}`, photographerId: 'photo-2', url, thumbnailUrl: url, filename: `MV_${3000 + i}.jpg`, clientId: mockClients[(i + 5) % 12]?.id, tags: ['entregue'], isPortfolio: i % 3 === 0, isCover: false, uploadedAt: `2025-0${(i % 5) + 1}-${((i * 5) % 28 + 1).toString().padStart(2, '0')}`, width: 1200, height: 800 },
]));

// Blog Posts
export const mockBlogPosts: BlogPost[] = [
  { id: 'b1', photographerId: 'photo-1', title: '5 Dicas para um Ensaio de Casamento Inesquecível', slug: 'dicas-ensaio-casamento', excerpt: 'Como preparar seus clientes para o grande dia e capturar momentos eternos.', content: '# 5 Dicas para um Ensaio de Casamento Inesquecível\n\nO casamento é um dos momentos mais especiais na vida de um casal. Como fotógrafo, seu papel vai além de simplesmente clicar o botão.\n\n## 1. Conheça o casal\n\nAntes do grande dia, marque uma reunião. Entenda a dinâmica do casal e suas preferências.\n\n## 2. Visite o local\n\nFazer uma visita prévia permite planejar os melhores ângulos.\n\n## 3. Crie uma shot list\n\nConverse sobre as fotos que não podem faltar.\n\n## 4. Tenha backup\n\nDois corpos de câmera, baterias extras. Em casamento, não há segunda chance.\n\n## 5. Capture emoções\n\nAs melhores fotos são aquelas que transmitem emoção genuína.', coverUrl: PHOTO_URLS[0], category: 'Casamentos', tags: ['casamento', 'dicas', 'noivas'], status: 'published', publishedAt: '2025-04-10', viewCount: 342, createdAt: '2025-04-08', updatedAt: '2025-04-10' },
  { id: 'b2', photographerId: 'photo-1', title: 'Making Of: Campanha Editorial de Moda', slug: 'making-of-campanha-moda', excerpt: 'Bastidores de uma produção fotográfica profissional para uma marca de moda.', content: '# Making Of: Campanha Editorial\n\nNeste post compartilho os bastidores de uma das produções mais desafiadoras.\n\n## O Briefing\n\nA marca queria elegância crua — texturas, sombras e paleta restrita.\n\n## A Equipe\n\nMaquiadora, stylist, assistente de iluminação e produção.\n\n## O Resultado\n\nMais de 500 cliques em 8 horas, resultando em 25 imagens finais.', coverUrl: PHOTO_URLS[8], category: 'Bastidores', tags: ['moda', 'bastidores', 'editorial'], status: 'published', publishedAt: '2025-03-22', viewCount: 215, createdAt: '2025-03-20', updatedAt: '2025-03-22' },
  { id: 'b3', photographerId: 'photo-1', title: 'Como Cobrar Pelo Seu Trabalho', slug: 'guia-precificacao', excerpt: 'Guia prático para fotógrafos precificarem seus serviços.', content: '# Como Cobrar Pelo Seu Trabalho\n\nPrecificar fotografia é uma das maiores dúvidas.\n\n## Custos\n\nEntenda todos os seus custos: equipamento, software, deslocamento.\n\n## Valor Percebido\n\nSeu preço deve refletir o valor que o cliente percebe.\n\n## Pacotes\n\nOferecer pacotes facilita a decisão do cliente.', coverUrl: PHOTO_URLS[14], category: 'Negócio', tags: ['negócio', 'precificação'], status: 'published', publishedAt: '2025-02-15', viewCount: 567, createdAt: '2025-02-10', updatedAt: '2025-02-15' },
  { id: 'b4', photographerId: 'photo-1', title: 'Tendências de Fotografia para 2025', slug: 'tendencias-2025', excerpt: 'As principais tendências visuais que vão dominar a fotografia.', content: '# Tendências 2025\n\n## Flash Criativo\n\nUso de flash em situações inesperadas.\n\n## Autenticidade\n\nFotos cada vez mais naturais e espontâneas.\n\n## Film Look\n\nA estética de filme continua forte.', coverUrl: PHOTO_URLS[10], category: 'Tendências', tags: ['tendências', '2025'], status: 'draft', viewCount: 0, createdAt: '2025-05-01', updatedAt: '2025-05-10' },
  { id: 'b5', photographerId: 'photo-1', title: 'O Equipamento Ideal para Casamentos', slug: 'equipamento-casamentos', excerpt: 'Quais câmeras e lentes usar em cobertura de casamento.', content: '# Equipamento para Casamentos\n\nDescubra o setup ideal para fotografar casamentos com segurança e qualidade.', coverUrl: PHOTO_URLS[15], category: 'Equipamento', tags: ['equipamento', 'casamento'], status: 'published', publishedAt: '2025-01-20', viewCount: 423, createdAt: '2025-01-15', updatedAt: '2025-01-20' },
  { id: 'b6', photographerId: 'photo-1', title: 'Newborn: Segurança em Primeiro Lugar', slug: 'newborn-seguranca', excerpt: 'Dicas essenciais de segurança para ensaios newborn.', content: '# Segurança em Ensaios Newborn\n\nA segurança do bebê é prioridade absoluta.', coverUrl: PHOTO_URLS[7], category: 'Newborn', tags: ['newborn', 'segurança'], status: 'published', publishedAt: '2025-03-05', viewCount: 289, createdAt: '2025-03-01', updatedAt: '2025-03-05' },
  { id: 'b7', photographerId: 'photo-2', title: 'Fotografia de Eventos Corporativos', slug: 'eventos-corporativos', excerpt: 'Como se destacar na fotografia de eventos empresariais.', content: '# Eventos Corporativos\n\nUm nicho lucrativo e consistente.', coverUrl: PHOTO_URLS[14], category: 'Corporativo', tags: ['corporativo', 'eventos'], status: 'published', publishedAt: '2025-04-01', viewCount: 156, createdAt: '2025-03-28', updatedAt: '2025-04-01' },
  { id: 'b8', photographerId: 'photo-1', title: 'Iluminação Natural: Guia Completo', slug: 'iluminacao-natural', excerpt: 'Domine a luz natural em qualquer situação.', content: '# Iluminação Natural\n\nA luz é a essência da fotografia.', coverUrl: PHOTO_URLS[3], category: 'Técnica', tags: ['iluminação', 'técnica'], status: 'scheduled', scheduledAt: '2025-06-01', viewCount: 0, createdAt: '2025-05-15', updatedAt: '2025-05-15' },
  { id: 'b9', photographerId: 'photo-3', title: 'Poses para Ensaios de Família', slug: 'poses-familia', excerpt: 'Ideias de poses naturais para famílias.', content: '# Poses para Família\n\nComo criar momentos genuínos.', coverUrl: PHOTO_URLS[1], category: 'Família', tags: ['família', 'poses'], status: 'published', publishedAt: '2025-02-28', viewCount: 198, createdAt: '2025-02-25', updatedAt: '2025-02-28' },
  { id: 'b10', photographerId: 'photo-1', title: 'Workflow de Edição Profissional', slug: 'workflow-edicao', excerpt: 'Como organizar seu fluxo de edição para entregar mais rápido.', content: '# Workflow de Edição\n\nOtimize seu tempo de pós-produção.', coverUrl: PHOTO_URLS[9], category: 'Técnica', tags: ['edição', 'workflow', 'lightroom'], status: 'published', publishedAt: '2025-04-25', viewCount: 312, createdAt: '2025-04-20', updatedAt: '2025-04-25' },
];

// Proposals
export const mockProposals: Proposal[] = [
  { id: 'pr1', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', shootId: 's12', service: 'Casamento Completo', package: 'Premium', items: [{ id: 'i1', description: 'Cobertura completa (12h)', quantity: 1, unitPrice: 7000, total: 7000 }, { id: 'i2', description: 'Ensaio pré-wedding', quantity: 1, unitPrice: 2800, total: 2800 }, { id: 'i3', description: 'Álbum 30x30 60 páginas', quantity: 1, unitPrice: 1800, total: 1800 }, { id: 'i4', description: 'Pendrive personalizado', quantity: 1, unitPrice: 200, total: 200 }], subtotal: 11800, discount: 0, total: 11800, validUntil: '2025-06-30', status: 'accepted', createdAt: '2025-03-01', sentAt: '2025-03-02', respondedAt: '2025-03-05' },
  { id: 'pr2', photographerId: 'photo-1', clientId: 'c5', clientName: 'Tech Corp Brasil', service: 'Fotografia Corporativa', package: 'Business', items: [{ id: 'i1', description: 'Retratos de 10 executivos', quantity: 10, unitPrice: 450, total: 4500 }, { id: 'i2', description: 'Fotos do escritório', quantity: 1, unitPrice: 2300, total: 2300 }], subtotal: 6800, discount: 0, total: 6800, validUntil: '2025-06-15', status: 'sent', createdAt: '2025-05-05', sentAt: '2025-05-06' },
  { id: 'pr3', photographerId: 'photo-1', clientId: 'c6', clientName: 'Juliana Santos', service: 'Ensaio 15 Anos', package: 'Classic', items: [{ id: 'i1', description: 'Ensaio externo (2h)', quantity: 1, unitPrice: 1800, total: 1800 }, { id: 'i2', description: 'Fotos artísticas especiais', quantity: 10, unitPrice: 40, total: 400 }], subtotal: 2200, discount: 0, total: 2200, validUntil: '2025-06-20', status: 'sent', createdAt: '2025-05-12', sentAt: '2025-05-12' },
  { id: 'pr4', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', shootId: 's6', service: 'Casamento na Praia', package: 'Destination', items: [{ id: 'i1', description: 'Cobertura completa (14h)', quantity: 1, unitPrice: 10000, total: 10000 }, { id: 'i2', description: 'Ensaio trash the dress', quantity: 1, unitPrice: 2500, total: 2500 }, { id: 'i3', description: 'Álbum fine art', quantity: 1, unitPrice: 2500, total: 2500 }], subtotal: 15000, discount: 0, total: 15000, validUntil: '2025-07-01', status: 'accepted', createdAt: '2025-04-15', sentAt: '2025-04-15', respondedAt: '2025-04-18' },
  { id: 'pr5', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', service: 'Ensaio Família', package: 'Family', items: [{ id: 'i1', description: 'Ensaio em estúdio (1h)', quantity: 1, unitPrice: 1200, total: 1200 }, { id: 'i2', description: 'Fotos impressas 20x30', quantity: 5, unitPrice: 60, total: 300 }], subtotal: 1500, discount: 0, total: 1500, validUntil: '2025-04-30', status: 'expired', createdAt: '2025-03-20', sentAt: '2025-03-20' },
  { id: 'pr6', photographerId: 'photo-1', clientId: 'c12', clientName: 'Daniela & Thiago', service: 'Casamento 2026', package: 'Premium', items: [{ id: 'i1', description: 'Cobertura completa', quantity: 1, unitPrice: 9500, total: 9500 }], subtotal: 9500, discount: 500, total: 9000, validUntil: '2025-06-30', status: 'draft', notes: 'Desconto indicação Marina', createdAt: '2025-05-15' },
  { id: 'pr7', photographerId: 'photo-1', clientId: 'c18', clientName: 'Dr. Roberto Silva', service: 'Fotos Clínica', package: 'Business', items: [{ id: 'i1', description: 'Fotos do espaço', quantity: 1, unitPrice: 2000, total: 2000 }, { id: 'i2', description: 'Retratos equipe', quantity: 5, unitPrice: 300, total: 1500 }], subtotal: 3500, discount: 0, total: 3500, validUntil: '2025-05-30', status: 'sent', createdAt: '2025-05-10', sentAt: '2025-05-10' },
  { id: 'pr8', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', service: 'Casamento Búzios', package: 'Destination Premium', items: [{ id: 'i1', description: 'Pacote completo destino', quantity: 1, unitPrice: 18000, total: 18000 }], subtotal: 18000, discount: 0, total: 18000, validUntil: '2025-08-01', status: 'accepted', createdAt: '2024-07-20', sentAt: '2024-07-21', respondedAt: '2024-07-25' },
  { id: 'pr9', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', service: 'Lookbook', package: 'Fashion', items: [{ id: 'i1', description: 'Ensaio 10 looks', quantity: 1, unitPrice: 2500, total: 2500 }], subtotal: 2500, discount: 0, total: 2500, validUntil: '2025-05-20', status: 'accepted', createdAt: '2025-05-01', respondedAt: '2025-05-02' },
  { id: 'pr10', photographerId: 'photo-3', clientId: 'c16', clientName: 'Família Rodrigues', service: 'Ensaio Família', package: 'Family', items: [{ id: 'i1', description: 'Ensaio externo', quantity: 1, unitPrice: 1200, total: 1200 }], subtotal: 1200, discount: 0, total: 1200, validUntil: '2025-06-01', status: 'accepted', createdAt: '2025-05-10', respondedAt: '2025-05-11' },
  { id: 'pr11', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', service: 'Fotos Cardápio', package: 'Product', items: [{ id: 'i1', description: 'Fotos de 25 pratos', quantity: 25, unitPrice: 120, total: 3000 }], subtotal: 3000, discount: 0, total: 3000, validUntil: '2025-05-15', status: 'accepted', createdAt: '2025-05-01', respondedAt: '2025-05-03' },
  { id: 'pr12', photographerId: 'photo-1', clientId: 'c17', clientName: 'Isabella Martins', service: 'Ensaio Fine Art', package: 'Autoral', items: [{ id: 'i1', description: 'Ensaio artístico', quantity: 1, unitPrice: 1800, total: 1800 }], subtotal: 1800, discount: 0, total: 1800, validUntil: '2025-05-15', status: 'accepted', createdAt: '2025-05-10', respondedAt: '2025-05-11' },
];

// Contracts
export const mockContracts: Contract[] = [
  { id: 'ct1', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', shootId: 's12', proposalId: 'pr1', title: 'Contrato de Casamento', service: 'Casamento Completo Premium', value: 11800, terms: 'Contrato de prestação de serviços fotográficos...', clauses: ['Entrega em até 60 dias', 'Backup por 1 ano', 'Direitos de uso comercial cedidos'], status: 'signed', signedAt: '2025-03-10', createdAt: '2025-03-05', sentAt: '2025-03-06' },
  { id: 'ct2', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', shootId: 's6', proposalId: 'pr4', title: 'Contrato Casamento Destino', service: 'Casamento na Praia Destination', value: 15000, terms: 'Contrato de prestação de serviços fotográficos...', clauses: ['Inclui deslocamento', 'Entrega em até 90 dias'], status: 'signed', signedAt: '2025-04-20', createdAt: '2025-04-18', sentAt: '2025-04-19' },
  { id: 'ct3', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', shootId: 's3', title: 'Contrato Campanha', service: 'Campanha Moda Verão 2025', value: 12000, terms: 'Contrato de prestação de serviços...', clauses: ['Direitos comerciais por 1 ano', 'Revisões ilimitadas'], status: 'completed', signedAt: '2025-02-01', createdAt: '2025-01-25', sentAt: '2025-01-26' },
  { id: 'ct4', photographerId: 'photo-1', clientId: 'c4', clientName: 'Luciana Ferreira', shootId: 's4', title: 'Contrato Newborn', service: 'Ensaio Newborn', value: 1800, terms: 'Contrato de prestação de serviços...', clauses: ['Entrega em 15 dias'], status: 'completed', signedAt: '2025-04-20', createdAt: '2025-04-18', sentAt: '2025-04-19' },
  { id: 'ct5', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', proposalId: 'pr9', title: 'Contrato Lookbook', service: 'Lookbook Inverno', value: 2500, terms: 'Contrato de prestação de serviços...', clauses: [], status: 'signed', signedAt: '2025-05-03', createdAt: '2025-05-02', sentAt: '2025-05-02' },
  { id: 'ct6', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', shootId: 's8', proposalId: 'pr11', title: 'Contrato Gastronomia', service: 'Fotos Cardápio', value: 3000, terms: 'Contrato de prestação de serviços...', clauses: ['Uso exclusivo para cardápio'], status: 'signed', signedAt: '2025-05-05', createdAt: '2025-05-04' },
  { id: 'ct7', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', shootId: 's10', proposalId: 'pr8', title: 'Contrato Casamento Búzios', service: 'Casamento Destination', value: 18000, terms: 'Contrato de prestação de serviços...', clauses: [], status: 'signed', signedAt: '2024-08-01', createdAt: '2024-07-28' },
  { id: 'ct8', photographerId: 'photo-1', clientId: 'c17', clientName: 'Isabella Martins', shootId: 's9', proposalId: 'pr12', title: 'Contrato Fine Art', service: 'Ensaio Autoral', value: 1800, terms: 'Contrato...', clauses: [], status: 'signed', signedAt: '2025-05-12', createdAt: '2025-05-11' },
  { id: 'ct9', photographerId: 'photo-3', clientId: 'c16', clientName: 'Família Rodrigues', proposalId: 'pr10', title: 'Contrato Família', service: 'Ensaio Família', value: 1200, terms: 'Contrato...', clauses: [], status: 'signed', signedAt: '2025-05-12', createdAt: '2025-05-11' },
  { id: 'ct10', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', shootId: 's13', title: 'Contrato Gestante', service: 'Ensaio Gestante', value: 1800, terms: 'Contrato...', clauses: [], status: 'sent', createdAt: '2025-05-20', sentAt: '2025-05-20' },
];

// Invoices (Transactions)
export const mockInvoices: Invoice[] = [
  { id: 'inv1', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', description: 'Casamento — Parcela 3/3', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 2833, total: 2833 }], subtotal: 2833, tax: 0, total: 2833, status: 'paid', dueDate: '2025-05-15', paidAt: '2025-05-14', createdAt: '2025-04-15' },
  { id: 'inv2', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', contractId: 'ct1', description: 'Casamento — Sinal', items: [{ description: 'Entrada 30%', quantity: 1, unitPrice: 3540, total: 3540 }], subtotal: 3540, tax: 0, total: 3540, status: 'paid', dueDate: '2025-03-15', paidAt: '2025-03-15', createdAt: '2025-03-10' },
  { id: 'inv3', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', contractId: 'ct1', description: 'Casamento — Parcela 2/3', items: [{ description: 'Parcela 2', quantity: 1, unitPrice: 3540, total: 3540 }], subtotal: 3540, tax: 0, total: 3540, status: 'paid', dueDate: '2025-05-01', paidAt: '2025-05-01', createdAt: '2025-04-01' },
  { id: 'inv4', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', contractId: 'ct3', description: 'Campanha — Parcela 2/2', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 6000, total: 6000 }], subtotal: 6000, tax: 0, total: 6000, status: 'paid', dueDate: '2025-05-20', paidAt: '2025-05-18', createdAt: '2025-04-20' },
  { id: 'inv5', photographerId: 'photo-1', clientId: 'c4', clientName: 'Luciana Ferreira', contractId: 'ct4', description: 'Newborn — Pagamento Único', items: [{ description: 'Valor total', quantity: 1, unitPrice: 1800, total: 1800 }], subtotal: 1800, tax: 0, total: 1800, status: 'paid', dueDate: '2025-04-28', paidAt: '2025-04-28', createdAt: '2025-04-20' },
  { id: 'inv6', photographerId: 'photo-1', clientId: 'c7', clientName: 'Marcos Andrade', shootId: 's5', description: 'Evento — Sinal', items: [{ description: 'Entrada 50%', quantity: 1, unitPrice: 1750, total: 1750 }], subtotal: 1750, tax: 0, total: 1750, status: 'paid', dueDate: '2025-04-20', paidAt: '2025-04-19', createdAt: '2025-04-10' },
  { id: 'inv7', photographerId: 'photo-1', clientId: 'c7', clientName: 'Marcos Andrade', shootId: 's5', description: 'Evento — Parcela 2/2', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 1750, total: 1750 }], subtotal: 1750, tax: 0, total: 1750, status: 'pending', dueDate: '2025-06-10', createdAt: '2025-05-10' },
  { id: 'inv8', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', contractId: 'ct2', description: 'Casamento — Sinal', items: [{ description: 'Entrada 30%', quantity: 1, unitPrice: 4500, total: 4500 }], subtotal: 4500, tax: 0, total: 4500, status: 'paid', dueDate: '2025-05-01', paidAt: '2025-04-30', createdAt: '2025-04-20' },
  { id: 'inv9', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', contractId: 'ct2', description: 'Casamento — Parcela 2/3', items: [{ description: 'Parcela 2', quantity: 1, unitPrice: 5250, total: 5250 }], subtotal: 5250, tax: 0, total: 5250, status: 'pending', dueDate: '2025-06-15', createdAt: '2025-05-15' },
  { id: 'inv10', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', contractId: 'ct1', description: 'Casamento — Parcela 3/3', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 4720, total: 4720 }], subtotal: 4720, tax: 0, total: 4720, status: 'pending', dueDate: '2025-06-30', createdAt: '2025-05-30' },
  { id: 'inv11', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', contractId: 'ct5', description: 'Lookbook — Pagamento', items: [{ description: 'Valor total', quantity: 1, unitPrice: 2500, total: 2500 }], subtotal: 2500, tax: 0, total: 2500, status: 'paid', dueDate: '2025-05-25', paidAt: '2025-05-24', createdAt: '2025-05-05' },
  { id: 'inv12', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', contractId: 'ct6', description: 'Cardápio — Sinal', items: [{ description: 'Entrada 50%', quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 1500, tax: 0, total: 1500, status: 'paid', dueDate: '2025-05-10', paidAt: '2025-05-08', createdAt: '2025-05-05' },
  { id: 'inv13', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', contractId: 'ct6', description: 'Cardápio — Final', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 1500, tax: 0, total: 1500, status: 'pending', dueDate: '2025-05-30', createdAt: '2025-05-20' },
  { id: 'inv14', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', contractId: 'ct7', description: 'Casamento — Sinal', items: [{ description: 'Entrada', quantity: 1, unitPrice: 5400, total: 5400 }], subtotal: 5400, tax: 0, total: 5400, status: 'paid', dueDate: '2024-08-15', paidAt: '2024-08-14', createdAt: '2024-08-01' },
  { id: 'inv15', photographerId: 'photo-2', clientId: 'c14', clientName: 'Empresa XYZ', shootId: 's15', description: 'Evento Corporativo', items: [{ description: 'Cobertura', quantity: 1, unitPrice: 8000, total: 8000 }], subtotal: 8000, tax: 0, total: 8000, status: 'paid', dueDate: '2025-04-30', paidAt: '2025-04-28', createdAt: '2025-04-25' },
  { id: 'inv16', photographerId: 'photo-3', clientId: 'c15', clientName: 'Amanda Costa', shootId: 's11', description: 'Newborn', items: [{ description: 'Valor total', quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 1500, tax: 0, total: 1500, status: 'paid', dueDate: '2025-04-20', paidAt: '2025-04-18', createdAt: '2025-04-15' },
  { id: 'inv17', photographerId: 'photo-1', clientId: 'c10', clientName: 'Felipe Gomes', shootId: 's14', description: 'Corporativo', items: [{ description: 'Retratos', quantity: 1, unitPrice: 2200, total: 2200 }], subtotal: 2200, tax: 0, total: 2200, status: 'paid', dueDate: '2025-04-10', paidAt: '2025-04-08', createdAt: '2025-04-01' },
  { id: 'inv18', photographerId: 'photo-1', clientId: 'c17', clientName: 'Isabella Martins', contractId: 'ct8', description: 'Fine Art', items: [{ description: 'Ensaio', quantity: 1, unitPrice: 1800, total: 1800 }], subtotal: 1800, tax: 0, total: 1800, status: 'paid', dueDate: '2025-05-20', paidAt: '2025-05-18', createdAt: '2025-05-12' },
  { id: 'inv19', photographerId: 'photo-3', clientId: 'c16', clientName: 'Família Rodrigues', contractId: 'ct9', description: 'Ensaio Família', items: [{ description: 'Valor total', quantity: 1, unitPrice: 1200, total: 1200 }], subtotal: 1200, tax: 0, total: 1200, status: 'pending', dueDate: '2025-06-10', createdAt: '2025-05-15' },
  { id: 'inv20', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', shootId: 's13', description: 'Gestante — Sinal', items: [{ description: 'Entrada 50%', quantity: 1, unitPrice: 900, total: 900 }], subtotal: 900, tax: 0, total: 900, status: 'pending', dueDate: '2025-05-28', createdAt: '2025-05-20' },
  { id: 'inv21', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', contractId: 'ct3', description: 'Campanha — Parcela 1/2', items: [{ description: 'Entrada', quantity: 1, unitPrice: 6000, total: 6000 }], subtotal: 6000, tax: 0, total: 6000, status: 'paid', dueDate: '2025-02-15', paidAt: '2025-02-14', createdAt: '2025-02-01' },
  { id: 'inv22', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', contractId: 'ct2', description: 'Casamento — Parcela 3/3', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 5250, total: 5250 }], subtotal: 5250, tax: 0, total: 5250, status: 'pending', dueDate: '2025-07-15', createdAt: '2025-06-15' },
  { id: 'inv23', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', contractId: 'ct7', description: 'Casamento — Parcela 2', items: [{ description: 'Parcela 2', quantity: 1, unitPrice: 6300, total: 6300 }], subtotal: 6300, tax: 0, total: 6300, status: 'pending', dueDate: '2025-07-01', createdAt: '2025-06-01' },
  { id: 'inv24', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', contractId: 'ct7', description: 'Casamento — Parcela Final', items: [{ description: 'Final', quantity: 1, unitPrice: 6300, total: 6300 }], subtotal: 6300, tax: 0, total: 6300, status: 'pending', dueDate: '2025-08-15', createdAt: '2025-07-15' },
  { id: 'inv25', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', shootId: 's13', description: 'Gestante — Final', items: [{ description: 'Parcela final', quantity: 1, unitPrice: 900, total: 900 }], subtotal: 900, tax: 0, total: 900, status: 'pending', dueDate: '2025-06-05', createdAt: '2025-05-25' },
];

// Tasks
export const mockTasks: Task[] = [
  { id: 'tk1', photographerId: 'photo-1', title: 'Finalizar edição Belle Mode', description: 'Edição de 120 fotos da campanha', status: 'in_progress', priority: 'high', dueDate: '2025-05-25', clientId: 'c3', shootId: 's3', createdAt: '2025-05-20' },
  { id: 'tk2', photographerId: 'photo-1', title: 'Enviar prévia Marcos', description: 'Selecionar 20 fotos para prévia', status: 'today', priority: 'high', dueDate: '2025-05-18', clientId: 'c7', shootId: 's5', createdAt: '2025-05-15' },
  { id: 'tk3', photographerId: 'photo-1', title: 'Preparar equipamento pré-wedding', status: 'today', priority: 'medium', dueDate: '2025-05-27', shootId: 's2', checklist: [{ item: 'Carregar baterias', done: false }, { item: 'Formatar cartões', done: false }, { item: 'Limpar lentes', done: false }], createdAt: '2025-05-20' },
  { id: 'tk4', photographerId: 'photo-1', title: 'Publicar post tendências', status: 'backlog', priority: 'low', dueDate: '2025-05-30', createdAt: '2025-05-10' },
  { id: 'tk5', photographerId: 'photo-1', title: 'Enviar contrato Tech Corp', status: 'waiting_client', priority: 'medium', dueDate: '2025-05-20', clientId: 'c5', createdAt: '2025-05-12' },
  { id: 'tk6', photographerId: 'photo-1', title: 'Backup fotos casamento Marina', status: 'done', priority: 'high', dueDate: '2025-05-16', shootId: 's1', completedAt: '2025-05-15', createdAt: '2025-05-10' },
  { id: 'tk7', photographerId: 'photo-1', title: 'Responder Juliana Santos', status: 'done', priority: 'medium', dueDate: '2025-05-15', clientId: 'c6', completedAt: '2025-05-14', createdAt: '2025-05-12' },
  { id: 'tk8', photographerId: 'photo-1', title: 'Agendar reunião Bianca', status: 'today', priority: 'low', dueDate: '2025-05-22', clientId: 'c8', createdAt: '2025-05-18' },
  { id: 'tk9', photographerId: 'photo-1', title: 'Criar galeria evento Marcos', status: 'in_progress', priority: 'high', dueDate: '2025-05-19', clientId: 'c7', shootId: 's5', galleryId: 'g5', createdAt: '2025-05-15' },
  { id: 'tk10', photographerId: 'photo-1', title: 'Revisar contrato Daniela', status: 'backlog', priority: 'medium', dueDate: '2025-06-01', clientId: 'c12', createdAt: '2025-05-20' },
  { id: 'tk11', photographerId: 'photo-1', title: 'Editar fotos Isabella', status: 'in_progress', priority: 'medium', dueDate: '2025-05-26', clientId: 'c17', shootId: 's9', createdAt: '2025-05-22' },
  { id: 'tk12', photographerId: 'photo-1', title: 'Enviar galeria cardápio', status: 'waiting_client', priority: 'medium', dueDate: '2025-05-28', clientId: 'c11', galleryId: 'g12', createdAt: '2025-05-20' },
  { id: 'tk13', photographerId: 'photo-2', title: 'Confirmar hotel Búzios', status: 'done', priority: 'high', dueDate: '2025-05-10', shootId: 's10', completedAt: '2025-05-08', createdAt: '2025-05-01' },
  { id: 'tk14', photographerId: 'photo-2', title: 'Enviar galeria noivado', status: 'done', priority: 'medium', galleryId: 'g8', completedAt: '2025-02-20', createdAt: '2025-02-15' },
  { id: 'tk15', photographerId: 'photo-3', title: 'Confirmar ensaio família', status: 'today', priority: 'medium', dueDate: '2025-06-10', clientId: 'c16', shootId: 's16', createdAt: '2025-05-20' },
  { id: 'tk16', photographerId: 'photo-1', title: 'Comprar props newborn', description: 'Manta nova e touquinha', status: 'backlog', priority: 'low', createdAt: '2025-05-18' },
  { id: 'tk17', photographerId: 'photo-1', title: 'Atualizar portfólio', description: 'Adicionar fotos da campanha Belle Mode', status: 'backlog', priority: 'medium', dueDate: '2025-06-05', createdAt: '2025-05-22' },
  { id: 'tk18', photographerId: 'photo-1', title: 'Cobrar parcela Marcos', status: 'today', priority: 'high', dueDate: '2025-06-08', clientId: 'c7', createdAt: '2025-06-01' },
  { id: 'tk19', photographerId: 'photo-1', title: 'Fazer backup mensal', status: 'backlog', priority: 'medium', dueDate: '2025-05-31', createdAt: '2025-05-25' },
  { id: 'tk20', photographerId: 'photo-1', title: 'Responder Dr. Roberto', status: 'today', priority: 'medium', dueDate: '2025-05-22', clientId: 'c18', createdAt: '2025-05-20' },
  { id: 'tk21', photographerId: 'photo-1', title: 'Preparar proposta gestante Marina', status: 'done', priority: 'medium', clientId: 'c1', completedAt: '2025-05-18', createdAt: '2025-05-15' },
  { id: 'tk22', photographerId: 'photo-1', title: 'Editar lookbook Carla', status: 'done', priority: 'high', clientId: 'c9', shootId: 's7', completedAt: '2025-05-28', createdAt: '2025-05-26' },
  { id: 'tk23', photographerId: 'photo-1', title: 'Enviar cobrança Bianca 2/3', status: 'today', priority: 'medium', dueDate: '2025-06-10', clientId: 'c8', createdAt: '2025-06-01' },
  { id: 'tk24', photographerId: 'photo-1', title: 'Visitar local casamento Marina', status: 'backlog', priority: 'medium', dueDate: '2025-06-01', shootId: 's1', createdAt: '2025-05-20' },
  { id: 'tk25', photographerId: 'photo-1', title: 'Follow-up proposta Tech Corp', status: 'waiting_client', priority: 'medium', dueDate: '2025-05-25', clientId: 'c5', createdAt: '2025-05-15' },
  { id: 'tk26', photographerId: 'photo-1', title: 'Criar preset para moda', status: 'backlog', priority: 'low', createdAt: '2025-05-10' },
  { id: 'tk27', photographerId: 'photo-1', title: 'Renovar seguro equipamento', status: 'backlog', priority: 'low', dueDate: '2025-06-30', createdAt: '2025-05-20' },
  { id: 'tk28', photographerId: 'photo-1', title: 'Solicitar depoimento Luciana', status: 'done', priority: 'low', clientId: 'c4', completedAt: '2025-05-10', createdAt: '2025-05-05' },
  { id: 'tk29', photographerId: 'photo-1', title: 'Confirmar briefing Rafael', status: 'waiting_client', priority: 'medium', clientId: 'c2', shootId: 's2', createdAt: '2025-05-20' },
  { id: 'tk30', photographerId: 'photo-1', title: 'Postar stories making of', status: 'backlog', priority: 'low', shootId: 's3', createdAt: '2025-05-22' },
];

// Messages
export const mockMessages: Message[] = [
  { id: 'm1', photographerId: 'photo-1', clientId: 'c6', clientName: 'Juliana Santos', clientEmail: 'ju.santos@email.com', type: 'inquiry', subject: 'Orçamento ensaio 15 anos', content: 'Olá! Gostaria de saber valores para ensaio de 15 anos da minha filha. Ela sonha com algo bem especial e vi seus trabalhos no Instagram.', isRead: true, replies: [{ id: 'r1', content: 'Olá Juliana! Obrigada pelo interesse. Vou enviar uma proposta detalhada por email. Sua filha tem alguma referência visual que gosta?', isFromPhotographer: true, createdAt: '2025-05-11' }], createdAt: '2025-05-10' },
  { id: 'm2', photographerId: 'photo-1', clientId: 'c1', clientName: 'Marina Oliveira', clientEmail: 'marina@email.com', type: 'gallery_comment', subject: 'Adorei a prévia!', content: 'Ana, as fotos estão MARAVILHOSAS! Mal posso esperar para ver todas. O João também amou!', isRead: true, galleryId: 'g1', replies: [], createdAt: '2025-01-22' },
  { id: 'm3', photographerId: 'photo-1', clientId: 'c5', clientName: 'Tech Corp Brasil', clientEmail: 'marketing@techcorp.com.br', type: 'inquiry', subject: 'Proposta fotografia corporativa', content: 'Boa tarde, recebemos sua proposta e gostaríamos de agendar uma reunião para discutir os detalhes.', isRead: false, replies: [], createdAt: '2025-05-14' },
  { id: 'm4', photographerId: 'photo-1', clientId: 'c3', clientName: 'Studio Belle Mode', clientEmail: 'contato@bellemode.com', type: 'approval', subject: 'Aprovação seleção campanha', content: 'Aprovamos a seleção de 50 fotos conforme enviado. Podem prosseguir com a edição final.', isRead: true, galleryId: 'g3', replies: [{ id: 'r2', content: 'Perfeito! Iniciaremos a edição final e entregaremos no prazo combinado.', isFromPhotographer: true, createdAt: '2025-05-24' }], createdAt: '2025-05-24' },
  { id: 'm5', photographerId: 'photo-1', clientId: 'c12', clientName: 'Daniela & Thiago', clientEmail: 'dani.thiago@email.com', type: 'inquiry', subject: 'Indicação Marina - Casamento 2026', content: 'Oi Ana! A Marina indicou seu trabalho e ficamos encantados. Gostaríamos de conversar sobre nosso casamento em março de 2026.', isRead: false, replies: [], createdAt: '2025-05-12' },
  { id: 'm6', photographerId: 'photo-1', clientId: 'c2', clientName: 'Rafael & Ana', clientEmail: 'rafael.ana@email.com', type: 'general', subject: 'Dúvida sobre o ensaio', content: 'Ana, podemos levar nosso cachorro para o pré-wedding? Ele faz parte da família!', isRead: true, replies: [{ id: 'r3', content: 'Claro que podem! Vai ficar lindo! Só combinem um petisco para ele colaborar nas fotos 😄', isFromPhotographer: true, createdAt: '2025-05-16' }], createdAt: '2025-05-15' },
  { id: 'm7', photographerId: 'photo-1', clientId: 'c18', clientName: 'Dr. Roberto Silva', clientEmail: 'dr.roberto@clinica.com', type: 'inquiry', subject: 'Fotos clínica médica', content: 'Preciso de fotos profissionais da clínica e da equipe para nosso novo site. Qual a disponibilidade?', isRead: false, replies: [], createdAt: '2025-05-08' },
  { id: 'm8', photographerId: 'photo-1', clientId: 'c4', clientName: 'Luciana Ferreira', clientEmail: 'lu.ferreira@email.com', type: 'general', subject: 'Depoimento', content: 'Ana, segue meu depoimento como prometido: "As fotos da Valentina ficaram perfeitas! A Ana tem um talento incrível para capturar a delicadeza dos bebês. Super recomendo!"', isRead: true, replies: [{ id: 'r4', content: 'Luciana, muito obrigada! Fico feliz que tenham gostado. Foi um prazer fotografar a Valentina! 💛', isFromPhotographer: true, createdAt: '2025-05-10' }], createdAt: '2025-05-09' },
  { id: 'm9', photographerId: 'photo-1', clientName: 'Visitante Site', clientEmail: 'contato@email.com', type: 'inquiry', subject: 'Orçamento casamento', content: 'Vi o portfólio e gostei muito do trabalho. Gostaria de orçamento para casamento em outubro/2025.', isRead: false, replies: [], createdAt: '2025-05-17' },
  { id: 'm10', photographerId: 'photo-2', clientId: 'c13', clientName: 'Patricia Lima', clientEmail: 'patricia@email.com', type: 'general', subject: 'Confirmação hotel', content: 'Marcos, confirmei a reserva no hotel para vocês nos dias 9 e 10 de agosto.', isRead: true, replies: [], createdAt: '2025-05-05' },
  { id: 'm11', photographerId: 'photo-1', clientId: 'c11', clientName: 'Restaurante Sabor & Arte', clientEmail: 'contato@saborarte.com', type: 'general', subject: 'Pratos adicionais', content: 'Ana, podemos adicionar 5 pratos de sobremesa na sessão? Criamos novos doces.', isRead: true, replies: [{ id: 'r5', content: 'Claro! Podemos incluir. Vou ajustar a proposta com os valores adicionais.', isFromPhotographer: true, createdAt: '2025-05-19' }], createdAt: '2025-05-18' },
  { id: 'm12', photographerId: 'photo-3', clientId: 'c16', clientName: 'Família Rodrigues', clientEmail: 'rodrigues.fam@email.com', type: 'general', subject: 'Confirmação ensaio', content: 'Julia, confirmamos o ensaio para dia 15/06. Seremos 5 pessoas.', isRead: true, replies: [], createdAt: '2025-05-15' },
  { id: 'm13', photographerId: 'photo-1', clientId: 'c9', clientName: 'Carla Moreira', clientEmail: 'carla.m@email.com', type: 'gallery_comment', subject: 'Fotos incríveis!', content: 'Ana, as fotos do lookbook ficaram incríveis! A marca adorou!', isRead: true, galleryId: 'g6', replies: [], createdAt: '2025-05-29' },
  { id: 'm14', photographerId: 'photo-1', clientId: 'c8', clientName: 'Bianca & Pedro', clientEmail: 'bianca.pedro@email.com', type: 'general', subject: 'Local da cerimônia', content: 'Ana, conseguimos a autorização da prefeitura para a cerimônia na praia! 🎉', isRead: true, replies: [{ id: 'r6', content: 'Que notícia maravilhosa! Vai ser um casamento dos sonhos!', isFromPhotographer: true, createdAt: '2025-05-20' }], createdAt: '2025-05-19' },
  { id: 'm15', photographerId: 'photo-1', clientId: 'c7', clientName: 'Marcos Andrade', clientEmail: 'marcos.a@email.com', type: 'general', subject: 'Fotos do evento', content: 'Ana, quando posso esperar as fotos? Minha família está ansiosa!', isRead: false, replies: [], createdAt: '2025-05-16' },
  { id: 'm16', photographerId: 'photo-1', clientId: 'c17', clientName: 'Isabella Martins', clientEmail: 'isa.martins@email.com', type: 'general', subject: 'Agradecimento', content: 'Ana, quero agradecer pelo ensaio. Foi uma experiência incrível! Mal posso esperar para ver as fotos.', isRead: true, replies: [], createdAt: '2025-05-23' },
];

// Automations
export const mockAutomations: Automation[] = [
  { id: 'a1', photographerId: 'photo-1', name: 'Lembrete pré-ensaio', trigger: 'before_shoot', triggerConfig: { daysBefore: 2 }, channel: 'email', subject: 'Seu ensaio está chegando!', message: 'Olá {cliente}! Faltam apenas 2 dias para o nosso ensaio. Lembre-se de descansar bem e hidratar a pele. Nos vemos em breve! 📸', isActive: true, lastTriggered: '2025-05-18', triggerCount: 24 },
  { id: 'a2', photographerId: 'photo-1', name: 'Agradecimento pós-ensaio', trigger: 'after_shoot', triggerConfig: { daysAfter: 1 }, channel: 'whatsapp', message: 'Oi {cliente}! Foi um prazer fotografar você ontem! Em breve você receberá a prévia das fotos. Qualquer dúvida, estou à disposição! 💛', isActive: true, lastTriggered: '2025-05-23', triggerCount: 45 },
  { id: 'a3', photographerId: 'photo-1', name: 'Aviso galeria pronta', trigger: 'gallery_ready', triggerConfig: {}, channel: 'email', subject: 'Suas fotos estão prontas!', message: 'Olá {cliente}! Sua galeria está pronta para visualização. Acesse o link abaixo e selecione suas favoritas.', isActive: true, lastTriggered: '2025-05-22', triggerCount: 32 },
  { id: 'a4', photographerId: 'photo-1', name: 'Lembrete pagamento', trigger: 'payment_due', triggerConfig: { daysBefore: 3 }, channel: 'email', subject: 'Lembrete de pagamento', message: 'Olá {cliente}! Este é um lembrete amigável de que o pagamento de {valor} vence em 3 dias.', isActive: true, lastTriggered: '2025-05-12', triggerCount: 18 },
  { id: 'a5', photographerId: 'photo-1', name: 'Feliz aniversário', trigger: 'birthday', triggerConfig: {}, channel: 'whatsapp', message: 'Feliz aniversário, {cliente}! 🎂 Que seu novo ano seja repleto de momentos especiais. Um abraço da equipe Studio Lumière!', isActive: true, lastTriggered: '2025-05-10', triggerCount: 12 },
  { id: 'a6', photographerId: 'photo-1', name: 'Follow-up proposta', trigger: 'proposal_followup', triggerConfig: { daysAfter: 5 }, channel: 'email', subject: 'Sobre nossa proposta', message: 'Olá {cliente}! Gostaria de saber se teve a oportunidade de analisar nossa proposta. Fico à disposição para esclarecer qualquer dúvida!', isActive: true, lastTriggered: '2025-05-15', triggerCount: 8 },
  { id: 'a7', photographerId: 'photo-1', name: 'Solicitação de depoimento', trigger: 'review_request', triggerConfig: { daysAfter: 7 }, channel: 'email', subject: 'Conte sua experiência', message: 'Olá {cliente}! Espero que esteja amando suas fotos! Poderia compartilhar sua experiência? Seu depoimento é muito importante para nós.', isActive: false, triggerCount: 5 },
  { id: 'a8', photographerId: 'photo-2', name: 'Confirmação de booking', trigger: 'before_shoot', triggerConfig: { daysBefore: 7 }, channel: 'email', subject: 'Confirmação do seu ensaio', message: 'Olá {cliente}! Confirmando nosso ensaio para {data}. Por favor, confirme sua presença respondendo este email.', isActive: true, triggerCount: 15 },
];

// Subscription Plans
export const mockPlans: SubscriptionPlan[] = [
  { id: 'plan-completo', name: 'Completo', description: 'Acesso total a todas as funcionalidades. Sem limites.', monthlyPrice: 37.9, yearlyPrice: 379, storageGB: 1000, maxClients: -1, maxGalleries: -1, features: ['Assistente IA', 'CRM ilimitado', 'Galerias ilimitadas', 'Propostas e contratos', 'Financeiro completo', 'Blog + portfólio', 'Automações', 'Área do cliente', 'Domínio personalizado', 'Emails reais', '1 TB de armazenamento', 'Suporte prioritário'], hasPortfolio: true, hasBlog: true, hasAutomations: true, hasClientPortal: true, hasPriority: true, isPopular: true, isActive: true },
];

// Notifications
export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'photo-1', type: 'success', title: 'Pagamento confirmado', message: 'Marina Oliveira confirmou pagamento de R$ 2.833', link: '/app/finance', isRead: false, createdAt: '2025-05-15T10:30:00' },
  { id: 'n2', userId: 'photo-1', type: 'info', title: 'Nova mensagem', message: 'Tech Corp Brasil respondeu sua proposta', link: '/app/inbox', isRead: false, createdAt: '2025-05-14T15:45:00' },
  { id: 'n3', userId: 'photo-1', type: 'warning', title: 'Proposta expirando', message: 'A proposta para Juliana Santos vence em 5 dias', link: '/app/proposals', isRead: true, createdAt: '2025-05-15T09:00:00' },
  { id: 'n4', userId: 'photo-1', type: 'success', title: 'Galeria visualizada', message: 'Studio Belle Mode visualizou a galeria da campanha', link: '/app/galleries/g3', isRead: true, createdAt: '2025-05-23T11:20:00' },
  { id: 'n5', userId: 'photo-1', type: 'info', title: 'Novo lead', message: 'Daniela & Thiago solicitaram orçamento', link: '/app/inbox', isRead: false, createdAt: '2025-05-12T14:30:00' },
];

// Support Tickets
export const mockTickets: SupportTicket[] = [
  { id: 't1', userId: 'photo-1', userName: 'Ana Luísa', userEmail: 'studio@lumiere.com', subject: 'Problema com upload de fotos', description: 'Não consigo fazer upload de fotos maiores que 10MB', priority: 'medium', status: 'resolved', messages: [{ id: 'tm1', content: 'O problema foi identificado e resolvido. Por favor, tente novamente.', isFromSupport: true, createdAt: '2025-05-10' }], createdAt: '2025-05-09', updatedAt: '2025-05-10', resolvedAt: '2025-05-10' },
  { id: 't2', userId: 'photo-2', userName: 'Marcos Vinicius', userEmail: 'marcos@studio.com', subject: 'Dúvida sobre integração Google Calendar', description: 'Como sincronizo minha agenda com o Google Calendar?', priority: 'low', status: 'open', messages: [], createdAt: '2025-05-14', updatedAt: '2025-05-14' },
  { id: 't3', userId: 'photo-3', userName: 'Julia Mendes', userEmail: 'julia@foto.com', subject: 'Erro ao gerar contrato', description: 'Quando tento gerar o PDF do contrato, aparece erro', priority: 'high', status: 'in_progress', messages: [{ id: 'tm2', content: 'Estamos investigando o problema. Pode nos enviar mais detalhes?', isFromSupport: true, createdAt: '2025-05-15' }], createdAt: '2025-05-15', updatedAt: '2025-05-15' },
  { id: 't4', userId: 'photo-1', userName: 'Ana Luísa', userEmail: 'studio@lumiere.com', subject: 'Solicitação de recurso', description: 'Seria possível adicionar marca d\'água personalizada nas galerias?', priority: 'low', status: 'closed', messages: [{ id: 'tm3', content: 'Esse recurso já está em nosso roadmap para Q3 2025!', isFromSupport: true, createdAt: '2025-04-20' }], createdAt: '2025-04-18', updatedAt: '2025-04-20', resolvedAt: '2025-04-20' },
];

// Integrations
export const mockIntegrations: Integration[] = [
  { id: 'int1', name: 'Google Calendar', description: 'Sincronize sua agenda com o Google Calendar', icon: 'calendar', category: 'calendar', isConnected: true, connectedAt: '2025-03-15' },
  { id: 'int2', name: 'WhatsApp Business', description: 'Envie mensagens automáticas pelo WhatsApp', icon: 'message-circle', category: 'messaging', isConnected: false },
  { id: 'int3', name: 'Instagram', description: 'Publique diretamente no Instagram', icon: 'instagram', category: 'social', isConnected: true, connectedAt: '2025-04-01' },
  { id: 'int4', name: 'Stripe', description: 'Receba pagamentos online', icon: 'credit-card', category: 'payment', isConnected: false },
  { id: 'int5', name: 'Mercado Pago', description: 'Pagamentos via Pix e cartão', icon: 'wallet', category: 'payment', isConnected: true, connectedAt: '2025-02-20' },
  { id: 'int6', name: 'Google Drive', description: 'Backup automático das fotos', icon: 'cloud', category: 'storage', isConnected: true, connectedAt: '2025-01-10' },
  { id: 'int7', name: 'Dropbox', description: 'Sincronize arquivos com Dropbox', icon: 'box', category: 'storage', isConnected: false },
  { id: 'int8', name: 'Lightroom', description: 'Importe presets e fotos', icon: 'aperture', category: 'automation', isConnected: false },
  { id: 'int9', name: 'Zapier', description: 'Conecte com mais de 5000 apps', icon: 'zap', category: 'automation', isConnected: false },
  { id: 'int10', name: 'Mailchimp', description: 'Email marketing automatizado', icon: 'mail', category: 'messaging', isConnected: false },
];

// Portfolio Settings
export const mockPortfolioSettings: PortfolioSettings = {
  photographerId: 'photo-1',
  headline: 'Capturando momentos que duram para sempre',
  bio: 'Fotógrafa apaixonada por contar histórias através de imagens. Especialista em casamentos e moda editorial, com mais de 8 anos de experiência transformando momentos em memórias eternas.',
  services: [
    { id: 'srv1', name: 'Casamentos', description: 'Cobertura completa do seu grande dia', startingPrice: 6500 },
    { id: 'srv2', name: 'Ensaios', description: 'Pré-wedding, gestante, família, 15 anos', startingPrice: 1200 },
    { id: 'srv3', name: 'Moda & Editorial', description: 'Campanhas, lookbooks, catálogos', startingPrice: 3500 },
    { id: 'srv4', name: 'Corporativo', description: 'Retratos executivos e eventos', startingPrice: 2000 },
  ],
  testimonials: [
    { id: 'test1', name: 'Marina Oliveira', role: 'Noiva', content: 'As fotos do nosso casamento ficaram perfeitas! A Ana capturou todos os momentos especiais com uma sensibilidade incrível.', rating: 5 },
    { id: 'test2', name: 'Carla Moreira', role: 'Modelo', content: 'Trabalho com a Ana há anos. Seu olhar para moda é único e sempre entrega além das expectativas.', rating: 5 },
    { id: 'test3', name: 'Luciana Ferreira', role: 'Mãe da Valentina', content: 'As fotos da Valentina ficaram perfeitas! A Ana tem um talento incrível para capturar a delicadeza dos bebês.', rating: 5 },
  ],
  sections: [
    { id: 'sec1', name: 'Casamentos', photoIds: ['photo-1', 'photo-5', 'photo-9', 'photo-13', 'photo-17'], order: 1 },
    { id: 'sec2', name: 'Moda', photoIds: ['photo-33', 'photo-37', 'photo-41', 'photo-45'], order: 2 },
    { id: 'sec3', name: 'Retratos', photoIds: ['photo-49', 'photo-53', 'photo-57', 'photo-61'], order: 3 },
  ],
  layout: 'masonry',
  accentColor: '#c9a96e',
  showBlog: true,
  showContact: true,
  contactEmail: 'contato@studiolumiere.com.br',
  socialLinks: {
    instagram: 'https://instagram.com/studiolumiere',
    facebook: 'https://facebook.com/studiolumiere',
  },
};

// Helper functions for status colors and labels
export const STATUS_COLORS: Record<string, string> = {
  lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  negotiation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  confirmed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  photographed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  editing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  recurring: 'bg-gold/20 text-gold border-gold/30',
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  draft: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  selection_received: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  signed: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-gold/20 text-gold border-gold/30',
  declined: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  refunded: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  backlog: 'bg-noir-600/40 text-noir-400 border-noir-600/30',
  today: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_client: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  trial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const STATUS_LABELS: Record<string, string> = {
  lead: 'Novo Lead',
  negotiation: 'Em Negociação',
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  photographed: 'Fotografado',
  editing: 'Em Edição',
  delivered: 'Entregue',
  recurring: 'Recorrente',
  paid: 'Pago',
  draft: 'Rascunho',
  sent: 'Enviado',
  viewed: 'Visualizado',
  selection_received: 'Seleção Recebida',
  accepted: 'Aceito',
  signed: 'Assinado',
  completed: 'Concluído',
  declined: 'Recusado',
  expired: 'Expirado',
  pending: 'Pendente',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
  backlog: 'Backlog',
  today: 'Hoje',
  waiting_client: 'Aguardando Cliente',
  done: 'Concluído',
  active: 'Ativo',
  trial: 'Trial',
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-noir-600/40 text-noir-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};
