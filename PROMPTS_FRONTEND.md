# 🎨 PROMPTS COMPLETOS — CHAT 2 (FRONTEND)

Estes são 5 prompts extremamente detalhados para serem executados sequencialmente pelo Chat 2 (Frontend/Codex). Cada prompt é uma missão completa que deve ser finalizada antes de passar para a próxima.

**REGRA ABSOLUTA:** Você NÃO pode editar nenhum arquivo dentro de `src/app/api/`, `src/hooks/useApi.ts`, `src/lib/api-utils.ts`, `src/lib/constants.ts`, `src/lib/validations.ts`, `src/lib/auth.ts`, `src/lib/nlp-parser.ts`, `src/db/schema.ts`, `src/db/index.ts`, `src/db/seed.ts`, `src/app/page.tsx` (landing page), `src/app/layout.tsx`, `src/app/globals.css`, `package.json`, `tsconfig.json`, `next.config.ts`, `.env`, `drizzle.config.json`.

**ANTES DE TUDO:** Execute `git pull origin main` para pegar todas as APIs e utilitários criados pelo Chat 1.

---

# 📌 PROMPT 1 — CONECTAR PÁGINAS DO FOTÓGRAFO ÀS APIs REAIS

## Contexto

Você é o CHAT 2 (FRONTEND) do projeto NoirFrame — um SaaS premium all-black para fotógrafos. Antes de começar, faça `git pull origin main` para pegar as alterações do Chat 1 (Backend).

O Chat 1 já criou:
- **Hook reutilizável** `src/hooks/useApi.ts` com `useApi()`, `useApiMutation()`, `useApiUpload()`, `invalidateCache()`
- **Constantes** `src/lib/constants.ts` com STATUS_COLORS, LABELS, PLANS, SHOOT_TYPES, etc.
- **API routes** para: galleries, photos, blog, proposals, contracts, invoices, shoots, messages, automations, notifications, analytics

## Missão

Conectar as 18 páginas do fotógrafo (`src/app/app/*`) à API real, substituindo TODOS os imports de `src/data/mock-data.ts` e do `DataContext` (localStorage) por chamadas reais à API usando o hook `useApi`.

## Arquivos que você PODE editar:

```
src/app/app/dashboard/page.tsx
src/app/app/clients/page.tsx
src/app/app/shoots/page.tsx
src/app/app/galleries/page.tsx
src/app/app/photos/page.tsx
src/app/app/finance/page.tsx
src/app/app/tasks/page.tsx
src/app/app/calendar/page.tsx
src/app/app/blog/page.tsx
src/app/app/proposals/page.tsx
src/app/app/contracts/page.tsx
src/app/app/inbox/page.tsx
src/app/app/analytics/page.tsx
src/app/app/portfolio/page.tsx
src/app/app/automations/page.tsx
src/app/app/assistant/page.tsx
src/app/app/settings/page.tsx
src/app/app/security/page.tsx
src/app/app/integrations/page.tsx
src/app/app/layout.tsx
```

## Padrão para CADA página:

