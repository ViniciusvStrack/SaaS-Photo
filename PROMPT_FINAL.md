# PROMPT DEFINITIVO — Finalização Total do NoirFrame

## Contexto do Projeto

O NoirFrame é um SaaS premium all-black para fotógrafos profissionais. Ele já possui:

**Frontend (40 páginas):**
- Landing page, demo, login, register, forgot-password
- Blog público, blog/[slug], portfolio/demo, gallery/demo
- Admin: dashboard, users, studios, plans, billing, support, settings
- Fotógrafo: dashboard, assistant, calendar, clients, shoots, galleries, photos, blog, proposals, contracts, finance, tasks, inbox, analytics, security, automations, integrations, settings, portfolio
- Cliente: dashboard, galleries, contracts, proposals

**Backend (11 API routes):**
- POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
- GET/POST /api/clients, GET/PATCH/DELETE /api/clients/[id]
- GET/POST /api/shoots
- GET/POST /api/tasks, PATCH/DELETE /api/tasks/[id]
- GET /api/finance
- POST /api/assistant/parse
- GET /api/health

**Banco de dados (20 tabelas PostgreSQL via Drizzle ORM):**
users, studios, clients, shoots, shoot_checklist, galleries, photos, photo_favorites, blog_posts, proposals, proposal_items, contracts, invoices, tasks, messages, message_replies, automations, notifications, audit_logs

**Infraestrutura:**
- Next.js 16 App Router com TypeScript
- Tailwind CSS 4, Framer Motion
- Drizzle ORM + PostgreSQL
- JWT auth (jose) + bcryptjs
- Zod validação
- NLP parser local (15 intenções, 11 entidades)
- PWA manifest + ícones
- Seed com 86+ registros

**Credenciais seed:**
- admin / admin (role admin)
- studio / studio (role photographer, studio "Studio Lumière")
- cliente / cliente (role client, cliente "Marina Oliveira")

**Problemas identificados que PRECISAM ser resolvidos:**

1. DADOS DESCONECTADOS: As páginas do fotógrafo (clients, shoots, galleries, photos, blog, proposals, contracts, finance, calendar, portfolio) ainda importam dados do arquivo `src/data/mock-data.ts` DIRETAMENTE em vez de usar a API real. Apenas dashboard, assistant, tasks e inbox usam o DataContext (que por sua vez usa localStorage). Nenhuma página frontend faz fetch para as API routes reais do backend (`/api/clients`, `/api/shoots`, etc.). Os dados que aparecem nas telas vêm do mock estático importado, NÃO do banco de dados PostgreSQL.

2. API INCOMPLETA: Faltam API routes para: galleries (CRUD), photos (CRUD), blog-posts (CRUD), proposals (CRUD + accept/decline), contracts (CRUD + sign), invoices (create + mark paid), messages (list + reply + mark read), automations (list + toggle), notifications (list + mark read), admin endpoints (metrics, users list), analytics, security checklist.

3. FRONTEND NÃO CONECTADO: O `DataContext.tsx` faz operações em localStorage com dados mockados. As páginas do fotógrafo que usam `useData()` (dashboard, tasks, inbox, assistant, automations, analytics) operam em estado local do navegador, não no banco. As demais páginas (clients, shoots, galleries, photos, blog, proposals, contracts, finance, calendar, portfolio) importam diretamente de `src/data/mock-data.ts` e nem sequer usam o DataContext — são completamente estáticas.

4. FORMULÁRIOS SEM AÇÃO REAL: Os botões "Novo cliente", "Novo ensaio", "Nova galeria", "Novo post", "Nova proposta", "Novo contrato" nas páginas de listagem não abrem formulários de criação funcionais. São botões visuais sem modal ou formulário conectado.

5. ADMIN USANDO MOCKS DIRETOS: Todas as 7 páginas admin importam dados de `src/data/mock-data.ts` diretamente. Deveriam usar API routes admin que consultam o banco.

