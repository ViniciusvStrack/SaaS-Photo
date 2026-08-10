"use client";

import { useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, Send, Sparkles } from "lucide-react";
import { useApiMutation, invalidateCache } from "@/hooks/useApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type SuggestedAction = { type: "create_client" | "create_shoot" | "create_invoice" | "create_task"; label: string; data: Record<string, unknown> };
type ConversationResult = {
  message: string;
  action: "ask_missing" | "ask_confirm" | "saved" | "editing" | "cancelled" | "continue";
  step: "initial" | "collecting" | "confirming" | "editing" | "done";
  confidence: number;
  suggestedActions: SuggestedAction[];
};
type ExecuteResult = { summary: { message: string; success: number; failed: number } };
type ChatMessage = { role: "user" | "assistant"; content: string };
type FormState = { clientName: string; eventType: string; date: string; time: string; location: string; totalValue: string; paidValue: string; guestCount: string; eventLevel: string; notes: string };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const EMPTY_FORM: FormState = { clientName: "", eventType: "", date: "", time: "", location: "", totalValue: "", paidValue: "", guestCount: "", eventLevel: "", notes: "" };
const EXAMPLES = [
  "Vinicius marcou casamento dia 15/08 às 18h, valor total R$ 5.000, pagou R$ 3.500, 120 convidados, premium, local Espaço Jardins",
  "Marina quer ensaio corporativo amanhã às 14h no Studio Centro",
  "Muda o horário para 19h",
  "Lucas pagou R$ 300 de entrada hoje",
];

