"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Message } from "@/types";

export default function InboxPage() {
  const { user } = useAuth();
  const { messages, markMessageRead, addReply } = useData();
  const { showToast } = useToast();

  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const myMessages = messages.filter(m => m.photographerId === user?.id);
  const filtered = filter === "all" 
    ? myMessages 
    : filter === "unread" 
      ? myMessages.filter(m => !m.isRead) 
      : myMessages.filter(m => m.type === filter);

  const unreadCount = myMessages.filter(m => !m.isRead).length;

  const handleSelect = (message: Message) => {
    setSelected(message);
    if (!message.isRead) {
      markMessageRead(message.id);
    }
  };

  const handleReply = () => {
    if (!reply.trim() || !selected) return;
    addReply(selected.id, reply);
    setReply("");
    showToast("Resposta enviada", "success");
  };

  const typeLabels: Record<string, string> = {
    inquiry: "Orçamento",
    gallery_comment: "Galeria",
    approval: "Aprovação",
    general: "Geral",
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Messages List */}
      <div className={`${selected ? "hidden md:flex" : "flex"} flex-col w-full md:w-96 border-r border-white/5`}>
        <div className="p-4 border-b border-white/5">
          <h1 className="text-lg font-bold text-white">Mensagens</h1>
          <p className="text-xs text-noir-500">{unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}</p>
        </div>

        <div className="flex gap-1 p-3 border-b border-white/5">
          {["all", "unread", "inquiry", "gallery_comment"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                filter === f ? "bg-gold/10 text-gold" : "text-noir-500 hover:text-white"
              }`}
            >
              {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : f === "inquiry" ? "Orçamentos" : "Galerias"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(message => (
            <motion.div
              key={message.id}
              whileHover={{ x: 2 }}
              onClick={() => handleSelect(message)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-all ${
                selected?.id === message.id ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
              } ${!message.isRead ? "border-l-2 border-l-gold" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                  {message.clientName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${!message.isRead ? "text-white" : "text-noir-300"}`}>
                      {message.clientName}
                    </span>
                    <span className="text-[10px] text-noir-600">{typeLabels[message.type]}</span>
                  </div>
                  <p className="text-xs text-noir-500 truncate">{message.subject}</p>
                  <p className="text-[10px] text-noir-600 mt-1">{message.createdAt}</p>
                </div>
                {!message.isRead && <div className="w-2 h-2 rounded-full bg-gold shrink-0" />}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-noir-500">Nenhuma mensagem</div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className={`${selected ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white/[0.01]`}>
        {selected ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="md:hidden text-noir-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-white">{selected.subject}</h2>
                <p className="text-xs text-noir-500">{selected.clientName} • {selected.clientEmail}</p>
              </div>
              <Badge status={selected.type === "inquiry" ? "lead" : selected.type === "approval" ? "confirmed" : "sent"} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original message */}
              <div className="bg-white/[0.03] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold">
                    {selected.clientName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-white">{selected.clientName}</span>
                  <span className="text-xs text-noir-600">{selected.createdAt}</span>
                </div>
                <p className="text-sm text-noir-300 whitespace-pre-wrap">{selected.content}</p>
              </div>

              {/* Replies */}
              {selected.replies.map(r => (
                <div key={r.id} className={`rounded-lg p-4 ${r.isFromPhotographer ? "bg-gold/5 border border-gold/10 ml-8" : "bg-white/[0.03]"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium ${r.isFromPhotographer ? "text-gold" : "text-white"}`}>
                      {r.isFromPhotographer ? "Você" : selected.clientName}
                    </span>
                    <span className="text-xs text-noir-600">{r.createdAt}</span>
                  </div>
                  <p className="text-sm text-noir-300">{r.content}</p>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all resize-none"
                  rows={2}
                />
                <Button onClick={handleReply} disabled={!reply.trim()}>
                  Enviar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-noir-500">Selecione uma mensagem</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
