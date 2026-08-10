# NoirFrame Intelligence — arquitetura do módulo

## 1. Arquitetura e fluxo

```text
Texto | Voz → transcrição | Formulário
                 ↓
        normalização pt-BR
                 ↓
     extrator local determinístico
                 ↓ confiança baixa/ambiguidade
   adaptador LLM opcional (JSON Schema estrito)
                 ↓
       validação + regras de negócio
                 ↓
       conversa para completar/corrigir
                 ↓
          resumo para confirmação
                 ↓ confirmação explícita
          executor ORM + auditoria
                 ↓
   clientes / ensaios / faturas / tarefas
```

A opção recomendada é híbrida. Regras locais resolvem datas, horários, moeda e comandos frequentes com baixa latência e sem custo por token. Um LLM com saída estruturada entra somente quando a confiança fica abaixo do limite ou a linguagem foge dos padrões. O modelo nunca recebe acesso SQL nem grava diretamente: ele produz dados, o servidor valida, o usuário confirma e o executor usa Drizzle ORM.

Arquivos principais:

- `src/lib/ai/entity-extractor.ts`: extração determinística e validações.
- `src/lib/ai/conversation-engine.ts`: estado multi-turno, perguntas, correções e confirmação.
- `src/lib/ai/llm-contract.ts`: prompt de sistema e JSON Schema do fallback por LLM.
- `src/app/api/assistant/conversation/route.ts`: entrada autenticada do chat.
- `src/app/api/assistant/execute/route.ts`: persistência segura após confirmação.
- `src/app/app/assistant/page.tsx`: texto, ditado e formulário.

## 2. Persistência

O MVP reutiliza `clients`, `shoots`, `invoices`, `tasks`, `notifications` e `audit_logs`. Para uma evolução sem sobrecarregar `shoots`, recomenda-se:

```sql
event_categories(id, studio_id, name, slug, color, is_active, created_at)
event_details(id, shoot_id, guest_count, level, metadata_jsonb, created_at, updated_at)
payments(id, studio_id, invoice_id, amount_cents, method, paid_at, status, external_ref)
ai_conversations(id, studio_id, user_id, status, draft_jsonb, expires_at, created_at, updated_at)
ai_messages(id, conversation_id, role, channel, content, extraction_jsonb, created_at)
```

Relacionamentos: `event_details.shoot_id → shoots.id`, `payments.invoice_id → invoices.id`, mensagens pertencem a uma conversa. Categorias são isoladas por `studio_id`. Valores são inteiros em centavos. Campos extensíveis ficam em `jsonb`, sem substituir colunas essenciais indexáveis.

## 3. Contrato do LLM

O prompt e o schema executáveis estão em `src/lib/ai/llm-contract.ts`. Regras centrais:

- extrair apenas fatos explícitos;
- nunca inferir mês, valor, nome ou local;
- devolver `null` e registrar a ambiguidade;
- separar comandos com múltiplos eventos;
- usar ISO `YYYY-MM-DD`, horário `HH:mm` e BRL em centavos;
- não executar ações.

O adaptador futuro deve validar a resposta com Zod antes de convertê-la em `ExtractedEvent`. O executor aceita apenas uma lista fechada de ações e usa valores parametrizados pelo ORM.

## 4. Conversa e confirmação

Estados: `initial → collecting → confirming → done`. Dados críticos são cliente, tipo e data. Ambiguidades interrompem o fluxo. Durante `confirming`, comandos como “muda o horário para 19h” atualizam somente o campo indicado e geram novo resumo. “Sim” libera as ações, mas uma segunda ação explícita na interface, “Salvar registros”, ainda é necessária para persistir. “Não” cancela e limpa o rascunho.

Atualização ou cancelamento de um evento já persistido deve primeiro pesquisar candidatos por `studio_id`, cliente e data, apresentar o registro encontrado e exigir confirmação antes de `PATCH`. Nunca selecionar silenciosamente quando houver dois candidatos.

## 5. Exemplos e resultados esperados

1. Entrada completa: “Vinicius marcou casamento dia 15/08 às 18h, valor total R$ 5.000, pagou R$ 3.500, 120 convidados, premium, local Espaço Jardins”. Resultado: evento estruturado, pagamento parcial, saldo de R$ 1.500 e pedido de confirmação.
2. Data ambígua: “Marina marcou ensaio dia 15 às 14h”. Resultado: não define mês; pergunta qual é o mês.
3. Informação incompleta: “Casamento no Espaço Jardins”. Resultado: pergunta cliente e data antes de confirmar.
4. Correção: após o resumo, “muda o horário para 19h”. Resultado: altera somente `time`, reapresenta o resumo e pede nova confirmação.
5. Múltiplos eventos: “Ana casamento 15/08; Bruno aniversário 20/08”. Resultado: não mistura registros; solicita um evento por mensagem.
6. Pagamento sem total: “Lucas pagou R$ 300 de entrada hoje”. Resultado: registra valor pago, avisa que falta o total para calcular saldo e solicita contexto do evento/cliente.
7. Data passada: comando com data anterior ao dia atual. Resultado: alerta de inconsistência e exige confirmação/correção.

## 6. Custo e desempenho

- Executar regras locais primeiro; chamar LLM apenas abaixo de `0.55` ou diante de ambiguidade não solucionável.
- Manter prompt estável e curto para aproveitar cache de prefixo do provedor.
- Cachear somente extrações idênticas e não sensíveis por poucos minutos; nunca cachear execução.
- Enviar apenas o rascunho atual e as últimas mensagens relevantes, não todo o histórico indefinidamente.
- Usar modelo de menor custo que passe nos casos de avaliação; elevar o modelo somente no fallback.
- Medir precisão por campo, taxa de esclarecimento, correções após resumo, latência p95 e custo por evento confirmado.
- Transcrição do navegador é um canal conveniente, não fonte final: o texto transcrito sempre passa pelo mesmo fluxo de validação e confirmação.

## 7. Segurança e operação

- Autenticação e isolamento por `studio_id` em todas as consultas.
- Nenhum SQL gerado pelo modelo.
- Zod/JSON Schema na fronteira e enums fechados no executor.
- Confirmação humana antes de mutações.
- Auditoria com origem `ai_assistant`.
- Idempotência/deduplicação para cliente já existente.
- TTL para rascunhos; produção deve trocar o `Map` em memória por Redis ou PostgreSQL para funcionar com múltiplas instâncias.