6. ÁREA DO CLIENTE USANDO MOCKS: As 4 páginas do portal do cliente (dashboard, galleries, contracts, proposals) usam dados do DataContext (localStorage) com IDs hardcoded como `"c1"`. Deveriam usar API routes que retornam dados do cliente logado.

7. PAGES PÚBLICAS USANDO MOCKS: Blog público e portfolio/demo importam de mock-data.ts.

---

## Objetivo

Transformar TODAS as páginas e fluxos para usar o banco de dados PostgreSQL real através de API routes. O sistema deve ser 100% funcional end-to-end: dados criados via formulário → salvos no banco → exibidos nas listagens → editáveis → deletáveis. Toda ação deve persistir no PostgreSQL.

---

## Instruções Detalhadas

### PARTE 1 — API Routes Completas

Criar TODAS as API routes faltantes. Cada rota deve:
- Usar `requireAuth()` para autenticação
- Filtrar por `studioId` do usuário logado (exceto admin que vê tudo)
- Validar input com Zod
- Retornar dados via `apiSuccess()` / `apiError()`
- Registrar audit logs para ações de escrita

**Rotas a criar:**

```
# Galleries
GET    /api/galleries          — listar galerias do estúdio
POST   /api/galleries          — criar galeria
GET    /api/galleries/[id]     — detalhes da galeria com fotos
PATCH  /api/galleries/[id]     — atualizar galeria
DELETE /api/galleries/[id]     — soft delete

# Photos
GET    /api/photos             — listar fotos do estúdio (com filtros: galleryId, tags, isPortfolio)
POST   /api/photos             — adicionar foto (recebe URL por enquanto)
PATCH  /api/photos/[id]        — atualizar tags, portfolio, etc
DELETE /api/photos/[id]        — deletar foto

# Blog
GET    /api/blog               — listar posts do estúdio
POST   /api/blog               — criar post
GET    /api/blog/[id]          — detalhes do post
PATCH  /api/blog/[id]          — atualizar post
DELETE /api/blog/[id]          — deletar post
POST   /api/blog/[id]/publish  — publicar post (muda status para published)
GET    /api/public/blog        — posts publicados (público, sem auth)
GET    /api/public/blog/[slug] — post por slug (público)

# Proposals
GET    /api/proposals           — listar propostas do estúdio
POST   /api/proposals           — criar proposta com items
GET    /api/proposals/[id]      — detalhes com items
PATCH  /api/proposals/[id]      — atualizar
POST   /api/proposals/[id]/send — enviar (muda status para sent)
POST   /api/proposals/[id]/accept — aceitar (para cliente)
POST   /api/proposals/[id]/decline — recusar (para cliente)

# Contracts
GET    /api/contracts           — listar contratos do estúdio
POST   /api/contracts           — criar contrato
GET    /api/contracts/[id]      — detalhes
PATCH  /api/contracts/[id]      — atualizar
POST   /api/contracts/[id]/send — enviar
POST   /api/contracts/[id]/sign — assinar (para cliente)

# Invoices (Finance)
POST   /api/finance/invoices    — criar fatura/cobrança
PATCH  /api/finance/invoices/[id] — atualizar (marcar como pago, etc)

# Shoots update/delete
PATCH  /api/shoots/[id]         — atualizar ensaio
DELETE /api/shoots/[id]         — soft delete ensaio

# Messages
GET    /api/messages            — listar mensagens do estúdio
POST   /api/messages            — criar mensagem
PATCH  /api/messages/[id]/read  — marcar como lida
POST   /api/messages/[id]/reply — adicionar resposta

# Automations
GET    /api/automations         — listar automações do estúdio
POST   /api/automations/[id]/toggle — ativar/desativar

# Notifications
GET    /api/notifications       — listar notificações do usuário
PATCH  /api/notifications/[id]/read — marcar como lida
POST   /api/notifications/read-all — marcar todas como lidas

# Admin
GET    /api/admin/metrics       — métricas do SaaS (total users, MRR, etc)
GET    /api/admin/users         — listar todos os usuários
PATCH  /api/admin/users/[id]    — ativar/desativar usuário
GET    /api/admin/studios       — listar todos os estúdios
GET    /api/admin/tickets       — listar tickets de suporte

# Analytics
GET    /api/analytics           — métricas do estúdio (receita, conversão, etc)

# Client Portal
GET    /api/client/dashboard    — dados do portal do cliente
GET    /api/client/galleries    — galerias do cliente logado
GET    /api/client/proposals    — propostas do cliente logado
GET    /api/client/contracts    — contratos do cliente logado
POST   /api/client/galleries/[id]/favorites — favoritar/desfavoritar foto
POST   /api/client/galleries/[id]/selection — enviar seleção
```

