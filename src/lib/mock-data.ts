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
  "https://images.pexels.com/photos/17386258/pexels-photo-17386258.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/20249614/pexels-photo-20249614.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/33681519/pexels-photo-33681519.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.pexels.com/photos/34206662/pexels-photo-34206662.png?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600",
];

export type ClientStatus = "lead" | "negotiation" | "scheduled" | "photographed" | "editing" | "delivered" | "recurring";
export type ShootStatus = "lead" | "confirmed" | "photographed" | "editing" | "delivered" | "paid";
export type GalleryStatus = "draft" | "sent" | "viewed" | "selection_received" | "delivered";
export type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "expired";
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

export const STATUS_COLORS: Record<string, string> = {
  lead: "bg-blue-500/20 text-blue-400",
  negotiation: "bg-yellow-500/20 text-yellow-400",
  scheduled: "bg-purple-500/20 text-purple-400",
  confirmed: "bg-purple-500/20 text-purple-400",
  photographed: "bg-cyan-500/20 text-cyan-400",
  editing: "bg-orange-500/20 text-orange-400",
  delivered: "bg-green-500/20 text-green-400",
  recurring: "bg-gold/20 text-gold",
  paid: "bg-emerald-500/20 text-emerald-400",
  draft: "bg-noir-600/40 text-noir-400",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-cyan-500/20 text-cyan-400",
  selection_received: "bg-purple-500/20 text-purple-400",
  accepted: "bg-green-500/20 text-green-400",
  declined: "bg-red-500/20 text-red-400",
  expired: "bg-noir-600/40 text-noir-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  overdue: "bg-red-500/20 text-red-400",
  cancelled: "bg-noir-600/40 text-noir-400",
};

export const STATUS_LABELS: Record<string, string> = {
  lead: "Novo Lead",
  negotiation: "Em Negociação",
  scheduled: "Agendado",
  confirmed: "Confirmado",
  photographed: "Fotografado",
  editing: "Em Edição",
  delivered: "Entregue",
  recurring: "Recorrente",
  paid: "Pago",
  draft: "Rascunho",
  sent: "Enviada",
  viewed: "Visualizada",
  selection_received: "Seleção Recebida",
  accepted: "Aceita",
  declined: "Recusada",
  expired: "Expirada",
  pending: "Pendente",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  type: string;
  city: string;
  notes: string;
  avatar: string;
  createdAt: string;
  shootCount: number;
}

export const mockClients: Client[] = [
  { id: "c1", name: "Marina Oliveira", email: "marina@email.com", phone: "(11) 98765-4321", status: "recurring", type: "Casamento", city: "São Paulo", notes: "Cliente VIP, indica bastante", avatar: "MO", createdAt: "2024-01-15", shootCount: 4 },
  { id: "c2", name: "Rafael & Ana", email: "rafael.ana@email.com", phone: "(21) 91234-5678", status: "scheduled", type: "Casamento", city: "Rio de Janeiro", notes: "Casamento em junho na fazenda", avatar: "RA", createdAt: "2024-03-10", shootCount: 1 },
  { id: "c3", name: "Studio Belle Mode", email: "contato@bellemode.com", phone: "(11) 95555-1234", status: "editing", type: "Moda", city: "São Paulo", notes: "Campanha verão 2025", avatar: "SB", createdAt: "2024-02-20", shootCount: 3 },
  { id: "c4", name: "Luciana Ferreira", email: "lu.ferreira@email.com", phone: "(31) 97777-8888", status: "delivered", type: "Newborn", city: "Belo Horizonte", notes: "Bebê Valentina, 12 dias", avatar: "LF", createdAt: "2024-04-05", shootCount: 2 },
  { id: "c5", name: "Tech Corp Brasil", email: "marketing@techcorp.com.br", phone: "(11) 93333-2222", status: "negotiation", type: "Corporativo", city: "São Paulo", notes: "Fotos para relatório anual e LinkedIn dos diretores", avatar: "TC", createdAt: "2024-05-01", shootCount: 0 },
  { id: "c6", name: "Juliana Santos", email: "ju.santos@email.com", phone: "(41) 96666-3333", status: "lead", type: "Retrato", city: "Curitiba", notes: "Quer ensaio de 15 anos da filha", avatar: "JS", createdAt: "2024-05-10", shootCount: 0 },
  { id: "c7", name: "Marcos Andrade", email: "marcos.a@email.com", phone: "(11) 94444-7777", status: "photographed", type: "Evento", city: "São Paulo", notes: "Aniversário de 50 anos, 200 convidados", avatar: "MA", createdAt: "2024-03-25", shootCount: 1 },
  { id: "c8", name: "Bianca & Pedro", email: "bianca.pedro@email.com", phone: "(21) 92222-6666", status: "scheduled", type: "Casamento", city: "Niterói", notes: "Casamento na praia, pôr do sol", avatar: "BP", createdAt: "2024-04-20", shootCount: 1 },
];

