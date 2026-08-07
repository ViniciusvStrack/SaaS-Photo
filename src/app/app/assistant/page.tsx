"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCommand, type ParseResult, type SuggestedAction } from "@/lib/nlp-parser";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  parseResult?: ParseResult;
}

const EXAMPLE_COMMANDS = [
  "Marcar ensaio da Julia sábado às 15h no parque, pacote retrato, R$ 450",
  "Cliente Ana marcou para dia 28 de agosto às 18h, evento corporativo, R$ 750, sinal de R$ 200",
  "Lembrar de entregar as fotos do casamento da Bruna até sexta",
  "Lucas pagou R$ 300 de entrada hoje",
  "Criar galeria privada para Camila com senha 1234",
  "Registrar lead: Fernanda quer orçamento para casamento em novembro",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const { addClient, addShoot, addTask, addInvoice } = useData();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o **Assistente Noir** 🌙\n\nPosso ajudar você a organizar sua operação. Diga o que precisa em linguagem natural e eu vou interpretar, sugerir ações e criar registros automaticamente.\n\nExperimente algo como:\n*\"Marcar ensaio da Julia sábado às 15h no parque, retrato, R$ 450\"*",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const result = parseCommand(input);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: buildAssistantResponse(result),
      timestamp: new Date().toISOString(),
      parseResult: result,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsProcessing(false);
  };

  const buildAssistantResponse = (result: ParseResult): string => {
    if (result.suggestedActions.length === 0) {
      return "Não consegui identificar uma ação clara. Tente reformular incluindo nome do cliente, data, horário ou tipo de serviço.\n\nExemplo: *\"Marcar ensaio da Ana dia 15 às 14h\"*";
    }

    let response = "Entendi! Aqui está o que identifiquei:\n\n";
    response += `📋 **${result.summary}**\n\n`;
    
    if (result.confidence >= 0.8) {
      response += `Confiança: **${Math.round(result.confidence * 100)}%** ✅\n\n`;
    } else {
      response += `Confiança: **${Math.round(result.confidence * 100)}%** ⚠️\n\n`;
    }

    response += `Encontrei **${result.suggestedActions.length}** ações sugeridas. Revise e aplique:`;

    if (result.warnings.length > 0) {
      response += "\n\n⚠️ " + result.warnings.join("\n⚠️ ");
    }

    return response;
  };

  const handleApplyAction = (msgId: string, actionId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== msgId || !msg.parseResult) return msg;
        const updatedActions = msg.parseResult.suggestedActions.map(a => {
          if (a.id !== actionId) return a;
          // Actually apply the action
          applyAction(a);
          return { ...a, applied: true };
        });
        return {
          ...msg,
          parseResult: { ...msg.parseResult, suggestedActions: updatedActions },
        };
      })
    );
  };

  const handleApplyAll = (msgId: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== msgId || !msg.parseResult) return msg;
        const updatedActions = msg.parseResult.suggestedActions.map(a => {
          if (!a.applied) {
            applyAction(a);
          }
          return { ...a, applied: true };
        });
        return {
          ...msg,
          parseResult: { ...msg.parseResult, suggestedActions: updatedActions },
        };
      })
    );
    showToast("Todas as ações foram aplicadas!", "success");
  };

  const applyAction = (action: SuggestedAction) => {
    const data = action.data;
    switch (action.type) {
      case "create_client":
      case "register_lead":
        addClient({
          photographerId: user?.id || "photo-1",
          name: (data.name as string) || "Novo Cliente",
          email: "",
          phone: "",
          status: action.type === "register_lead" ? "lead" : "scheduled",
          type: (data.type as string) || "Geral",
          tags: [],
          totalRevenue: 0,
          shootCount: 0,
          notes: (data.notes as string) || "",
        });
        showToast(`Cliente ${data.name || ""} cadastrado`, "success");
        break;
      case "create_shoot":
        addShoot({
          photographerId: user?.id || "photo-1",
          clientId: "",
          clientName: (data.clientName as string) || "Cliente",
          name: (data.name as string) || "Novo Ensaio",
          type: (data.type as string) || "Ensaio",
          date: (data.date as string) || "",
          time: (data.time as string) || "",
          location: (data.location as string) || "",
          status: "confirmed",
          value: (data.value as number) || 0,
          notes: "",
          checklist: [
            { item: "Contrato enviado", done: false },
            { item: "Pagamento confirmado", done: false },
            { item: "Briefing preenchido", done: false },
            { item: "Equipamento preparado", done: false },
          ],
        });
        showToast("Ensaio criado na agenda", "success");
        break;
      case "create_task":
      case "create_reminder":
        addTask({
          photographerId: user?.id || "photo-1",
          title: (data.title as string) || "Nova tarefa",
          description: (data.description as string) || "",
          status: "today",
          priority: "medium",
          dueDate: (data.dueDate as string) || undefined,
        });
        showToast("Tarefa criada", "success");
        break;
      case "create_invoice":
        addInvoice({
          photographerId: user?.id || "photo-1",
          clientId: "",
          clientName: (data.clientName as string) || "Cliente",
          description: "Pagamento",
          items: [{ description: "Serviço fotográfico", quantity: 1, unitPrice: (data.value as number) || 0, total: (data.value as number) || 0 }],
          subtotal: (data.value as number) || 0,
          tax: 0,
          total: (data.value as number) || 0,
          status: (data.status as "pending" | "paid") || "pending",
          dueDate: new Date().toISOString().split("T")[0],
          paidAt: (data.status as string) === "paid" ? new Date().toISOString().split("T")[0] : undefined,
        });
        showToast("Cobrança registrada", "success");
        break;
      default:
        showToast(`Ação "${action.label}" aplicada`, "success");
    }
  };

  const actionTypeIcons: Record<string, string> = {
    create_client: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z",
    register_lead: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z",
    create_shoot: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86",
    create_event: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5",
    create_task: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2",
    create_reminder: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5",
    create_invoice: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2",
    create_proposal: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586",
    create_gallery: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16",
    send_message: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8",
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Assistente Noir <span className="text-gold">✨</span>
          </h1>
          <p className="text-noir-500 text-sm">Diga o que precisa em linguagem natural</p>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-2xl rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-gold/10 border border-gold/20 ml-12"
                  : "bg-white/[0.03] border border-white/5 mr-12"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-[10px]">✨</span>
                    </div>
                    <span className="text-xs text-gold font-medium">Assistente Noir</span>
                  </div>
                )}

                {/* Render message content */}
                <div className="text-sm text-noir-300 whitespace-pre-wrap leading-relaxed">
                  {msg.content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith("*") && part.endsWith("*")) {
                      return <em key={i} className="text-noir-400">{part.slice(1, -1)}</em>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>

                {/* Suggested actions */}
                {msg.parseResult && msg.parseResult.suggestedActions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {msg.parseResult.suggestedActions.map(action => (
                      <div
                        key={action.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          action.applied
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-white/[0.02] border-white/5 hover:border-gold/20"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          action.applied ? "bg-green-500/20" : "bg-gold/10"
                        }`}>
                          {action.applied ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                              <path d={actionTypeIcons[action.type] || "M12 5v14M5 12h14"} />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium ${action.applied ? "text-green-400" : "text-white"}`}>
                            {action.label}
                          </div>
                          <div className="text-[10px] text-noir-500 truncate">{action.description}</div>
                        </div>
                        {!action.applied && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleApplyAction(msg.id, action.id)}
                          >
                            Aplicar
                          </Button>
                        )}
                        {action.applied && (
                          <span className="text-[10px] text-green-400 font-medium">✓ Aplicado</span>
                        )}
                      </div>
                    ))}

                    {msg.parseResult.suggestedActions.some(a => !a.applied) && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleApplyAll(msg.id)}
                      >
                        Aplicar tudo ({msg.parseResult.suggestedActions.filter(a => !a.applied).length} ações)
                      </Button>
                    )}
                  </div>
                )}

                {/* Entities preview */}
                {msg.parseResult && msg.parseResult.entities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {msg.parseResult.entities.map((entity, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-gold/10 text-gold border border-gold/20">
                        {entity.type === 'client_name' ? '👤' :
                         entity.type === 'date' ? '📅' :
                         entity.type === 'time' ? '🕐' :
                         entity.type === 'location' ? '📍' :
                         entity.type === 'value' ? '💰' :
                         entity.type === 'event_type' ? '📸' : '📝'
                        } {entity.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mr-12">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-[10px]">✨</span>
                </div>
                <span className="text-xs text-gold">Analisando...</span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "0.15s" }} />
                <div className="w-2 h-2 rounded-full bg-gold/40 animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Example commands */}
      {messages.length <= 1 && (
        <div className="shrink-0 mb-3">
          <p className="text-xs text-noir-500 mb-2">Experimente:</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_COMMANDS.slice(0, 4).map((cmd, i) => (
              <button
                key={i}
                onClick={() => setInput(cmd)}
                className="px-3 py-1.5 rounded-full text-[11px] bg-white/[0.03] border border-white/5 text-noir-400 hover:text-gold hover:border-gold/20 transition-all truncate max-w-xs"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 flex gap-2">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Diga o que precisa... Ex: marcar ensaio da Julia sábado às 15h"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all pr-12"
            disabled={isProcessing}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold text-sm">✨</div>
        </div>
        <Button onClick={handleSend} disabled={!input.trim() || isProcessing} className="shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