### PARTE 2 — Conectar TODAS as Páginas do Fotógrafo à API Real

**Para CADA página do fotógrafo**, substituir as importações de mock-data.ts por chamadas fetch à API correspondente. Usar um padrão consistente:

```typescript
// Em cada página, substituir:
import { mockClients } from "@/data/mock-data";
// Por:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch("/api/clients").then(r => r.json()).then(j => { setData(j.data); setLoading(false); });
}, []);
```

Ou melhor: criar um hook reutilizável `useApiData(url)` que retorna `{ data, loading, error, refetch }`.

**Páginas que PRECISAM ser conectadas à API:**

1. `/app/clients` — GET /api/clients (listagem), POST /api/clients (criar via modal), PATCH /api/clients/[id] (editar), DELETE /api/clients/[id] (excluir)
2. `/app/shoots` — GET /api/shoots, POST /api/shoots, PATCH /api/shoots/[id], DELETE /api/shoots/[id]
3. `/app/galleries` — GET /api/galleries, POST /api/galleries, PATCH /api/galleries/[id]
4. `/app/photos` — GET /api/photos
5. `/app/blog` — GET /api/blog, POST /api/blog, PATCH /api/blog/[id], DELETE /api/blog/[id]
6. `/app/proposals` — GET /api/proposals, POST /api/proposals
7. `/app/contracts` — GET /api/contracts, POST /api/contracts
8. `/app/finance` — GET /api/finance, POST /api/finance/invoices, PATCH /api/finance/invoices/[id]
9. `/app/calendar` — GET /api/shoots (mesmo endpoint, dados do calendário)
10. `/app/portfolio` — GET /api/photos?isPortfolio=true
11. `/app/inbox` — GET /api/messages, PATCH /api/messages/[id]/read, POST /api/messages/[id]/reply
12. `/app/tasks` — GET /api/tasks, POST /api/tasks, PATCH /api/tasks/[id], DELETE /api/tasks/[id]
13. `/app/automations` — GET /api/automations, POST /api/automations/[id]/toggle
14. `/app/analytics` — GET /api/analytics
15. `/app/security` — estado local OK (checklist é por sessão), mas salvar score no banco seria ideal
16. `/app/dashboard` — GET /api/analytics + GET /api/shoots?status=confirmed + GET /api/tasks + GET /api/notifications
17. `/app/settings` — GET /api/auth/me + PATCH /api/studios/me (criar esta rota)
18. `/app/integrations` — estado local OK (mockado)

### PARTE 3 — Conectar Páginas Admin à API

Todas as 7 páginas admin devem usar API routes:

1. `/admin/dashboard` — GET /api/admin/metrics
2. `/admin/users` — GET /api/admin/users, PATCH /api/admin/users/[id]
3. `/admin/studios` — GET /api/admin/studios
4. `/admin/plans` — dados estáticos OK (planos são fixos no código)
5. `/admin/billing` — GET /api/admin/metrics (inclui dados de billing)
6. `/admin/support` — GET /api/admin/tickets
7. `/admin/settings` — estado local OK

### PARTE 4 — Conectar Portal do Cliente à API

1. `/client/dashboard` — GET /api/client/dashboard
2. `/client/galleries` — GET /api/client/galleries, POST /api/client/galleries/[id]/favorites, POST /api/client/galleries/[id]/selection
3. `/client/contracts` — GET /api/client/contracts, POST /api/contracts/[id]/sign
4. `/client/proposals` — GET /api/client/proposals, POST /api/proposals/[id]/accept, POST /api/proposals/[id]/decline