export interface Shoot {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: ShootStatus;
  value: number;
  notes: string;
  checklist: { item: string; done: boolean }[];
}

export const mockShoots: Shoot[] = [
  { id: "s1", name: "Casamento Marina & João", clientId: "c1", clientName: "Marina Oliveira", type: "Casamento", date: "2025-06-15", time: "15:00", location: "Fazenda Santa Maria, Campinas", status: "confirmed", value: 8500, notes: "Cerimônia ao ar livre + festa", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: true }, { item: "Briefing preenchido", done: true }, { item: "Locação definida", done: true }, { item: "Equipamentos preparados", done: false }, { item: "Backup feito", done: false }] },
  { id: "s2", name: "Ensaio Pré-Wedding Rafael & Ana", clientId: "c2", clientName: "Rafael & Ana", type: "Pré-Wedding", date: "2025-05-28", time: "16:30", location: "Jardim Botânico, Rio de Janeiro", status: "confirmed", value: 2800, notes: "Estilo romântico e natural", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: true }, { item: "Briefing preenchido", done: false }] },
  { id: "s3", name: "Campanha Belle Mode Verão", clientId: "c3", clientName: "Studio Belle Mode", type: "Moda", date: "2025-05-20", time: "09:00", location: "Estúdio Central, SP", status: "editing", value: 12000, notes: "15 looks, 3 modelos, 2 cenários", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: true }, { item: "Briefing preenchido", done: true }, { item: "Locação definida", done: true }, { item: "Equipamentos preparados", done: true }, { item: "Backup feito", done: true }, { item: "Prévia enviada", done: true }, { item: "Edição finalizada", done: false }] },
  { id: "s4", name: "Newborn Valentina", clientId: "c4", clientName: "Luciana Ferreira", type: "Newborn", date: "2025-04-28", time: "10:00", location: "Residência da cliente, BH", status: "delivered", value: 1800, notes: "Estilo lifestyle, cores neutras", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: true }, { item: "Briefing preenchido", done: true }, { item: "Backup feito", done: true }, { item: "Edição finalizada", done: true }, { item: "Entrega enviada", done: true }] },
  { id: "s5", name: "Evento 50 Anos Marcos", clientId: "c7", clientName: "Marcos Andrade", type: "Evento", date: "2025-05-10", time: "19:00", location: "Buffet Estrela, São Paulo", status: "photographed", value: 3500, notes: "200 convidados, cobertura completa", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: true }, { item: "Backup feito", done: true }, { item: "Prévia enviada", done: false }] },
  { id: "s6", name: "Casamento Bianca & Pedro", clientId: "c8", clientName: "Bianca & Pedro", type: "Casamento", date: "2025-07-20", time: "16:00", location: "Praia de Camboinhas, Niterói", status: "confirmed", value: 9200, notes: "Cerimônia na praia ao pôr do sol", checklist: [{ item: "Contrato enviado", done: true }, { item: "Pagamento confirmado", done: false }, { item: "Briefing preenchido", done: false }] },
];

export interface Gallery {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  coverUrl: string;
  photoCount: number;
  status: GalleryStatus;
  createdAt: string;
  expiresAt: string;
  password: string;
  allowDownload: boolean;
  allowFavorites: boolean;
  message: string;
}

