# 🎬 NoirFrame

**O sistema operacional para fotógrafos profissionais.**

Do primeiro contato à entrega final — agenda, CRM, galerias, propostas, contratos, financeiro e IA em uma plataforma premium all-black.

---

## ✨ Funcionalidades

| Área | Recursos |
|------|----------|
| **Assistente IA** | NLP que interpreta texto livre e cria registros automaticamente |
| **Agenda** | Visualização mensal, conflitos, prazos de entrega |
| **CRM** | Leads, clientes, histórico, tags, valor por cliente |
| **Galerias** | Links privados, senha, seleção de favoritas, download controlado |
| **Propostas** | Pacotes, valores, aceite online pelo cliente |
| **Contratos** | Modelos, assinatura digital, LGPD |
| **Financeiro** | Cobranças, parcelas, receita, inadimplência |
| **Blog** | CMS com SEO, categorias, preview público |
| **Portfólio** | Editor visual com seções e layouts |
| **Tarefas** | Kanban com 5 colunas e prioridades |
| **Mensagens** | Inbox com respostas e sugestões IA |
| **Segurança** | Score, checklist LGPD, incidentes, audit logs |
| **Automações** | Lembretes, cobranças, follow-ups automáticos |
| **Analytics** | Insights sobre receita, conversão e performance |
| **Área do Cliente** | Portal para galeria, proposta e contrato |
| **Admin** | Dashboard SaaS, usuários, planos, billing |

## 🛠 Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend | Next.js API Routes, Drizzle ORM, Zod |
| Banco | PostgreSQL |
| Auth | JWT (jose) + bcryptjs, cookies httpOnly |
| IA | NLP parser local (preparado para OpenAI/Anthropic) |
| Design | All-black premium, system fonts, responsive, PWA |

## 📊 Números

- **47 rotas** (39 páginas + 8 API endpoints)
- **20 tabelas** PostgreSQL com índices
- **86+ registros** no seed
- **3 papéis** de usuário (Admin, Fotógrafo, Cliente)
- **15 intenções** NLP detectáveis
- **7 templates** de briefing por tipo de ensaio

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Configurar variáveis (já incluído .env)
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
# JWT_SECRET=noirframe-dev-secret-change-in-production-2025

# Aplicar schema no banco
npx drizzle-kit push

# Seedar dados iniciais
npx tsx src/db/seed.ts

# Iniciar
npm run dev
```

## 🔑 Credenciais Demo

> ⚠️ **Apenas para desenvolvimento/demonstração.** Em produção, use senhas fortes.

| Papel | Usuário | Senha | Rota |
|-------|---------|-------|------|
| Admin | `admin` | `admin` | `/admin/dashboard` |
| Fotógrafo | `studio` | `studio` | `/app/dashboard` |
| Cliente | `cliente` | `cliente` | `/client/dashboard` |

## 🗺 Rotas Principais

### Públicas
- `/` — Landing page
- `/demo` — Demonstração com roteiro
- `/login` — Login
- `/register` — Cadastro
- `/blog` — Blog público
- `/portfolio/demo` — Portfólio público
- `/gallery/demo` — Galeria pública

### API
- `POST /api/auth/login` — Autenticação
- `GET /api/auth/me` — Sessão atual
- `GET/POST /api/clients` — CRUD clientes
- `GET/POST /api/shoots` — CRUD ensaios
- `GET/POST /api/tasks` — CRUD tarefas
- `GET /api/finance` — Resumo financeiro
- `POST /api/assistant/parse` — NLP parser

### Fotógrafo (`/app/*`)
Dashboard, Assistente IA, Agenda, Clientes, Ensaios, Galerias, Fotos, Blog, Propostas, Contratos, Financeiro, Tarefas, Inbox, Analytics, Segurança, Automações, Integrações, Configurações

### Admin (`/admin/*`)
Dashboard, Usuários, Estúdios, Planos, Billing, Suporte, Configurações

### Cliente (`/client/*`)
Dashboard, Galerias, Propostas, Contratos

## 🔒 Segurança

- JWT com cookies httpOnly e expiração
- Hash de senha com bcrypt (12 rounds)
- Rotas protegidas por autenticação e role
- Escopo de dados por studioId
- Validação de entrada com Zod
- Soft delete em registros importantes
- Audit logs para ações críticas
- Senha nunca retornada na API
- CORS e sameSite=lax

## 📁 Estrutura

```
src/
├── app/                    # Páginas e API Routes
│   ├── api/                # Backend (auth, clients, shoots, tasks, finance, assistant)
│   ├── app/                # Área do fotógrafo (18 páginas)
│   ├── admin/              # Área admin (7 páginas)
│   ├── client/             # Portal do cliente (4 páginas)
│   └── ...                 # Públicas (landing, login, blog, demo)
├── db/
│   ├── schema.ts           # 20 tabelas Drizzle com enums e índices
│   ├── index.ts            # Connection pool
│   └── seed.ts             # Script de seed completo
├── lib/
│   ├── auth.ts             # JWT, bcrypt, sessions, middleware
│   ├── api.ts              # Response helpers, error handling
│   └── nlp-parser.ts       # NLP engine (15 intenções, 11 entidades)
├── context/                # Auth + Data contexts
├── components/             # UI components + Command Palette
├── data/                   # Fallback mock data
└── types/                  # TypeScript types
```

## 📝 Marketing

A pasta `/marketing` contém materiais prontos:
- `PITCH.md` — Apresentação do produto
- `ROADMAP.md` — Roadmap de evolução
- `CASE_STUDY.md` — Estudo de caso fictício
- `PRODUCT_ONE_PAGER.md` — Resumo de uma página
- `LINKEDIN_POST.md` — Post para LinkedIn
- `INSTAGRAM_CAPTION.md` — Legenda para Instagram
- `WHATSAPP_PITCH.md` — Mensagem de venda
- `EMAIL_PITCH.md` — Email para fotógrafos

## ⚠️ Limitações do MVP

- Upload de fotos usa URLs externas (sem S3 ainda)
- Emails e notificações são simulados
- Pagamentos são mockados
- NLP é baseado em regras (sem AI real)
- Sem 2FA real
- Sem deploy automatizado

## 🔮 Próximos Passos

1. Upload real com S3/R2 + thumbnails
2. Envio de emails com Resend
3. Pagamentos com Stripe
4. IA real no assistente (OpenAI)
5. App mobile (React Native)
6. CI/CD + Docker
7. Testes E2E com Playwright

---

**Feito com ❤️ para fotógrafos profissionais.**