### PARTE 5 — Formulários de Criação Funcionais

Criar modais/formulários REAIS que fazem POST à API para:

1. **Novo Cliente** (na página /app/clients):
   - Campos: nome*, email, telefone, cidade, tipo, status, notas, tags
   - Validação: nome obrigatório, email válido se preenchido
   - Ao salvar: POST /api/clients → fechar modal → refetch lista → toast sucesso

2. **Novo Ensaio** (na página /app/shoots):
   - Campos: nome*, cliente (select de clientes existentes), tipo, data, horário, local, valor, pacote, notas
   - Ao salvar: POST /api/shoots → fechar modal → refetch

3. **Nova Galeria** (na página /app/galleries):
   - Campos: nome*, cliente (select), ensaio (select opcional), senha, permitir download, permitir favoritos, max seleções, mensagem
   - Ao salvar: POST /api/galleries → fechar modal → refetch

4. **Novo Post** (na página /app/blog):
   - Campos: título*, slug (auto-gerado do título), excerpt, conteúdo (textarea grande), capa URL, categoria, tags, SEO title, SEO description
   - Botões: Salvar rascunho, Publicar
   - Ao salvar: POST /api/blog → fechar modal → refetch

5. **Nova Proposta** (na página /app/proposals):
   - Campos: cliente (select), serviço, pacote, validade, notas
   - Itens da proposta: descrição, quantidade, valor unitário (dinâmico, adicionar/remover itens)
   - Cálculo automático: subtotal, desconto, total
   - Ao salvar: POST /api/proposals → fechar modal → refetch

6. **Novo Contrato** (na página /app/contracts):
   - Campos: cliente (select), título, serviço, valor, termos (textarea), cláusulas (adicionar/remover)
   - Ao salvar: POST /api/contracts → fechar modal → refetch

7. **Nova Cobrança** (na página /app/finance):
   - Campos: cliente (select), descrição, valor, data de vencimento
   - Ao salvar: POST /api/finance/invoices → fechar modal → refetch

8. **Nova Tarefa** (já existe no tasks, confirmar que usa API):
   - POST /api/tasks

### PARTE 6 — Ações de Edição e Status

Adicionar funcionalidade de EDITAR e MUDAR STATUS em todas as páginas:

1. **Clientes**: botão editar no drawer → modal de edição → PATCH /api/clients/[id]
2. **Ensaios**: mudar status (confirmed → photographed → editing → delivered) → PATCH /api/shoots/[id]
3. **Galerias**: mudar status (draft → sent → delivered) → PATCH /api/galleries/[id]
4. **Blog**: publicar rascunho → POST /api/blog/[id]/publish
5. **Propostas**: enviar proposta → POST /api/proposals/[id]/send
6. **Contratos**: enviar contrato → POST /api/contracts/[id]/send
7. **Faturas**: marcar como pago → PATCH /api/finance/invoices/[id] com { status: "paid", paidAt: now }
8. **Mensagens**: marcar como lida → PATCH /api/messages/[id]/read
9. **Tarefas**: mover no kanban → PATCH /api/tasks/[id] (já existe, confirmar)

### PARTE 7 — Fluxos End-to-End Completos

Garantir que estes fluxos funcionem ponta a ponta com dados reais no banco:

**Fluxo 1: Assistente Noir → Banco**
1. Usuário digita comando no assistente
2. NLP parser detecta entidades via POST /api/assistant/parse
3. Ações sugeridas aparecem na interface
4. Usuário clica "Aplicar tudo"
5. Para cada ação: POST /api/clients, POST /api/shoots, POST /api/tasks, POST /api/finance/invoices
6. Dados aparecem nas páginas correspondentes (que agora fazem fetch da API)