export const mockGalleries: Gallery[] = [
  { id: "g1", name: "Casamento Marina & João — Prévia", clientId: "c1", clientName: "Marina Oliveira", coverUrl: PHOTO_URLS[0], photoCount: 45, status: "selection_received", createdAt: "2024-12-20", expiresAt: "2025-03-20", password: "marina2024", allowDownload: false, allowFavorites: true, message: "Marina, aqui está a prévia do seu grande dia! Selecione suas favoritas 💛" },
  { id: "g2", name: "Ensaio Pré-Wedding Rafael & Ana", clientId: "c2", clientName: "Rafael & Ana", coverUrl: PHOTO_URLS[2], photoCount: 32, status: "sent", createdAt: "2025-03-15", expiresAt: "2025-06-15", password: "rafaelana", allowDownload: true, allowFavorites: true, message: "Olha que lindos vocês ficaram! Escolham as melhores para o álbum." },
  { id: "g3", name: "Campanha Belle Mode — Seleção", clientId: "c3", clientName: "Studio Belle Mode", coverUrl: PHOTO_URLS[8], photoCount: 120, status: "viewed", createdAt: "2025-05-22", expiresAt: "2025-08-22", password: "bellemode25", allowDownload: false, allowFavorites: true, message: "Confira as imagens da campanha de verão. Aguardo a seleção final!" },
  { id: "g4", name: "Newborn Valentina — Entrega Final", clientId: "c4", clientName: "Luciana Ferreira", coverUrl: PHOTO_URLS[6], photoCount: 28, status: "delivered", createdAt: "2025-05-05", expiresAt: "2025-11-05", password: "valentina", allowDownload: true, allowFavorites: false, message: "Luciana, aqui estão todas as fotos da Valentina! Pode baixar à vontade 🥰" },
  { id: "g5", name: "Evento 50 Anos — Preview", clientId: "c7", clientName: "Marcos Andrade", coverUrl: PHOTO_URLS[4], photoCount: 85, status: "draft", createdAt: "2025-05-12", expiresAt: "2025-08-12", password: "marcos50", allowDownload: false, allowFavorites: false, message: "Marcos, preparando a galeria do seu aniversário!" },
];

export interface Photo {
  id: string;
  url: string;
  name: string;
  clientName: string;
  album: string;
  date: string;
  tags: string[];
  status: string;
}

export const mockPhotos: Photo[] = PHOTO_URLS.map((url, i) => ({
  id: `p${i + 1}`,
  url,
  name: `IMG_${(2024 + i).toString().padStart(4, "0")}.jpg`,
  clientName: mockClients[i % mockClients.length].name,
  album: mockGalleries[i % mockGalleries.length].name,
  date: `2025-0${(i % 5) + 1}-${((i * 3) % 28 + 1).toString().padStart(2, "0")}`,
  tags: [["selecionada", "editada"], ["editada", "entregue"], ["portfólio", "capa"], ["editada"], ["selecionada", "portfólio"]][i % 5],
  status: ["editada", "selecionada", "entregue", "portfólio", "editada"][i % 5],
}));

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
  content: string;
}