export default function AssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingActions, setPendingActions] = useState<SuggestedAction[]>([]);
  const [step, setStep] = useState<ConversationResult["step"]>("initial");
  const [listening, setListening] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const conversation = useApiMutation<{ text?: string; action?: "clear" }, ConversationResult>("/api/assistant/conversation", "POST");
  const execute = useApiMutation<{ actions: SuggestedAction[] }, ExecuteResult>("/api/assistant/execute", "POST");
  const { showToast } = useToast();

  async function send(text = input) {
    const cleanText = text.trim();
    if (!cleanText || conversation.loading) return;
    setInput("");
    setMessages(previous => [...previous, { role: "user", content: cleanText }]);
    const response = await conversation.mutate({ text: cleanText });
    if (!response.success || !response.data || typeof response.data.message !== "string") {
      showToast(response.error || "Não foi possível interpretar", "error");
      return;
    }
    const data = response.data;
    setMessages(previous => [...previous, { role: "assistant", content: data.message }]);
    setPendingActions(data.suggestedActions || []);
    setStep(data.step);
  }

  async function clearConversation() {
    await conversation.mutate({ action: "clear" });
    recognitionRef.current?.stop();
    setMessages([]);
    setPendingActions([]);
    setStep("initial");
    setInput("");
    setForm(EMPTY_FORM);
  }

  async function executeConfirmedActions() {
    if (!pendingActions.length) return;
    const response = await execute.mutate({ actions: pendingActions });
    if (!response.success || !response.data) {
      showToast(response.error || "Não foi possível salvar", "error");
      return;
    }
    invalidateCache("/api/*");
    showToast(response.data.summary.message, response.data.summary.failed ? "error" : "success");
    setMessages(previous => [...previous, { role: "assistant", content: response.data!.summary.message }]);
    setPendingActions([]);
    setStep("done");
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const speechWindow = window as typeof window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      showToast("Seu navegador não oferece transcrição de voz. Use texto ou formulário.", "error");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = event => setInput(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); showToast("Não foi possível transcrever o áudio.", "error"); };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function submitForm() {
    const parts = [
      form.clientName && `${form.clientName} marcou`, form.eventType,
      form.date && `dia ${form.date.split("-").reverse().join("/")}`,
      form.time && `às ${form.time}`, form.location && `local ${form.location}`,
      form.totalValue && `valor total R$ ${form.totalValue}`,
      form.paidValue && `pagou R$ ${form.paidValue}`,
      form.guestCount && `${form.guestCount} convidados`, form.eventLevel,
      form.notes && `observação: ${form.notes}`,
    ].filter(Boolean);
    if (!form.clientName || !form.eventType || !form.date) {
      showToast("Preencha cliente, tipo e data.", "error");
      return;
    }
    setShowForm(false);
    void send(parts.join(", "));
  }

  return <div className="max-w-5xl mx-auto">
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
      <div><p className="text-xs uppercase tracking-[.3em] text-gold">Noir intelligence</p><h1 className="text-3xl sm:text-4xl text-white font-semibold mt-3">Assistente de eventos</h1><p className="text-sm text-noir-500 mt-2">Interpreta, esclarece e confirma antes de salvar qualquer dado.</p></div>
      <Button variant="ghost" onClick={clearConversation} leftIcon={<RotateCcw size={15}/>}>Nova conversa</Button>
    </header>

    <section aria-live="polite" className="min-h-64 max-h-[48vh] overflow-y-auto space-y-3 p-4 sm:p-6 bg-white/[.02] border border-white/5 rounded-2xl">
      {!messages.length && <div className="h-52 flex flex-col items-center justify-center text-center"><Sparkles className="text-gold mb-4" size={28}/><p className="text-white">Conte o que aconteceu do seu jeito.</p><p className="text-xs text-noir-500 mt-2 max-w-md">Eu identifico cliente, evento, data, valores, convidados, categoria, local e observações. Se algo estiver ambíguo, pergunto antes de continuar.</p></div>}
      {messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-gold text-black" : "bg-white/5 text-noir-200 border border-white/5"}`}>{message.content.replaceAll("**", "")}</div></div>)}
    </section>

    {step === "confirming" && <div className="mt-3 flex flex-wrap gap-2"><Button onClick={() => send("sim")}>Confirmar resumo</Button><Button variant="secondary" onClick={() => setInput("muda ")}>Corrigir informação</Button><Button variant="danger" onClick={() => send("não")}>Cancelar</Button></div>}
    {!!pendingActions.length && <section className="mt-4 p-5 border border-gold/20 bg-gold/[.04] rounded-2xl"><div className="flex flex-col sm:flex-row justify-between gap-4"><div><h2 className="text-white font-medium">Pronto para salvar</h2><p className="text-xs text-noir-500 mt-1">A confirmação foi recebida. Revise as operações finais.</p></div><Button onClick={executeConfirmedActions} isLoading={execute.loading}>Salvar registros</Button></div><div className="mt-4 grid md:grid-cols-2 gap-2">{pendingActions.map((action, index) => <div key={`${action.type}-${index}`} className="p-3 bg-black/20 rounded-xl"><p className="text-xs text-gold">{action.label}</p></div>)}</div></section>}

    <div className="mt-4 p-2 bg-white/[.03] border border-white/10 rounded-2xl flex flex-col sm:flex-row gap-2"><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ex.: Vinicius marcou casamento dia 15/08 às 18h..." className="flex-1 min-h-24 bg-transparent p-3 text-white resize-none outline-none"/><div className="flex sm:flex-col gap-2 justify-end"><Button variant={listening ? "danger" : "secondary"} onClick={toggleVoice} ariaLabel="Ditado por voz">{listening ? <MicOff size={17}/> : <Mic size={17}/>}</Button><Button onClick={() => send()} isLoading={conversation.loading} ariaLabel="Enviar comando"><Send size={17}/></Button></div></div>
    <button onClick={() => setShowForm(value => !value)} className="mt-3 text-xs text-noir-500 hover:text-gold transition-colors">{showForm ? "Ocultar formulário" : "Prefiro preencher um formulário"}</button>

    {showForm && <section className="mt-4 p-5 bg-white/[.02] border border-white/5 rounded-2xl"><h2 className="text-white mb-4">Informações do evento</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"><Input label="Cliente *" value={form.clientName} onChange={event => setForm({...form, clientName:event.target.value})}/><Input label="Tipo de evento *" value={form.eventType} onChange={event => setForm({...form, eventType:event.target.value})}/><Input label="Data *" type="date" value={form.date} onChange={event => setForm({...form, date:event.target.value})}/><Input label="Horário" type="time" value={form.time} onChange={event => setForm({...form, time:event.target.value})}/><Input label="Local" value={form.location} onChange={event => setForm({...form, location:event.target.value})}/><Input label="Categoria" placeholder="Premium" value={form.eventLevel} onChange={event => setForm({...form, eventLevel:event.target.value})}/><Input label="Valor total" inputMode="decimal" value={form.totalValue} onChange={event => setForm({...form, totalValue:event.target.value})}/><Input label="Valor pago" inputMode="decimal" value={form.paidValue} onChange={event => setForm({...form, paidValue:event.target.value})}/><Input label="Convidados" type="number" min="0" value={form.guestCount} onChange={event => setForm({...form, guestCount:event.target.value})}/></div><div className="mt-3"><Input label="Observações" value={form.notes} onChange={event => setForm({...form, notes:event.target.value})}/></div><Button className="mt-4" onClick={submitForm}>Interpretar formulário</Button></section>}

    {!messages.length && <div className="mt-8 grid sm:grid-cols-2 gap-3">{EXAMPLES.map(example => <button key={example} onClick={() => setInput(example)} className="p-4 text-left text-xs text-noir-400 hover:text-white bg-white/[.02] border border-white/5 rounded-xl">{example}</button>)}</div>}
  </div>;
}