**Fluxo 2: Cliente aceita proposta → contrato → pagamento**
1. Fotógrafo cria proposta (POST /api/proposals)
2. Fotógrafo envia proposta (POST /api/proposals/[id]/send)
3. Cliente vê proposta no portal (GET /api/client/proposals)
4. Cliente aceita (POST /api/proposals/[id]/accept)
5. Fotógrafo cria contrato a partir da proposta (POST /api/contracts)
6. Fotógrafo envia contrato (POST /api/contracts/[id]/send)
7. Cliente assina (POST /api/contracts/[id]/sign)
8. Fotógrafo registra pagamento (POST /api/finance/invoices)
9. Tudo reflete no dashboard e analytics

**Fluxo 3: Galeria → Seleção → Entrega**
1. Fotógrafo cria galeria (POST /api/galleries)
2. Fotos são associadas à galeria
3. Fotógrafo envia galeria (PATCH status → sent)
4. Cliente acessa galeria (GET /api/client/galleries)
5. Cliente favorita fotos (POST /api/client/galleries/[id]/favorites)
6. Cliente envia seleção (POST /api/client/galleries/[id]/selection)
7. Fotógrafo vê seleção (status → selection_received)
8. Fotógrafo entrega (PATCH status → delivered)

### PARTE 8 — Hook Reutilizável para API

Criar um hook `useApi` em `src/hooks/useApi.ts`:

```typescript
function useApi<T>(url: string) {
  // GET com estado de loading, error, data, refetch
}

function useApiMutation<T>(url: string, method: "POST" | "PATCH" | "DELETE") {
  // Retorna mutate(data) com loading, error, success
}
```

Usar este hook em TODAS as páginas em vez de fetch direto, para consistência.

### PARTE 9 — Eliminar Dependências de Mock Data no Frontend

Após conectar tudo à API:
1. As páginas do fotógrafo NÃO devem mais importar de `src/data/mock-data.ts`
2. As páginas admin podem continuar usando mock-data.ts APENAS para planos (dados estáticos)
3. O `DataContext.tsx` pode ser simplificado ou removido — dados vêm da API agora
4. O arquivo `src/data/mock-data.ts` permanece como referência mas não é mais importado pelas páginas conectadas
5. Manter `STATUS_COLORS`, `STATUS_LABELS`, `PRIORITY_COLORS` como constantes de UI (mover para `src/lib/constants.ts`)

### PARTE 10 — Seed Expandido

Expandir o seed (`src/db/seed.ts`) para ter mais dados realistas:
- 12+ clientes (com variação de status)
- 10+ ensaios (com datas variadas e todos os status)
- 8+ galerias (incluindo rascunho, enviada, visualizada, seleção recebida, entregue)
- 40+ fotos (distribuídas entre galerias)
- 8+ posts de blog (publicados, rascunhos, agendados)
- 8+ propostas (draft, sent, accepted, declined, expired)
- 6+ contratos (draft, sent, signed, completed)
- 20+ faturas (paid, pending, overdue — com datas distribuídas nos últimos 6 meses para gráficos bonitos)
- 15+ tarefas (distribuídas nos 5 status do kanban)
- 10+ mensagens (lidas e não lidas, vários tipos)
- 6+ automações
- 8+ notificações

### PARTE 11 — Páginas Públicas Usando API

1. `/blog` — GET /api/public/blog (posts publicados)
2. `/blog/[slug]` — GET /api/public/blog/[slug]
3. As demais páginas públicas (portfolio/demo, gallery/demo) podem continuar com dados estáticos por serem demos visuais.

### PARTE 12 — Loading States e Error Handling em TODAS as Páginas

Cada página que faz fetch deve mostrar:
- **Loading**: skeleton ou spinner enquanto carrega
- **Erro**: mensagem amigável com botão "Tentar novamente"
- **Vazio**: empty state com ícone e CTA para criar o primeiro item
- **Dados**: lista normal

Usar o componente `Skeleton` já existente e o `EmptyState`.

### PARTE 13 — Confirmação de Exclusão

Todo botão de "Excluir" deve:
1. Abrir `ConfirmDialog` com mensagem clara
2. Ao confirmar: DELETE na API
3. Refetch da lista
4. Toast de sucesso

### PARTE 14 — Toasts em TODAS as Ações

