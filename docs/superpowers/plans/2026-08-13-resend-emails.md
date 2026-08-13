# Emails Reais com Resend — Plano de Implementação

> **Para workers agentic:** REQUIRED SUB-SKILL: usar superpowers:executing-plans para implementar tarefa por tarefa. Passos usam checkbox (`- [ ]`) para tracking.

**Goal:** Substituir a simulação de emails do NoirFrame por envio real via Resend nos 3 fluxos core (redefinição de senha, galeria pronta/magic link, lembrete de ensaio), com fallback dev sem chave.

**Architecture:** Camada única de envio (`email-sender.ts`) usada pelas rotas; tokens de reset com hash SHA-256 + expiração de 1h persistidos em tabela nova; templates HTML existentes reaproveitados (adicionando o case `password_reset` que falta).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, SDK `resend`, `vitest` para testes unitários.

## Global Constraints

- Sem `RESEND_API_KEY` → modo dev: loga o email no console, NUNCA quebra o fluxo.
- Rota de forgot-password mantém resposta genérica (anti-enumeração de email).
- `EMAIL_FROM` configurável via env; default `NoirFrame <onboarding@resend.dev>`.
- Nova tabela exige `npx drizzle-kit push` no ambiente do usuário (documentar no README).
- Comportamento atual preservado quando não há email do cliente (magic-link via WhatsApp continua).
- Variáveis de ambiente: `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL` (+ `DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET` já usados).
- Senha mínima: 8 caracteres (`resetPasswordSchema` já existe em `src/lib/validations.ts`).

---

### Task 1: Utilitários de token de reset (`src/lib/reset-token.ts`)

**Files:**
- Create: `src/lib/reset-token.ts`
- Test: `src/lib/reset-token.test.ts`

- [ ] **Step 1: Escrever testes falhando** — `generateResetToken()` retorna string base64url ≥ 43 chars; `hashResetToken()` retorna hex SHA-256 de 64 chars e é determinístico; `isResetTokenExpired(expiresAt)` retorna true para passado, false para futuro; `RESET_TOKEN_TTL_MS === 3600_000`.
- [ ] **Step 2: Rodar e confirmar falha** — `npx vitest run src/lib/reset-token.test.ts` → FAIL (módulo não existe).
- [ ] **Step 3: Implementar** — `crypto.randomBytes(32)`, `createHash("sha256")`, exportação das 3 funções + constante TTL.
- [ ] **Step 4: Rodar e confirmar passagem** — `npx vitest run src/lib/reset-token.test.ts` → PASS.
- [ ] **Step 5: Commit** — `feat(email): token utils para reset de senha`

### Task 2: Template password_reset (`email-templates.ts`)

**Files:**
- Modify: `src/lib/integrations/email-templates.ts` (adicionar case `password_reset` antes do `default`)
- Test: `src/lib/integrations/email-templates.test.ts`

- [ ] **Step 1: Testes falhando** — `getEmailTemplate("password_reset", {clientName, resetLink})` → subject contém "senha"; html contém o resetLink e o botão "Redefinir Senha".
- [ ] **Step 2: Rodar e confirmar falha** — subject genérico ("Mensagem do ...") → FAIL.
- [ ] **Step 3: Implementar case** — subject `Redefinição de senha — {studioName}`, botão com resetLink, aviso de expiração 1h.
- [ ] **Step 4: Rodar e confirmar passagem** — PASS.
- [ ] **Step 5: Commit** — `feat(email): template premium de redefinição de senha`

### Task 3: Camada de envio (`email-sender.ts`)

**Files:**
- Create: `src/lib/integrations/email-sender.ts`
- Test: `src/lib/integrations/email-sender.test.ts`

- [ ] **Step 1: Testes falhando** — (a) sem `RESEND_API_KEY` → `sendEmail()` retorna `{mode:"dev", sent:false}` sem lançar e sem chamar fetch; (b) com chave + fetch mockado → chama `api.resend.com/emails` com `from/to/subject/html`, retorna `{mode:"resend", sent:true, id}`; (c) fetch 400 → lança Error com status.
- [ ] **Step 2: Rodar e confirmar falha** — módulo não existe → FAIL.
- [ ] **Step 3: Implementar** — `Resend` SDK + fallback dev (console.log formatado com subject/to + link); helpers `isEmailEnabled()`, `getFromAddress()`, `getAppUrl()`; erros propagados com contexto.
- [ ] **Step 4: Rodar e confirmar passagem** — PASS.
- [ ] **Step 5: Commit** — `feat(email): camada de envio Resend com fallback dev`