export const mockBlogPosts: BlogPost[] = [
  { id: "b1", title: "5 Dicas para um Ensaio de Casamento Inesquecível", slug: "dicas-ensaio-casamento", excerpt: "Como preparar seus clientes para o grande dia e capturar momentos que duram para sempre.", coverUrl: PHOTO_URLS[0], category: "Casamentos", tags: ["casamento", "dicas", "noivas"], status: "published", publishedAt: "2025-04-10", content: "O casamento é um dos momentos mais especiais na vida de um casal. Como fotógrafo, seu papel vai além de simplesmente clicar o botão — você está ali para contar uma história.\n\n## 1. Conheça o casal\nAntes do grande dia, marque uma reunião ou videochamada. Entenda a dinâmica do casal, suas preferências e o que faz os olhos deles brilharem.\n\n## 2. Visite o local antes\nFazer uma visita prévia ao local da cerimônia e da festa permite planejar os melhores ângulos e entender a iluminação natural.\n\n## 3. Crie uma shot list\nConverse com os noivos sobre as fotos que não podem faltar. Família, padrinhos, detalhes da decoração — tudo precisa estar na sua lista.\n\n## 4. Tenha backup de tudo\nDois corpos de câmera, baterias extras, cartões de memória reserva. Em um casamento, não há segunda chance.\n\n## 5. Capture as emoções\nAs melhores fotos de casamento são aquelas que transmitem emoção genuína. Esteja atento aos olhares, sorrisos e lágrimas." },
  { id: "b2", title: "Making Of: Campanha Editorial de Moda", slug: "making-of-campanha-moda", excerpt: "Bastidores de uma produção fotográfica profissional para uma marca de moda.", coverUrl: PHOTO_URLS[8], category: "Bastidores", tags: ["moda", "bastidores", "editorial"], status: "published", publishedAt: "2025-03-22", content: "Neste post compartilho os bastidores de uma das produções mais desafiadoras e recompensadoras que já fiz.\n\n## O Briefing\nA marca queria algo que remetesse à elegância crua — texturas, sombras e uma paleta restrita.\n\n## A Equipe\nTrabalhar com profissionais de alto nível faz toda a diferença. Tivemos maquiadora, stylist, assistente de iluminação e produção.\n\n## O Resultado\nMais de 500 cliques em 8 horas de trabalho, resultando em 25 imagens finais para a campanha." },
  { id: "b3", title: "Como Cobrar Pelo Seu Trabalho: Guia de Precificação", slug: "guia-precificacao-fotografia", excerpt: "Um guia prático para fotógrafos que querem precificar seus serviços de forma justa e sustentável.", coverUrl: PHOTO_URLS[14], category: "Dicas para Clientes", tags: ["negócio", "precificação", "dicas"], status: "published", publishedAt: "2025-02-15", content: "Precificar fotografia é uma das maiores dúvidas de fotógrafos em qualquer estágio da carreira.\n\n## Custos Fixos e Variáveis\nAntes de definir um preço, entenda todos os seus custos: equipamento, software, deslocamento, tempo de edição, impostos.\n\n## Valor Percebido\nSeu preço deve refletir não apenas os custos, mas o valor que o cliente percebe no seu trabalho.\n\n## Pacotes\nOferecer pacotes facilita a decisão do cliente e permite criar opções para diferentes orçamentos." },
  { id: "b4", title: "Tendências de Fotografia para 2025", slug: "tendencias-fotografia-2025", excerpt: "As principais tendências visuais que vão dominar a fotografia profissional neste ano.", coverUrl: PHOTO_URLS[10], category: "Tendências", tags: ["tendências", "2025", "inspiração"], status: "draft", publishedAt: "", content: "O mundo da fotografia está em constante evolução. Veja o que esperar para 2025.\n\n## Flash Criativo\nO uso de flash em situações inesperadas para criar contraste e drama.\n\n## Autenticidade\nFotos cada vez mais naturais e espontâneas, fugindo do excesso de pose.\n\n## Film Look\nA estética de filme fotográfico continua forte, com grãos e cores suaves." },
];

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  package: string;
  value: number;
  validity: string;
  status: ProposalStatus;
  items: string[];
  createdAt: string;
}

export const mockProposals: Proposal[] = [
  { id: "pr1", clientId: "c2", clientName: "Rafael & Ana", service: "Casamento Completo", package: "Premium", value: 12500, validity: "2025-06-30", status: "accepted", items: ["Cobertura completa (12h)", "Ensaio pré-wedding", "Álbum 30x30 com 60 páginas", "300 fotos editadas", "Vídeo highlights 3min", "Pendrive personalizado"], createdAt: "2025-03-01" },
  { id: "pr2", clientId: "c5", clientName: "Tech Corp Brasil", service: "Fotografia Corporativa", package: "Business", value: 6800, validity: "2025-06-15", status: "sent", items: ["Retratos de 10 executivos", "Fotos do escritório", "20 fotos editadas por pessoa", "Tratamento profissional", "Entrega em alta resolução"], createdAt: "2025-05-05" },
  { id: "pr3", clientId: "c6", clientName: "Juliana Santos", service: "Ensaio 15 Anos", package: "Classic", value: 2200, validity: "2025-06-20", status: "sent", items: ["Ensaio em locação externa (2h)", "50 fotos editadas", "10 fotos artísticas especiais", "Galeria online privada", "Entrega digital"], createdAt: "2025-05-12" },
  { id: "pr4", clientId: "c8", clientName: "Bianca & Pedro", service: "Casamento na Praia", package: "Destination", value: 15000, validity: "2025-07-01", status: "accepted", items: ["Cobertura completa (14h)", "Ensaio trash the dress", "Álbum fine art 35x35", "500 fotos editadas", "Making of noiva", "Drone"], createdAt: "2025-04-15" },
  { id: "pr5", clientId: "c1", clientName: "Marina Oliveira", service: "Ensaio Família", package: "Family", value: 1500, validity: "2025-04-30", status: "expired", items: ["Ensaio em estúdio (1h)", "30 fotos editadas", "5 fotos impressas 20x30", "Galeria online"], createdAt: "2025-03-20" },
];

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  proposalId: string;
  service: string;
  value: number;
  status: "draft" | "sent" | "signed" | "completed";
  signedAt: string;
  createdAt: string;
}