Toda ação de escrita (criar, editar, excluir, mudar status) deve mostrar toast:
- Sucesso: verde, mensagem específica ("Cliente criado com sucesso")
- Erro: vermelho, mensagem da API
- Info: azul, para ações neutras

### PARTE 15 — Dashboard Conectado ao Banco

O dashboard do fotógrafo (`/app/dashboard`) deve:
1. GET /api/analytics para métricas (receita, leads, etc)
2. GET /api/shoots?status=confirmed&limit=3 para próximos ensaios
3. GET /api/tasks?status=today,in_progress&limit=5 para tarefas
4. GET /api/notifications para alertas
5. Mostrar skeleton loading durante carregamento

### PARTE 16 — Refinar Assistant para Usar API Real

O assistente (`/app/assistant`) ao aplicar ações deve:
1. POST /api/assistant/parse (já existe)
2. Ao clicar "Aplicar":
   - POST /api/clients (criar cliente)
   - POST /api/shoots (criar ensaio)
   - POST /api/tasks (criar tarefa)
   - POST /api/finance/invoices (criar cobrança)
3. Cada ação mostra toast
4. Dados aparecem imediatamente nas respectivas páginas (que agora fazem fetch da API)

### PARTE 17 — Melhorias de UX

1. Busca com debounce (300ms) em todas as páginas com busca
2. Filtros que atualizam a URL (query params) para poder compartilhar link filtrado
3. Paginação: limitar a 20 itens por página nas listagens grandes
4. Responsividade: verificar que modais de criação funcionam bem em mobile
5. Focus trap nos modais (Tab não sai do modal)
6. Acessibilidade: aria-label nos botões de ícone, role="dialog" nos modais

### PARTE 18 — Validação Final

Após implementar tudo:

1. Executar `npx drizzle-kit push` (caso schema tenha mudado)
2. Executar `npx tsx src/db/seed.ts` (com dados expandidos)
3. Executar `npx next typegen`
4. Executar `npm exec tsc -- --noEmit`
5. Executar `npm run build`
6. Executar `build_and_start`

7. Testar manualmente:
   - Login admin/admin → vê dashboard admin com dados do banco
   - Login studio/studio → vê dashboard fotógrafo com dados do banco
   - Criar cliente via formulário → aparece na listagem
   - Criar ensaio via formulário → aparece na agenda
   - Usar Assistente Noir → dados criados aparecem nas páginas
   - Login cliente/cliente → vê portal com dados reais
   - Aceitar proposta como cliente → status muda no banco
   - Marcar pagamento como pago → reflete no financeiro

### PARTE 19 — O que NÃO fazer

- NÃO mudar o visual/design (já está polido)
- NÃO mudar a landing page (já está otimizada)
- NÃO mudar o schema do banco (já está completo)
- NÃO adicionar novas páginas (já existem todas)
- NÃO mudar as credenciais de seed
- NÃO remover funcionalidades existentes
- NÃO editar package.json diretamente (usar install_npm_packages)

### RESUMO DO QUE PRECISA SER FEITO

1. ✅ Criar ~25 API routes faltantes
2. ✅ Criar hook useApi reutilizável
3. ✅ Conectar 18 páginas do fotógrafo à API real
4. ✅ Conectar 7 páginas admin à API
5. ✅ Conectar 4 páginas do cliente à API
6. ✅ Conectar 2 páginas públicas (blog) à API
7. ✅ Adicionar modais de criação funcional em 7 páginas
8. ✅ Adicionar ações de edição/status em 9 páginas
9. ✅ Expandir seed com mais dados
10. ✅ Mover constantes de UI para lib/constants.ts
11. ✅ Loading states em todas as páginas
12. ✅ Error handling em todas as páginas
13. ✅ Toasts em todas as ações
14. ✅ Confirmação de exclusão
15. ✅ Validação final completa

O objetivo é que ZERO dados venham de mock-data.ts nas páginas do app. TUDO deve vir do banco PostgreSQL via API routes. O sistema deve ser 100% funcional end-to-end.
