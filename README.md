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

# Configurar variáveis (copie .env.example para .env e preencha)
cp .env.example .env

# Aplicar schema no banco (inclui a tabela password_reset_tokens)
npx drizzle-kit push

# Seedar dados iniciais
npx tsx src/db/seed.ts

# Rodar testes
npm test

# Iniciar
npm run dev
```

## 📧 Emails (Resend)

Os emails usam o [Resend](https://resend.com) quando `RESEND_API_KEY` está configurada. Sem a chave, o app entra em **modo dev**: os emails são logados no console (com links clicáveis) e nenhum fluxo quebra.

**Para ativar o envio real:**

1. Crie sua conta em [resend.com](https://resend.com) e gere uma API Key (Settings → API Keys)
2. Adicione ao seu `.env`: `RESEND_API_KEY=re_...`
3. **Verifique um domínio** no Resend (Domains → Add Domain) para enviar com seu próprio endereço
4. Defina o remetente: `EMAIL_FROM=NoirFrame <contato@seu-dominio.com>`
   - Sem domínio verificado, use `NoirFrame <onboarding@resend.dev>` (só entrega para o email da sua conta Resend)
5. Defina `NEXT_PUBLIC_APP_URL` com a URL pública do seu app (usada nos links dos emails)

**Fluxos com email real:**
- **Redefinição de senha** — `/forgot-password` gera token seguro (hash SHA-256, expira em 1h, uso único) e envia link para `/reset-password`
- **Galeria pronta** — ao gerar um magic link para um cliente com email cadastrado, envia o email "Suas fotos estão prontas"
- **Lembretes de ensaio** — o cron `/api/cron/send-reminders` envia lembrete ao email do cliente (quando cadastrado) além da notificação in-app

**Testes:** `npm test` (vitest) cobre tokens, templates e a camada de envio (com fetch mockado).

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
- Emails: simulados no console sem `RESEND_API_KEY`; reais com a chave configurada (ver seção "Emails")
- Pagamentos são mockados
- NLP é baseado em regras (sem AI real)
- Sem 2FA real
- Sem deploy automatizado

## 🔮 Próximos Passos

1. Upload real com S3/R2 + thumbnails
2. Pagamentos com Stripe
3. IA real no assistente (OpenAI)
4. App mobile (React Native)
5. CI/CD + Docker
6. Testes E2E com Playwright

---

**Feito com ❤️ para fotógrafos profissionais.**