export const mockContracts: Contract[] = [
  { id: "ct1", clientId: "c2", clientName: "Rafael & Ana", proposalId: "pr1", service: "Casamento Completo Premium", value: 12500, status: "signed", signedAt: "2025-03-10", createdAt: "2025-03-05" },
  { id: "ct2", clientId: "c8", clientName: "Bianca & Pedro", proposalId: "pr4", service: "Casamento na Praia Destination", value: 15000, status: "signed", signedAt: "2025-04-20", createdAt: "2025-04-18" },
  { id: "ct3", clientId: "c3", clientName: "Studio Belle Mode", proposalId: "", service: "Campanha Moda Verão 2025", value: 12000, status: "completed", signedAt: "2025-02-01", createdAt: "2025-01-25" },
  { id: "ct4", clientId: "c4", clientName: "Luciana Ferreira", proposalId: "", service: "Ensaio Newborn", value: 1800, status: "completed", signedAt: "2025-04-20", createdAt: "2025-04-18" },
];

export interface Transaction {
  id: string;
  clientName: string;
  description: string;
  value: number;
  date: string;
  status: PaymentStatus;
  type: string;
}

export const mockTransactions: Transaction[] = [
  { id: "t1", clientName: "Marina Oliveira", description: "Casamento — Parcela 3/3", value: 2833, date: "2025-05-15", status: "paid", type: "Casamento" },
  { id: "t2", clientName: "Rafael & Ana", description: "Casamento — Sinal", value: 4000, date: "2025-03-15", status: "paid", type: "Casamento" },
  { id: "t3", clientName: "Rafael & Ana", description: "Casamento — Parcela 2/3", value: 4250, date: "2025-05-01", status: "paid", type: "Casamento" },
  { id: "t4", clientName: "Studio Belle Mode", description: "Campanha Verão — Parcela 2/2", value: 6000, date: "2025-05-20", status: "paid", type: "Moda" },
  { id: "t5", clientName: "Luciana Ferreira", description: "Ensaio Newborn — Pagamento Único", value: 1800, date: "2025-04-28", status: "paid", type: "Newborn" },
  { id: "t6", clientName: "Marcos Andrade", description: "Cobertura Evento — Sinal", value: 1750, date: "2025-04-20", status: "paid", type: "Evento" },
  { id: "t7", clientName: "Marcos Andrade", description: "Cobertura Evento — Parcela 2/2", value: 1750, date: "2025-06-10", status: "pending", type: "Evento" },
  { id: "t8", clientName: "Bianca & Pedro", description: "Casamento — Sinal", value: 5000, date: "2025-05-01", status: "paid", type: "Casamento" },
  { id: "t9", clientName: "Bianca & Pedro", description: "Casamento — Parcela 2/3", value: 5000, date: "2025-06-15", status: "pending", type: "Casamento" },
  { id: "t10", clientName: "Rafael & Ana", description: "Casamento — Parcela 3/3", value: 4250, date: "2025-06-30", status: "pending", type: "Casamento" },
];

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  category: string;
}

export const mockTasks: Task[] = [
  { id: "tk1", title: "Finalizar edição — Belle Mode", dueDate: "2025-05-25", priority: "high", done: false, category: "Edição" },
  { id: "tk2", title: "Enviar prévia — Marcos Andrade", dueDate: "2025-05-18", priority: "high", done: false, category: "Entrega" },
  { id: "tk3", title: "Preparar equipamento — Rafael & Ana", dueDate: "2025-05-27", priority: "medium", done: false, category: "Preparação" },
  { id: "tk4", title: "Publicar post do blog — Tendências 2025", dueDate: "2025-05-30", priority: "low", done: false, category: "Blog" },
  { id: "tk5", title: "Enviar contrato — Tech Corp", dueDate: "2025-05-20", priority: "medium", done: false, category: "Comercial" },
  { id: "tk6", title: "Backup fotos — Casamento Marina", dueDate: "2025-05-16", priority: "high", done: true, category: "Backup" },
  { id: "tk7", title: "Responder orçamento — Juliana Santos", dueDate: "2025-05-15", priority: "medium", done: true, category: "Comercial" },
  { id: "tk8", title: "Agendar reunião — Bianca & Pedro", dueDate: "2025-05-22", priority: "low", done: false, category: "Reunião" },
];

export const revenueData = [
  { month: "Jan", value: 8500 },
  { month: "Fev", value: 12000 },
  { month: "Mar", value: 9800 },
  { month: "Abr", value: 15600 },
  { month: "Mai", value: 21333 },
  { month: "Jun", value: 14500 },
];

