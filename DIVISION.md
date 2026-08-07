# 🔀 DIVISÃO DE TRABALHO — NoirFrame SaaS

## Regra de Ouro: NENHUM CHAT EDITA ARQUIVO DO OUTRO

---

## 🟦 CHAT 1 — BACKEND (API + Dados + Utilitários)

### Responsabilidades:
- Criar TODAS as API routes faltantes
- Criar o hook `useApi` reutilizável
- Criar `lib/constants.ts` com constantes de UI
- Expandir o seed com mais dados realistas
- Garantir que todas as APIs funcionem e retornem dados do banco

### Arquivos que SOMENTE o Chat 1 pode editar/criar:

```
src/app/api/**/*                  ← TODAS as API routes (existentes e novas)
src/hooks/useApi.ts               ← Hook reutilizável (CRIAR)
src/lib/constants.ts              ← Constantes de UI (CRIAR)
src/lib/auth.ts                   ← Utilitários de auth (já existe)
src/lib/api.ts                    ← Utilitários de API (já existe)
src/lib/nlp-parser.ts             ← Parser NLP (já existe)
src/db/seed.ts                    ← Seed expandido
```

### API Routes a criar (referência do PROMPT_FINAL.md):

| Domínio | Routes | Métodos |
|---------|--------|---------|
| Galleries | `/api/galleries`, `/api/galleries/[id]` | GET, POST, PATCH, DELETE |
| Photos | `/api/photos`, `/api/photos/[id]` | GET, POST, PATCH, DELETE |
| Blog | `/api/blog`, `/api/blog/[id]`, `/api/blog/[id]/publish` | GET, POST, PATCH, DELETE |
| Blog Público | `/api/public/blog`, `/api/public/blog/[slug]` | GET |
| Proposals | `/api/proposals`, `/api/proposals/[id]`, `/api/proposals/[id]/send`, `/accept`, `/decline` | GET, POST, PATCH |
| Contracts | `/api/contracts`, `/api/contracts/[id]`, `/api/contracts/[id]/send`, `/sign` | GET, POST, PATCH |
| Finance | `/api/finance/invoices`, `/api/finance/invoices/[id]` | POST, PATCH |
| Shoots | `/api/shoots/[id]` | PATCH, DELETE |
| Messages | `/api/messages`, `/api/messages/[id]/read`, `/api/messages/[id]/reply` | GET, POST, PATCH |
| Automations | `/api/automations`, `/api/automations/[id]/toggle` | GET, POST |
| Notifications | `/api/notifications`, `/api/notifications/[id]/read`, `/api/notifications/read-all` | GET, PATCH, POST |
| Admin | `/api/admin/metrics`, `/api/admin/users`, `/api/admin/users/[id]`, `/api/admin/studios`, `/api/admin/tickets` | GET, PATCH |
| Analytics | `/api/analytics` | GET |
| Client Portal | `/api/client/dashboard`, `/api/client/galleries`, `/api/client/proposals`, `/api/client/contracts`, `/api/client/galleries/[id]/favorites`, `/api/client/galleries/[id]/selection` | GET, POST |

### Formato padrão de resposta da API:

```json
// Sucesso
{ "success": true, "data": [...] }

// Erro
{ "success": false, "error": "mensagem" }
```

### Hook useApi — Contrato:

```typescript
// src/hooks/useApi.ts
export function useApi<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiMutation<T>(url: string, method: "POST" | "PATCH" | "DELETE"): {
  mutate: (data?: any) => Promise<T>;
  loading: boolean;
  error: string | null;
}
```

### Constants — Contrato:

```typescript
// src/lib/constants.ts
export const STATUS_COLORS = { ... }
export const STATUS_LABELS = { ... }
export const PRIORITY_COLORS = { ... }
export const SHOOT_STATUS_FLOW = [...]
export const GALLERY_STATUS_FLOW = [...]
```

### Ordem de execução:
1. Criar `src/hooks/useApi.ts`
2. Criar `src/lib/constants.ts`
3. Criar todas as API routes
4. Expandir `src/db/seed.ts`
5. Testar APIs com `build_and_start`
6. Push para GitHub
7. **Avisar o Chat 2 que pode começar**

---

## 🟧 CHAT 2 — FRONTEND (Páginas + Componentes + UI)

### Responsabilidades:
- Conectar TODAS as páginas do fotógrafo à API real
- Conectar TODAS as páginas admin à API
- Conectar portal do cliente à API
- Conectar páginas públicas (blog) à API
- Criar modais/formulários de criação funcionais
- Adicionar loading states, error handling, toasts
- Adicionar confirmação de exclusão
- Eliminar imports de mock-data.ts

### Arquivos que SOMENTE o Chat 2 pode editar/criar:

```
src/app/app/**/*                  ← Todas as páginas do fotógrafo (18 páginas)
src/app/admin/**/*                ← Todas as páginas admin (7 páginas)
src/app/client/**/*               ← Portal do cliente (4 páginas)
src/app/blog/**/*                 ← Blog público (2 páginas)
src/app/demo/**/*                 ← Página demo
src/app/gallery/**/*              ← Gallery demo
src/app/portfolio/**/*            ← Portfolio demo
src/app/login/**/*                ← Página de login
src/app/register/**/*             ← Página de registro
src/app/forgot-password/**/*      ← Página de esqueci senha
src/components/**/*               ← Todos os componentes UI
src/context/**/*                  ← Contexts (AuthContext, DataContext)
src/data/mock-data.ts             ← Pode remover imports (NÃO deletar o arquivo)
```