```typescript
"use client";
import { useState } from "react";
import { useApi, useApiMutation, invalidateCache } from "@/hooks/useApi";
import { SHOOT_STATUS, GALLERY_STATUS, PRIORITY, formatCurrency, formatDate, getInitials } from "@/lib/constants";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ExamplePage() {
  // Data fetching
  const { data, loading, error, refetch } = useApi<{ items: any[] }>("/api/example");
  const { mutate: createItem, loading: creating } = useApiMutation("/api/example", "POST");
  const { mutate: deleteItem } = useApiMutation("/api/example/ID", "DELETE");

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Handlers
  const handleCreate = async (formData: any) => {
    const result = await createItem(formData);
    if (result.success) {
      setShowCreateModal(false);
      setToast({ message: "Item criado com sucesso!", type: "success" });
      refetch();
    } else {
      setToast({ message: result.error || "Erro ao criar", type: "error" });
    }
  };

  // Loading state
  if (loading) {
    return <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>;
  }

  // Error state
  if (error) {
    return <div className="p-6 text-center">
      <p className="text-red-400">{error}</p>
      <button onClick={refetch} className="mt-4 px-4 py-2 bg-[#c9a96e] text-black rounded">
        Tentar novamente
      </button>
    </div>;
  }

  // Empty state
  if (!data || data.items?.length === 0) {
    return <EmptyState title="Nenhum item" description="Crie o primeiro item" />;
  }

  // Render data
  return (
    <div>
      {/* ... render real data ... */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

## Instruções detalhadas por página:

### 1. `/app/dashboard` — Dashboard do Fotógrafo
**APIs:** `GET /api/analytics`, `GET /api/shoots`, `GET /api/tasks`, `GET /api/notifications`
**Ações:**
- Substituir TODOS os dados mockados por `useApi()`
- Mostrar métricas reais: receita total, clientes, ensaios, galerias
- Listar próximos ensaios (from shoots API com filtro de status)
- Listar tarefas pendentes (from tasks API)
- Mostrar notificações (from notifications API)
- Skeleton loading durante carregamento

```typescript
const { data: analytics, loading: loadingAnalytics } = useApi("/api/analytics");
const { data: shoots, loading: loadingShoots } = useApi("/api/shoots?status=confirmed&pageSize=5");
const { data: tasksData, loading: loadingTasks } = useApi("/api/tasks?status=today,in_progress&pageSize=5");
const { data: notifs } = useApi("/api/notifications");
```

### 2. `/app/clients` — Gestão de Clientes
**APIs:** `GET /api/clients`, `POST /api/clients`, `PATCH /api/clients/[id]`, `DELETE /api/clients/[id]`
**Ações:**
- Remover import de `mockClients` de `src/data/mock-data.ts`
- Usar `useApi("/api/clients")` para listagem
- Modal de criação de cliente com campos: nome*, email, telefone, cidade, tipo, status, notas, tags
- Drawer/modal de edição de cliente
- Botão de excluir com `ConfirmDialog`
- Busca com debounce
- Filtros por status
- Toast em todas as ações

```typescript
const { data: clientsData, loading, refetch } = useApi("/api/clients?search=" + search + "&status=" + statusFilter);
const { mutate: createClient, loading: creating } = useApiMutation("/api/clients", "POST");
```

### 3. `/app/shoots` — Gestão de Ensaios
**APIs:** `GET /api/shoots`, `POST /api/shoots`, `PATCH /api/shoots/[id]`, `DELETE /api/shoots/[id]`
**Ações:**
- Remover imports mockados
- Listagem real com filtros por status, data, tipo
- Modal de criação com: nome*, cliente (select da API), tipo, data, hora, local, valor, pacote, notas
- Mudança de status: lead → confirmed → photographed → editing → delivered → paid
- Importar `SHOOT_STATUS` de constants para cores dos status badges
- `SHOOT_TYPES` para select de tipo de ensaio

```typescript
const { data: shootsData, loading, refetch } = useApi("/api/shoots");
const { data: clientsData } = useApi("/api/clients"); // for select dropdown
const { mutate: createShoot } = useApiMutation("/api/shoots", "POST");
```

### 4. `/app/galleries` — Gestão de Galerias
**APIs:** `GET /api/galleries`, `POST /api/galleries`, `PATCH /api/galleries/[id]`, `DELETE /api/galleries/[id]`
**Ações:**
- Listagem com fotos count, status, cliente
- Modal de criação: nome*, cliente (select), ensaio (select opcional), senha, download, favoritos, max seleções, mensagem
- Mudança de status: draft → sent → viewed → selection_received → delivered
- Importar `GALLERY_STATUS` de constants

### 5. `/app/photos` — Fotos
**APIs:** `GET /api/photos`, `POST /api/photos`, `PATCH /api/photos/[id]`, `DELETE /api/photos/[id]`
**Ações:**
- Grid de fotos com filtros por galeria, portfólio
- Toggle de portfólio (PATCH isPortfolio)
- Tags editing
- Delete com confirmação

### 6. `/app/finance` — Financeiro
**APIs:** `GET /api/invoices`, `GET /api/analytics`, `POST /api/invoices`, `PATCH /api/invoices/[id]`
**Ações:**
- Listagem de faturas com status badges
- Métricas: receita total, pendente, atrasado
- Gráfico de receita por mês (dados de analytics.revenue.byMonth)
- Modal de criação: cliente (select), descrição, valor, vencimento
- Botão "Marcar como Pago" (PATCH status → paid)
- Importar `PAYMENT_STATUS`, `formatCurrency` de constants

### 7. `/app/tasks` — Kanban de Tarefas
**APIs:** `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]`
**Ações:**
- Board kanban com colunas: Backlog, Hoje, Em Progresso, Aguardando Cliente, Concluído
- Drag and drop entre colunas (PATCH status)
- Modal de criação: título*, descrição, prioridade, data, cliente
- Delete com confirmação
- Importar `TASK_STATUS`, `PRIORITY` de constants

### 8. `/app/calendar` — Calendário
**APIs:** `GET /api/shoots`
**Ações:**
- Exibir ensaios no calendário
- Usar dados de shoots para montar visualização mensal
- Clicar num ensaio abre detalhes
- Status badges coloridos

### 9. `/app/blog` — Blog
**APIs:** `GET /api/blog`, `POST /api/blog`, `PATCH /api/blog/[id]`, `DELETE /api/blog/[id]`
**Ações:**
- Listagem de posts com status, data, categoria
- Modal de criação: título*, slug (auto do título), excerpt, conteúdo (textarea), capa URL, categoria, tags, SEO
- Botões: Salvar rascunho, Publicar
- Importar `BLOG_STATUS`, `BLOG_CATEGORIES` de constants
- Usar `slugify()` de constants para auto-slug

### 10. `/app/proposals` — Propostas
**APIs:** `GET /api/proposals`, `POST /api/proposals`, `PATCH /api/proposals/[id]`, `DELETE /api/proposals/[id]`
**Ações:**
- Listagem com valores, status, cliente
- Modal de criação com items dinâmicos (adicionar/remover linhas)
- Cada item: descrição, quantidade, valor unitário → calcula total
- Subtotal, desconto, total automáticos
- Botão "Enviar" (PATCH status → sent)
- Importar `PROPOSAL_STATUS` de constants

### 11. `/app/contracts` — Contratos
**APIs:** `GET /api/contracts`, `POST /api/contracts`, `PATCH /api/contracts/[id]`, `DELETE /api/contracts/[id]`
**Ações:**
- Listagem com status, valor, cliente
- Modal de criação: cliente, título, serviço, valor, termos, cláusulas (adicionar/remover)
- Botão "Enviar" (PATCH status → sent)
- Importar `CONTRACT_STATUS` de constants

### 12. `/app/inbox` — Caixa de Mensagens
**APIs:** `GET /api/messages`, `PATCH /api/messages/[id]` (mark read), `POST /api/messages/[id]` (reply)
**Ações:**
- Lista de mensagens com indicador de não lida
- Clicar abre detalhes com replies
- Botão "Marcar como lida" (PATCH)
- Formulário de resposta (POST reply)
- Badge com contagem de não lidas
- Importar `MESSAGE_TYPES` de constants

### 13. `/app/analytics` — Análises
**APIs:** `GET /api/analytics`
**Ações:**
- Gráficos de receita mensal (usar dados de analytics.revenue.byMonth)
- Cards de métricas: clientes, ensaios, receita, taxa de conversão
- Ensaios por status (gráfico de barras ou pizza)
- Tarefas por status
- Todas as métricas vêm do endpoint /api/analytics

### 14. `/app/portfolio` — Portfólio
**APIs:** `GET /api/photos?isPortfolio=true`
**Ações:**
- Grid de fotos marcadas como portfólio
- Nenhum dado mockado

### 15. `/app/automations` — Automações
**APIs:** `GET /api/automations`, `POST /api/automations/[id]` (toggle)
**Ações:**
- Listagem de automações com switch ativo/inativo
- Toggle usa POST /api/automations/[id] para alternar
- Importar `AUTOMATION_TRIGGERS`, `AUTOMATION_ACTIONS` de constants

### 16. `/app/assistant` — Assistente Noir
**APIs:** `POST /api/assistant/parse`, `POST /api/clients`, `POST /api/shoots`, `POST /api/tasks`, `POST /api/invoices`
**Ações:**
- Campo de texto para comando
- Enviar para POST /api/assistant/parse
- Mostrar ações sugeridas
- Botão "Aplicar tudo" → POST para APIs correspondentes
- Toast de sucesso para cada ação aplicada
- Os dados criados devem aparecer nas páginas correspondentes

### 17. `/app/settings` — Configurações
**APIs:** `GET /api/auth/me`
**Ações:**
- Exibir dados do perfil do usuário logado
- Exibir dados do estúdio
- Manter formulários visuais (sem submit real por enquanto, pode manter mock nesta parte)

### 18. `/app/security` — Segurança
**Ação:** Esta página pode manter o estado local (checklist por sessão). Sem mudanças necessárias.

### 19. `/app/integrations` — Integrações
**Ação:** Esta página pode manter o estado local mockado. Sem mudanças necessárias.

## Ao finalizar:

1. Verificar que NENHUMA página do fotógrafo importa de `src/data/mock-data.ts`
2. Verificar que NENHUMA página usa `useData()` do DataContext para dados
3. Rodar `npm exec tsc -- --noEmit`
4. Rodar `npm run build`
5. Fazer `git add . && git commit -m "feat(frontend): connect photographer pages to real API" && git push origin main`

---

# 📌 PROMPT 2 — MODAIS DE CRIAÇÃO FUNCIONAIS + FORMULÁRIOS COMPLETOS

## Contexto

Você é o CHAT 2 (FRONTEND). Faça `git pull origin main` antes de começar. As páginas do fotógrafo já estão conectadas à API. Agora é hora de criar modais e formulários de criação REAIS e funcionais.

## Missão

Criar modais/formulários completos para TODAS as ações de criação (POST) em cada página. Cada formulário deve ser bonito, validar campos, e fazer POST real à API.

## Arquivos que você PODE editar:

```
src/app/app/clients/page.tsx
src/app/app/shoots/page.tsx
src/app/app/galleries/page.tsx
src/app/app/blog/page.tsx
src/app/app/proposals/page.tsx
src/app/app/contracts/page.tsx
src/app/app/finance/page.tsx
src/app/app/tasks/page.tsx
src/app/app/inbox/page.tsx
src/components/ui/Modal.tsx (se precisar melhorar)
src/components/ui/Input.tsx (se precisar melhorar)
src/components/ui/Select.tsx (se precisar melhorar)
src/components/ui/Toast.tsx (se precisar melhorar)
src/components/ui/ConfirmDialog.tsx (se precisar melhorar)
```

## Formulários a criar:

### 1. Modal "Novo Cliente" (em `/app/clients`)
```
Campos:
- Nome* (text, required, min 2 chars)
- Email (email, optional)
- Telefone (text, optional, mask)
- Cidade (text, optional)
- Tipo (select: Casamento, Ensaio, Corporativo, Evento, Família, Outro)
- Status (select: Lead, Negociação, Agendado, Recorrente) — default: lead
- Instagram (text, optional, @prefixed)
- Fonte de Referência (select: Instagram, Google, Indicação, Site, Outro)
- Notas (textarea, optional, max 2000)
- Tags (input com chips, adicionar/remover)