export const FEATURES = [
  { icon: "Camera", title: "Portfólio Público", desc: "Mostre seu melhor trabalho em uma vitrine visual impecável." },
  { icon: "PenTool", title: "Blog Profissional", desc: "Publique conteúdo que atrai e encanta seus clientes." },
  { icon: "Calendar", title: "Agenda de Ensaios", desc: "Organize sessões, prazos e entregas em um calendário visual." },
  { icon: "Users", title: "CRM de Clientes", desc: "Gerencie leads, clientes e todo o relacionamento." },
  { icon: "Image", title: "Galerias Privadas", desc: "Entregue fotos com elegância e controle total." },
  { icon: "Upload", title: "Organização de Fotos", desc: "Biblioteca visual com tags, filtros e coleções." },
  { icon: "FileText", title: "Contratos e Propostas", desc: "Envie propostas profissionais e feche contratos digitais." },
  { icon: "DollarSign", title: "Controle Financeiro", desc: "Acompanhe receita, pagamentos e faturamento." },
  { icon: "User", title: "Área do Cliente", desc: "Espaço exclusivo para clientes acessarem suas galerias." },
  { icon: "Send", title: "Entregas e Seleção", desc: "Permita que clientes selecionem favoritas e recebam a entrega final." },
];

export const PLANS = [
  { name: "Starter", price: "R$ 49", period: "/mês", desc: "Para fotógrafos iniciando sua jornada profissional.", features: ["1 portfólio público", "Até 5 galerias", "CRM com até 50 clientes", "Blog com até 10 posts", "Agenda básica", "Suporte por email"], highlight: false },
  { name: "Pro", price: "R$ 99", period: "/mês", desc: "Para fotógrafos que querem crescer e profissionalizar.", features: ["Portfólio ilimitado", "Galerias ilimitadas", "CRM completo", "Blog ilimitado", "Propostas e contratos", "Controle financeiro", "Domínio personalizado", "Suporte prioritário"], highlight: true },
  { name: "Studio", price: "R$ 179", period: "/mês", desc: "Para estúdios e fotógrafos de alto volume.", features: ["Tudo do Pro", "Múltiplos fotógrafos", "Marca branca", "API de integração", "Relatórios avançados", "Backup automático", "Onboarding dedicado", "Suporte premium 24/7"], highlight: false },
];

export const TESTIMONIALS = [
  { name: "Carolina Mendes", role: "Fotógrafa de Casamentos", text: "O NoirFrame transformou minha operação. Antes eu perdia horas organizando galerias e contratos. Agora tudo está em um lugar só, com uma apresentação que meus clientes adoram.", avatar: "CM" },
  { name: "André Bastos", role: "Fotógrafo de Moda", text: "A estética do sistema é exatamente o que eu precisava. Meus clientes abrem a galeria e já sentem que estão recebendo algo premium. Isso faz toda a diferença.", avatar: "AB" },
  { name: "Fernanda Lima", role: "Fotógrafa Newborn", text: "O CRM e a agenda me ajudam a não perder nenhum lead. Desde que comecei a usar o NoirFrame, minha taxa de conversão subiu 40%.", avatar: "FL" },
];

export const FAQ_ITEMS = [
  { q: "Preciso saber programar para usar o NoirFrame?", a: "De forma alguma. O NoirFrame foi criado para ser intuitivo e visual. Você configura seu portfólio, blog e galerias sem escrever uma linha de código." },
  { q: "Posso usar meu próprio domínio?", a: "Sim! Nos planos Pro e Studio você pode conectar seu domínio personalizado para que seu portfólio e blog tenham o endereço da sua marca." },
  { q: "Como funciona a entrega de fotos para o cliente?", a: "Você cria uma galeria privada, faz o upload das fotos e envia um link com senha para o cliente. Ele pode visualizar, favoritar e, se permitido, baixar as imagens." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multa e sem burocracia. Você pode cancelar sua assinatura a qualquer momento pelo painel de configurações." },
  { q: "O NoirFrame funciona no celular?", a: "Sim! Todo o sistema é responsivo e funciona perfeitamente em smartphones e tablets, tanto para você quanto para seus clientes." },
  { q: "Meus dados estão seguros?", a: "Absolutamente. Utilizamos criptografia de ponta a ponta, backups automáticos e servidores seguros para proteger todas as suas informações e imagens." },
];