### Task 4: Tabela `password_reset_tokens` (`schema.ts`)

**Files:**
- Modify: `src/db/schema.ts`

- [ ] **Step 1: Adicionar tabela** — id uuid default, userId (index), tokenHash unique notNull, expiresAt, usedAt nullable, createdAt.
- [ ] **Step 2: Verificar** — `npx tsc --noEmit` sem erros; `npx drizzle-kit generate` opcional (usuário fará `push`).
- [ ] **Step 3: Commit** — `feat(db): tabela password_reset_tokens`

### Task 5: Fluxo forgot-password → reset-password (rotas + página)

**Files:**
- Modify: `src/app/api/auth/forgot-password/route.ts`
- Create: `src/app/api/auth/reset-password/route.ts`
- Create: `src/app/reset-password/page.tsx`
- Modify: `src/app/forgot-password/page.tsx`

- [ ] **Step 1: Reescrever forgot-password** — token 32 bytes → hash → insert com expiração 1h → `sendEmail(template:"password_reset", resetLink)` → resposta genérica sempre; erro de envio logado sem vazar.
- [ ] **Step 2: Criar rota reset-password** — `resetPasswordSchema`; lookup por hash; checar expiração/uso; `bcrypt.hash(password, 12)`; update users; marcar `usedAt`; sucesso.
- [ ] **Step 3: Criar página reset-password** — design all-black (padrão NoirFrame), lê `?token=` via `useSearchParams`, form com confirmação, estados success/error/expired.
- [ ] **Step 4: Corrigir página forgot-password** — passar a chamar `POST /api/auth/forgot-password` de verdade (hoje só seta estado visual).
- [ ] **Step 5: Verificação** — `npx tsc --noEmit` limpo.
- [ ] **Step 6: Commit** — `feat(email): fluxo completo de redefinição de senha`

### Task 6: Magic link envia galeria pronta

**Files:**
- Modify: `src/app/api/client/magic-link/route.ts`

- [ ] **Step 1: Buscar email do cliente** no select (já existe coluna `clients.email`).
- [ ] **Step 2: Enviar** — se `client.email` → `sendEmail(template:"gallery_ready", {clientName, galleryLink: magicLink, studioName})`; adicionar `emailSent` e `emailMode` na resposta; erro de envio não quebra a rota.
- [ ] **Step 3: Verificação** — `npx tsc --noEmit` limpo.
- [ ] **Step 4: Commit** — `feat(email): magic link envia email de galeria pronta`

### Task 7: Cron lembrete de ensaio envia email

**Files:**
- Modify: `src/app/api/cron/send-reminders/route.ts`

- [ ] **Step 1: Incluir `clientEmail`** no select de shoots + `name` do estúdio no lookup do owner.
- [ ] **Step 2: Enviar** — por ensaio com `clientEmail` → `sendEmail(template:"shoot_reminder", {clientName, date, time, location, studioName})`; notificação in-app mantida; erros por ensaio não derrubam o cron; resposta inclui `emailsSent`.
- [ ] **Step 3: Verificação** — `npx tsc --noEmit` limpo.
- [ ] **Step 4: Commit** — `feat(email): cron de lembretes envia email ao cliente`

### Task 8: Config, docs e verificação final

**Files:**
- Create: `.env.example`
- Modify: `package.json` (script `test`)
- Create: `vitest.config.ts`
- Modify: `README.md` (seção Emails + nota do `drizzle-kit push`)

- [ ] **Step 1: Criar .env.example** com todas as variáveis documentadas.
- [ ] **Step 2: Script test + vitest config** (alias `@` → `./src`).
- [ ] **Step 3: Atualizar README** — como configurar Resend (domínio verificado, EMAIL_FROM), limitação atualizada, comando push da tabela nova.
- [ ] **Step 4: Verificação completa** — `npx vitest run` (todos PASS) + `npx tsc --noEmit` + `npm run lint` + `npm run build`.
- [ ] **Step 5: Commit** — `docs(email): configuração Resend e instruções`

### Task 9: Push para GitHub

- [ ] **Step 1:** `git push` para `origin main` com autenticação via token (sem persistir o token em arquivos).
- [ ] **Step 2:** Confirmar com `git log origin/main -1` e status limpo.