Botões:
- "Cancelar" → fecha modal
- "Salvar Cliente" → POST /api/clients → fechar → toast sucesso → refetch lista

Validação:
- Nome obrigatório, min 2 chars
- Email válido se preenchido
- Mostrar erros inline abaixo dos campos

Design:
- Modal dark (bg-[#1a1a1a]) com bordas sutis
- Inputs com estilo all-black premium
- Botão principal com cor gold (#c9a96e)
- Responsivo (mobile-friendly)
```

### 2. Modal "Novo Ensaio" (em `/app/shoots`)
```
Campos:
- Nome* (text, ex: "Ensaio Pré-Wedding Marina & João")
- Cliente (select populado de GET /api/clients)
- Tipo (select: usar SHOOT_TYPES de constants)
- Data (date picker)
- Horário Início (time)
- Horário Fim (time, optional)
- Local (text)
- Valor (number, R$, formatado)
- Pacote (text, optional)
- Notas (textarea)
- Briefing (textarea, optional)
- Prazo de Entrega (date, optional)

Botões:
- "Cancelar" → fecha modal
- "Criar Ensaio" → POST /api/shoots → fechar → toast → refetch

Validação:
- Nome obrigatório
- Se cliente selecionado, preencher clientId e clientName
```

### 3. Modal "Nova Galeria" (em `/app/galleries`)
```
Campos:
- Nome* (text)
- Cliente* (select de /api/clients)
- Ensaio (select de /api/shoots, filtrado pelo cliente selecionado, optional)
- Senha (text, optional — para galeria protegida)
- Permitir Download (toggle, default true)
- Permitir Favoritos (toggle, default true)
- Máximo de Seleções (number, optional)
- Data de Expiração (date, optional)
- Mensagem de Boas-vindas (textarea)

Botões:
- "Cancelar" → fecha
- "Criar Galeria" → POST /api/galleries → toast → refetch
```

### 4. Modal "Novo Post" (em `/app/blog`)
```
Campos:
- Título* (text, min 5)
- Slug (text, auto-gerado do título, editável — usar slugify() de constants)
- Resumo/Excerpt (textarea, max 500)
- Conteúdo* (textarea grande, min 50 chars — campo alto com scroll)
- URL da Capa (text/url)
- Categoria (select: usar BLOG_CATEGORIES de constants)
- Tags (input com chips)
- SEO Título (text, max 100)
- SEO Descrição (textarea, max 200)

Botões:
- "Cancelar"
- "Salvar Rascunho" → POST /api/blog com status: "draft"
- "Publicar" → POST /api/blog com status: "published"
```

### 5. Modal "Nova Proposta" (em `/app/proposals`)
```
Campos:
- Cliente* (select de /api/clients)
- Serviço* (text)
- Pacote (text, optional)
- Validade* (date)
- Notas (textarea)
- Items da Proposta (lista dinâmica):
  - Descrição (text)
  - Quantidade (number)
  - Valor Unitário (number, R$)
  - Total da linha (calculado: qty × unit, readonly)
  - Botão [-] remover linha
  - Botão [+] adicionar nova linha
- Desconto (number, R$)
- Subtotal (calculado, readonly)
- Total (calculado: subtotal - desconto, readonly)

Botões:
- "Cancelar"
- "Criar Proposta" → POST /api/proposals → toast → refetch

UX:
- Começar com 1 item, botão para adicionar mais
- Recalcular totais em tempo real a cada mudança
```

### 6. Modal "Novo Contrato" (em `/app/contracts`)
```
Campos:
- Cliente* (select de /api/clients)
- Título* (text)
- Serviço* (text)
- Valor (number, R$)
- Termos* (textarea grande, min 50 chars)
- Cláusulas (lista dinâmica de text inputs, adicionar/remover)

Botões:
- "Cancelar"
- "Criar Contrato" → POST /api/contracts → toast → refetch
```

### 7. Modal "Nova Cobrança" (em `/app/finance`)
```
Campos:
- Cliente* (select de /api/clients)
- Descrição* (text)
- Valor* (number, R$)
- Data de Vencimento* (date)
- Notas (textarea, optional)

Botões:
- "Cancelar"
- "Criar Cobrança" → POST /api/invoices → toast → refetch
```

### 8. Modal "Nova Tarefa" (em `/app/tasks`)
```
Campos:
- Título* (text, min 2)
- Descrição (textarea)
- Prioridade (select: Baixa, Média, Alta, Urgente — usar PRIORITY de constants)
- Status (select: Backlog, Hoje, Em Progresso — usar TASK_STATUS)
- Data de Vencimento (date, optional)
- Cliente (select de /api/clients, optional)

Botões:
- "Cancelar"
- "Criar Tarefa" → POST /api/tasks → toast → refetch
```

## Design Pattern para todos os modais:

```typescript
function CreateModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ ... });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: create, loading } = useApiMutation("/api/endpoint", "POST");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "Nome é obrigatório";
    // ... mais validações
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const result = await create(form);
    if (result.success) {
      onClose();
      onSuccess();
    } else {
      setErrors({ _general: result.error || "Erro ao criar" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Item">
      <div className="space-y-4">
        {errors._general && <p className="text-red-400 text-sm">{errors._general}</p>}
        <div>
          <label className="text-sm text-zinc-400">Nome *</label>
          <input
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-[#c9a96e] focus:outline-none"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        {/* ... mais campos ... */}
        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#c9a96e] text-black rounded-lg hover:bg-[#b8944f] disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

## Ao finalizar:

1. Verificar que todos os 8 formulários fazem POST real à API
2. Verificar validação de campos obrigatórios
3. Verificar toasts de sucesso/erro
4. Rodar `npm run build`
5. Fazer `git add . && git commit -m "feat(frontend): add creation modals for all entities" && git push origin main`

---

# 📌 PROMPT 3 — AÇÕES DE EDIÇÃO, STATUS E EXCLUSÃO

## Contexto

Você é o CHAT 2 (FRONTEND). Faça `git pull origin main`. As páginas estão conectadas e os modais de criação funcionam. Agora é hora de adicionar todas as ações de edição, mudança de status e exclusão.

## Missão

Adicionar funcionalidades completas de EDITAR, MUDAR STATUS e EXCLUIR em todas as páginas que precisam.

## Ações a implementar por página:

### 1. `/app/clients` — Edição e Exclusão
```
- Clicar no cliente abre drawer/modal de EDIÇÃO (não criação)
- Formulário pré-preenchido com dados atuais
- Botão "Salvar" → PATCH /api/clients/[id] → toast → refetch
- Botão "Excluir" → ConfirmDialog → DELETE /api/clients/[id] → toast → refetch
- Mudança de status inline (select ou dropdown no card)
```

### 2. `/app/shoots` — Status Flow e Edição
```
- Botão "Próximo Status" no card do ensaio:
  lead → confirmed → photographed → editing → delivered → paid
- Botão "Cancelar" para marcar como cancelled
- Modal de edição com todos os campos pré-preenchidos
- PATCH /api/shoots/[id] com { status: novoStatus }
- Botão "Excluir" → ConfirmDialog → DELETE /api/shoots/[id]
- Toast para cada ação
```

### 3. `/app/galleries` — Status Flow
```
- Botão "Enviar Galeria" (draft → sent) → PATCH status
- Botão "Marcar Entregue" (→ delivered) → PATCH status
- Modal de edição (nome, senha, download, favoritos, etc)
- Botão "Excluir" → ConfirmDialog → DELETE
```

### 4. `/app/photos` — Ações Individuais
```
- Toggle "Portfólio" em cada foto → PATCH /api/photos/[id] { isPortfolio: !current }
- Editar tags de cada foto
- Botão "Excluir Foto" → ConfirmDialog → DELETE /api/photos/[id]
```

### 5. `/app/blog` — Publicação e Edição
```
- Botão "Publicar" em rascunhos → PATCH /api/blog/[id] { status: "published" }
- Botão "Despublicar" → PATCH { status: "draft" }
- Modal de edição com todos os campos
- Botão "Excluir" → ConfirmDialog → DELETE
```

### 6. `/app/proposals` — Envio e Status
```
- Botão "Enviar Proposta" → PATCH /api/proposals/[id] { status: "sent" }
- Badge de status com cor correspondente
- Modal de edição com items editáveis
- Botão "Excluir" → ConfirmDialog → DELETE
- Visualizar detalhes com items (GET /api/proposals/[id])
```

### 7. `/app/contracts` — Envio
```
- Botão "Enviar Contrato" → PATCH /api/contracts/[id] { status: "sent" }
- Contratos assinados não podem ser editados (mostrar visualmente)
- Modal de edição para rascunhos
- Botão "Excluir" → ConfirmDialog → DELETE (só para rascunhos)
```

### 8. `/app/finance` — Marcar como Pago
```
- Botão "Marcar como Pago" → PATCH /api/invoices/[id] { status: "paid" }
- Botão "Cancelar Fatura" → PATCH { status: "cancelled" }
- Badge de status com cores (PAYMENT_STATUS de constants)
- Valores formatados com formatCurrency()
```

### 9. `/app/inbox` — Marcar como Lida e Responder
```
- Clicar mensagem marca como lida → PATCH /api/messages/[id]
- Campo de resposta → POST /api/messages/[id] (reply)
- Indicador visual de não lida (dot azul, negrito)
- Thread de replies ordenada por data
```

### 10. `/app/tasks` — Drag & Drop e Status
```
- Arrastar tarefa entre colunas → PATCH /api/tasks/[id] { status: novoStatus }
- Se não tem drag&drop, usar botões "Mover para..." com dropdown
- Edição inline do título
- Botão "Concluir" → PATCH { status: "done" }
- Botão "Excluir" → ConfirmDialog → DELETE
```

### 11. `/app/automations` — Toggle
```
- Switch ativo/inativo → POST /api/automations/[id] (toggle)
- Animação suave no toggle
- Toast ao ativar/desativar
```

## Padrão para ConfirmDialog:

```typescript
<ConfirmDialog
  isOpen={confirmDelete !== null}
  title="Confirmar Exclusão"
  message="Tem certeza que deseja excluir? Esta ação não pode ser desfeita."
  confirmText="Excluir"
  cancelText="Cancelar"
  variant="danger"
  onConfirm={async () => {
    const result = await useApiMutation(`/api/entity/${confirmDelete}`, "DELETE").mutate();
    if (result.success) {
      setToast({ message: "Excluído com sucesso!", type: "success" });
      refetch();
    }
    setConfirmDelete(null);
  }}
  onCancel={() => setConfirmDelete(null)}
/>
```

## Ao finalizar:

1. Testar que TODAS as ações de edição fazem PATCH real
2. Testar que TODAS as exclusões passam por ConfirmDialog
3. Testar que status muda corretamente
4. Testar toasts em todas as ações
5. Rodar `npm run build`
6. Fazer `git add . && git commit -m "feat(frontend): add edit, status change, and delete actions" && git push origin main`

---

# 📌 PROMPT 4 — ADMIN + PORTAL DO CLIENTE + BLOG PÚBLICO

## Contexto

Você é o CHAT 2 (FRONTEND). Faça `git pull origin main`. As páginas do fotógrafo estão 100% conectadas. Agora é hora de conectar as páginas do Admin, Portal do Cliente e Blog público.

## Missão

Conectar as 7 páginas admin, 4 páginas do cliente e 2 páginas do blog público à API real.

## Arquivos que você PODE editar:

```
src/app/admin/dashboard/page.tsx
src/app/admin/users/page.tsx
src/app/admin/studios/page.tsx
src/app/admin/plans/page.tsx
src/app/admin/billing/page.tsx
src/app/admin/support/page.tsx
src/app/admin/settings/page.tsx
src/app/admin/layout.tsx
src/app/client/dashboard/page.tsx
src/app/client/galleries/page.tsx
src/app/client/contracts/page.tsx
src/app/client/proposals/page.tsx
src/app/client/layout.tsx
src/app/blog/page.tsx
src/app/blog/[slug]/page.tsx
```

## Instruções por seção:

### ADMIN (7 páginas):

#### `/admin/dashboard` — Métricas do SaaS
**API:** `GET /api/analytics` (admin vê métricas gerais)
- Total de usuários, estúdios, receita MRR
- Gráfico de crescimento
- Substituir imports de mock-data

#### `/admin/users` — Gestão de Usuários
**API:** `GET /api/clients` (admin vê todos), `PATCH /api/clients/[id]`
- Listagem de todos os usuários do SaaS
- Ativar/desativar usuário
- Alterar role
- Busca por nome/email

#### `/admin/studios` — Gestão de Estúdios
**API:** use dados do analytics ou crie query customizada
- Listar todos os estúdios
- Ver uso de storage, plano, data de criação
- Pode manter dados parcialmente mockados se necessário

#### `/admin/plans` — Planos
- Usar `PLANS` de `src/lib/constants.ts` (dados estáticos)
- NÃO precisa de API — planos são fixos no código
- Apenas substituir qualquer import de mock-data

#### `/admin/billing` — Faturamento
- Pode usar dados do analytics
- Métricas de MRR, churn, crescimento

#### `/admin/support` — Suporte
- Pode manter mockado por enquanto OU
- Usar dados de /api/messages como tickets

#### `/admin/settings` — Configurações Admin
- Manter estado local (sem API)

### PORTAL DO CLIENTE (4 páginas):

#### `/client/dashboard` — Dashboard do Cliente
**API:** `GET /api/notifications`
- Mostrar galerias do cliente
- Propostas pendentes
- Contratos pendentes
- Notificações

#### `/client/galleries` — Galerias do Cliente
**API:** `GET /api/galleries` (filtradas pelo clientId do usuário logado)
- Listar galerias enviadas para o cliente
- Visualizar fotos
- Favoritar fotos
- Enviar seleção
- Se a API /api/client/* não existe, use /api/galleries com filtro

#### `/client/proposals` — Propostas do Cliente
**API:** `GET /api/proposals`
- Listar propostas enviadas para o cliente
- Botão "Aceitar" → PATCH /api/proposals/[id] { status: "accepted" }
- Botão "Recusar" → PATCH /api/proposals/[id] { status: "declined" }

#### `/client/contracts` — Contratos do Cliente
**API:** `GET /api/contracts`
- Listar contratos do cliente
- Botão "Assinar" → PATCH /api/contracts/[id] { status: "signed" }
- Mostrar contratos já assinados

### BLOG PÚBLICO (2 páginas):

#### `/blog` — Lista de Posts Publicados
**API:** `GET /api/public/blog`
- NÃO precisa de auth
- Listar posts publicados
- Substituir import de mock-data
- Se o componente é server-side, converter para client com useApi
- Ou fazer fetch direto no server component

#### `/blog/[slug]` — Post Individual
**API:** `GET /api/public/blog/[slug]`
- NÃO precisa de auth
- Mostrar post completo
- Substituir import de mock-data

## Ao finalizar:

1. Verificar que NENHUMA página admin, client ou blog importa de mock-data.ts
2. Verificar auth funciona (admin vê admin, client vê client)
3. Rodar `npm run build`
4. Fazer `git add . && git commit -m "feat(frontend): connect admin, client portal, and public blog to API" && git push origin main`

---

# 📌 PROMPT 5 — POLIMENTO FINAL: UX, LOADING STATES, RESPONSIVIDADE, ACESSIBILIDADE

## Contexto

Você é o CHAT 2 (FRONTEND). Faça `git pull origin main`. Todas as páginas estão conectadas à API com formulários e ações funcionais. Agora é hora do polimento final para tornar o SaaS perfeito.

## Missão

Garantir que TODAS as páginas tenham loading states, error handling, empty states, responsividade, acessibilidade e uma experiência premium impecável.

## Arquivos que você PODE editar:

TODOS os arquivos de páginas e componentes (exceto os proibidos no DIVISION.md)

## PARTE A — Loading States em TODAS as Páginas

Para CADA página que faz fetch da API, implementar:

```typescript
// Skeleton loading enquanto carrega
if (loading) {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

Usar o componente `Skeleton` já existente em `src/components/ui/Skeleton.tsx`.

## PARTE B — Error States

```typescript
if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Erro ao carregar dados</h3>
      <p className="text-zinc-400 mb-4">{error}</p>
      <button
        onClick={refetch}
        className="px-6 py-2 bg-[#c9a96e] text-black rounded-lg hover:bg-[#b8944f] transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
```

## PARTE C — Empty States

Para CADA página sem dados:

```typescript
if (!data?.length) {
  return (
    <EmptyState
      icon="📸" // ou ícone SVG apropriado
      title="Nenhum ensaio encontrado"
      description="Crie seu primeiro ensaio para começar a organizar seu trabalho"
      actionLabel="Novo Ensaio"
      onAction={() => setShowCreateModal(true)}
    />
  );
}
```

Empty states personalizados para cada página:
- Clientes: "Nenhum cliente ainda — Adicione seu primeiro cliente"
- Ensaios: "Agenda vazia — Crie seu primeiro ensaio"
- Galerias: "Nenhuma galeria — Crie uma galeria para seus clientes"
- Fotos: "Nenhuma foto — Faça upload das suas fotos"
- Blog: "Nenhum post — Escreva seu primeiro artigo"
- Propostas: "Nenhuma proposta — Crie uma proposta para um cliente"
- Contratos: "Nenhum contrato — Crie um contrato"
- Finanças: "Nenhuma cobrança — Registre uma cobrança"
- Tarefas: "Tudo em dia! — Nenhuma tarefa pendente"
- Mensagens: "Caixa vazia — Nenhuma mensagem"

## PARTE D — Toasts Consistentes

Garantir que TODA ação de escrita mostra toast:

| Ação | Toast |
|------|-------|
| Criar item | ✅ "Cliente criado com sucesso!" (verde) |
| Editar item | ✅ "Cliente atualizado!" (verde) |
| Excluir item | ✅ "Cliente excluído!" (verde) |
| Mudar status | ✅ "Status atualizado para: Confirmado" (verde) |
| Enviar proposta | ✅ "Proposta enviada com sucesso!" (verde) |
| Marcar como pago | ✅ "Pagamento registrado!" (verde) |
| Erro qualquer | ❌ "Erro: mensagem da API" (vermelho) |

Toast auto-dismiss após 4 segundos.

## PARTE E — Confirmação de Exclusão Consistente

TODA ação de DELETE deve passar por ConfirmDialog:

```typescript
<ConfirmDialog
  isOpen={!!itemToDelete}
  title="Excluir Cliente"
  message={`Tem certeza que deseja excluir "${itemToDelete?.name}"? Esta ação não pode ser desfeita.`}
  confirmText="Sim, Excluir"
  cancelText="Cancelar"
  variant="danger" // botão vermelho
  loading={deleting}
  onConfirm={handleDelete}
  onCancel={() => setItemToDelete(null)}
/>
```

## PARTE F — Busca com Debounce

Em todas as páginas com campo de busca:

```typescript
const [searchInput, setSearchInput] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchInput);
  }, 300);
  return () => clearTimeout(timer);
}, [searchInput]);

const { data } = useApi(`/api/clients?search=${debouncedSearch}`);
```

## PARTE G — Filtros que Atualizam a URL

```typescript
const searchParams = useSearchParams();
const router = useRouter();

const updateFilters = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  router.push(`?${params.toString()}`);
};
```

## PARTE H — Responsividade

Verificar que TODAS as páginas funcionam em:
- Desktop (1920px+): layout completo
- Tablet (768px-1024px): sidebar colapsável, grid 2 colunas
- Mobile (320px-768px): sidebar drawer, single column, modais fullscreen

Checklist:
- [ ] Dashboard: cards empilham em mobile
- [ ] Listagens: tabela vira cards em mobile
- [ ] Modais: fullscreen em mobile
- [ ] Sidebar: drawer em mobile
- [ ] Filtros: colapsáveis em mobile
- [ ] Kanban (tasks): scroll horizontal em mobile

## PARTE I — Acessibilidade

- [ ] `aria-label` em todos os botões de ícone (sem texto visível)
- [ ] `role="dialog"` nos modais
- [ ] `aria-modal="true"` nos modais
- [ ] Focus trap nos modais (Tab não sai do modal)
- [ ] `aria-live="polite"` nos toasts
- [ ] Labels em todos os inputs dos formulários
- [ ] Contraste adequado (WCAG AA)
- [ ] Suporte a navegação por teclado (Enter, Escape)
- [ ] `<label htmlFor>` em todos os campos

## PARTE J — Micro-interações e Polish

- Hover states em todos os cards (sutil scale ou shadow)
- Transições suaves nos toggles e botões (transition-all duration-200)
- Loading spinner nos botões durante operações
- Disabled state nos botões durante submit
- Indicador de campo obrigatório (*) nos formulários
- Placeholder text helpful nos inputs
- Feedback visual imediato ao clicar (active:scale-95)

## PARTE K — Eliminar Dependências Restantes de Mock Data

Verificação final:

```bash
# Este comando NÃO deve retornar nada (exceto arquivos permitidos)
grep -r "mock-data" src/app/app/ src/app/admin/ src/app/client/ src/app/blog/
grep -r "useData()" src/app/app/ src/app/admin/ src/app/client/
```

Arquivos que PODEM manter mock-data:
- `src/data/mock-data.ts` (o arquivo em si permanece, mas ninguém importa dele)
- `src/app/admin/plans/page.tsx` (planos são estáticos)
- `src/app/demo/page.tsx` (é uma demo)
- `src/app/gallery/demo/page.tsx` (é uma demo)
- `src/app/portfolio/demo/page.tsx` (é uma demo)

## Ao finalizar:

1. Verificar loading states em TODAS as páginas
2. Verificar error states em TODAS as páginas
3. Verificar empty states em TODAS as páginas
4. Verificar toasts em TODAS as ações
5. Verificar ConfirmDialog em TODAS as exclusões
6. Verificar responsividade em 3 breakpoints
7. Verificar acessibilidade
8. Rodar `npm exec tsc -- --noEmit`
9. Rodar `npm run build`
10. Fazer `git add . && git commit -m "feat(frontend): polish UX, loading states, responsive, a11y" && git push origin main`

---

# 📋 ORDEM DE EXECUÇÃO

```
PROMPT 1 ──────────> Conectar páginas do fotógrafo às APIs
     ↓
PROMPT 2 ──────────> Criar modais de criação funcionais
     ↓
PROMPT 3 ──────────> Ações de edição, status e exclusão
     ↓
PROMPT 4 ──────────> Admin + Portal do Cliente + Blog público
     ↓
PROMPT 5 ──────────> Polimento final (UX, loading, responsive, a11y)
```

**Importante:** Cada prompt DEVE ser completado e feito push ANTES de passar para o próximo.

---

# ⚠️ LEMBRETE PARA CADA PROMPT

1. **SEMPRE** faça `git pull origin main` antes de começar
2. **NUNCA** edite arquivos de API (`src/app/api/`), hooks (`src/hooks/`), libs utilitárias, schema, seed, ou configurações
3. **SEMPRE** importe de `@/hooks/useApi` e `@/lib/constants` — eles já existem
4. **SEMPRE** faça `npm run build` antes de push
5. **SEMPRE** faça `git push origin main` ao terminar
6. **NUNCA** edite `package.json` diretamente — use `install_npm_packages` se precisar de algo

---

# 🔧 REFERÊNCIA RÁPIDA — APIs DISPONÍVEIS

| Endpoint | Métodos | Descrição |
|----------|---------|-----------|
| `/api/clients` | GET, POST | Listar/criar clientes |
| `/api/clients/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir cliente |
| `/api/shoots` | GET, POST | Listar/criar ensaios |
| `/api/shoots/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir ensaio |
| `/api/galleries` | GET, POST | Listar/criar galerias |
| `/api/galleries/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir galeria |
| `/api/photos` | GET, POST | Listar/criar fotos |
| `/api/photos/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir foto |
| `/api/blog` | GET, POST | Listar/criar posts |
| `/api/blog/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir post |
| `/api/public/blog` | GET | Posts publicados (público) |
| `/api/public/blog/[slug]` | GET | Post por slug (público) |
| `/api/proposals` | GET, POST | Listar/criar propostas |
| `/api/proposals/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir proposta |
| `/api/contracts` | GET, POST | Listar/criar contratos |
| `/api/contracts/[id]` | GET, PATCH, DELETE | Detalhar/editar/excluir contrato |
| `/api/invoices` | GET, POST | Listar/criar faturas |
| `/api/invoices/[id]` | GET, PATCH | Detalhar/atualizar fatura |
| `/api/messages` | GET, POST | Listar/criar mensagens |
| `/api/messages/[id]` | GET, PATCH, POST | Detalhes/marcar lida/responder |
| `/api/automations` | GET, POST | Listar/criar automações |
| `/api/automations/[id]` | GET, PATCH, DELETE, POST | Detalhar/editar/excluir/toggle |
| `/api/notifications` | GET, POST | Listar/marcar todas lidas |
| `/api/notifications/[id]` | PATCH, DELETE | Marcar lida/excluir |
| `/api/analytics` | GET | Métricas do estúdio |
| `/api/tasks` | GET, POST | Listar/criar tarefas |
| `/api/tasks/[id]` | PATCH, DELETE | Editar/excluir tarefa |
| `/api/auth/me` | GET | Dados do usuário logado |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/assistant/parse` | POST | Processar comando NLP |
| `/api/finance` | GET | Dados financeiros |

## Formato de Resposta de TODAS as APIs:

```json
// Sucesso
{ "success": true, "data": { ... } }

// Sucesso com paginação
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}

// Erro
{ "success": false, "error": "Mensagem de erro" }
```

## Hook useApi — Como usar:

```typescript
import { useApi, useApiMutation, invalidateCache } from "@/hooks/useApi";

// GET data
const { data, loading, error, refetch } = useApi<MyType>("/api/endpoint");

// POST/PATCH/DELETE
const { mutate, loading: saving } = useApiMutation("/api/endpoint", "POST");
const result = await mutate({ name: "Test" });
if (result.success) { refetch(); }

// Invalidar cache de um padrão de URL
invalidateCache("/api/clients*");
```

## Constants — Como usar:

```typescript
import {
  SHOOT_STATUS,
  GALLERY_STATUS,
  PROPOSAL_STATUS,
  CONTRACT_STATUS,
  PAYMENT_STATUS,
  TASK_STATUS,
  PRIORITY,
  CLIENT_STATUS,
  BLOG_STATUS,
  SHOOT_TYPES,
  BLOG_CATEGORIES,
  MESSAGE_TYPES,
  AUTOMATION_TRIGGERS,
  PLANS,
  formatCurrency,
  formatDate,
  getInitials,
  slugify,
  truncate,
  getStatusInfo,
} from "@/lib/constants";

// Exemplo de uso
const statusInfo = SHOOT_STATUS["confirmed"];
// { label: "Confirmado", color: "bg-blue-500", textColor: "text-blue-500", icon: "CheckCircle" }

formatCurrency(15000); // "R$ 150,00" (valores em centavos)
formatDate("2025-01-15"); // "15/01/2025"
getInitials("Marina Oliveira"); // "MO"
slugify("Meu Post Incrível"); // "meu-post-incrivel"
```