### O que o Chat 2 deve usar (criado pelo Chat 1):

```typescript
// Importar o hook do Chat 1:
import { useApi, useApiMutation } from "@/hooks/useApi";

// Importar constantes do Chat 1:
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";

// Chamar as APIs criadas pelo Chat 1:
const { data: clients, loading, refetch } = useApi("/api/clients");
const { mutate: createClient } = useApiMutation("/api/clients", "POST");
```

### Páginas a conectar (por prioridade):

| # | Página | API que usa | Ações |
|---|--------|------------|-------|
| 1 | `/app/dashboard` | analytics, shoots, tasks, notifications | Exibir métricas reais |
| 2 | `/app/clients` | clients CRUD | Listar, criar, editar, excluir |
| 3 | `/app/shoots` | shoots CRUD | Listar, criar, editar, mudar status |
| 4 | `/app/galleries` | galleries CRUD | Listar, criar, editar, mudar status |
| 5 | `/app/photos` | photos CRUD | Listar, adicionar, editar tags |
| 6 | `/app/finance` | finance, invoices | Listar, criar cobrança, marcar pago |
| 7 | `/app/tasks` | tasks CRUD | Kanban, criar, mover, excluir |
| 8 | `/app/calendar` | shoots (GET) | Exibir agenda |
| 9 | `/app/blog` | blog CRUD | Listar, criar, publicar |
| 10 | `/app/proposals` | proposals CRUD | Listar, criar, enviar |
| 11 | `/app/contracts` | contracts CRUD | Listar, criar, enviar |
| 12 | `/app/inbox` | messages | Listar, responder, marcar lida |
| 13 | `/app/analytics` | analytics | Exibir gráficos reais |
| 14 | `/app/portfolio` | photos?isPortfolio | Exibir fotos do portfólio |
| 15 | `/app/automations` | automations | Listar, ativar/desativar |
| 16 | `/app/assistant` | assistant/parse + APIs | Processar comandos reais |
| 17 | `/app/settings` | auth/me + studios | Exibir e editar perfil |
| 18 | `/app/security` | Estado local OK | - |
| 19 | `/admin/*` (7 páginas) | admin APIs | Métricas, users, studios |
| 20 | `/client/*` (4 páginas) | client APIs | Dashboard, galerias, propostas |
| 21 | `/blog` + `/blog/[slug]` | public/blog | Posts publicados |

### Padrão para cada página:

```typescript
"use client";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { STATUS_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ClientsPage() {
  const { data: clients, loading, error, refetch } = useApi("/api/clients");
  const { mutate: createClient } = useApiMutation("/api/clients", "POST");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!clients?.length) return <EmptyState />;

  return (/* lista + modal de criação + toasts */);
}
```

### Ordem de execução:
1. **ESPERAR o Chat 1 terminar e fazer push**
2. Fazer `git pull` para pegar as APIs + hooks + constants
3. Conectar as páginas na ordem de prioridade acima
4. Adicionar modais de criação
5. Adicionar loading states + error handling
6. Adicionar toasts + confirmação de exclusão
7. Testar com `build_and_start`
8. Push para GitHub

---

## 🚫 ARQUIVOS PROIBIDOS (Nenhum chat deve editar)

```
src/db/schema.ts                  ← Schema já está completo
src/db/index.ts                   ← Conexão com banco
src/app/layout.tsx                ← Layout root
src/app/globals.css               ← Estilos globais
src/app/page.tsx                  ← Landing page
src/types/index.ts                ← Types compartilhados
package.json                      ← Usar install_npm_packages
tsconfig.json                     ← Não mexer
next.config.ts                    ← Não mexer
.env                              ← Não mexer
drizzle.config.json               ← Não mexer
```

---

## 📋 FLUXO DE TRABALHO

```
1. CHAT 1 (Backend) começa primeiro
   ↓
2. CHAT 1 cria APIs + hooks + constants + seed
   ↓
3. CHAT 1 faz push no GitHub
   ↓
4. CHAT 2 (Frontend) faz pull do GitHub
   ↓
5. CHAT 2 conecta páginas às APIs
   ↓
6. CHAT 2 faz push no GitHub
   ↓
7. RESULTADO: Projeto 100% funcional! 🎉
```

---

## ⚠️ INSTRUÇÕES PARA CADA CHAT

### Ao iniciar o Chat 1 (Backend), cole este prompt:

> Você é o CHAT 1 (BACKEND). Leia o arquivo `DIVISION.md` na raiz do projeto para entender sua responsabilidade. Você só pode editar arquivos listados na seção "CHAT 1". Comece criando as APIs, o hook useApi, as constants, e o seed expandido. Ao terminar, faça `git add . && git commit -m "feat: all API routes + hooks + constants + seed" && git push`.

### Ao iniciar o Chat 2 (Frontend), cole este prompt:

> Você é o CHAT 2 (FRONTEND). Leia o arquivo `DIVISION.md` na raiz do projeto para entender sua responsabilidade. Primeiro faça `git pull` para pegar as alterações do Chat 1. Você só pode editar arquivos listados na seção "CHAT 2". Conecte todas as páginas às APIs usando o hook `useApi` criado pelo Chat 1. Ao terminar, faça `git add . && git commit -m "feat: all pages connected to real API" && git push`.
