"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockTickets, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from "@/data/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function AdminSupportPage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mockTickets[0] | null>(null);
  const [reply, setReply] = useState("");
  const { showToast } = useToast();

  const filtered = filter === "all" ? mockTickets : mockTickets.filter(t => t.status === filter);

  const handleReply = () => {
    if (!reply.trim()) return;
    showToast("Resposta enviada", "success");
    setReply("");
  };

  const handleResolve = () => {
    showToast("Ticket resolvido", "success");
    setSelected(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Suporte</h1>
          <p className="text-noir-500 text-sm mt-1">{mockTickets.length} tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "open", "in_progress", "resolved", "closed"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === status
                ? "bg-gold/10 text-gold border border-gold/20"
                : "bg-white/5 text-noir-400 border border-white/5 hover:text-white"
            }`}
          >
            {status === "all" ? "Todos" : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filtered.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(ticket)}
            className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${PRIORITY_COLORS[ticket.priority]}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white truncate">{ticket.subject}</h3>
                <Badge status={ticket.priority} size="sm" />
              </div>
              <p className="text-xs text-noir-500 mb-2 line-clamp-1">{ticket.description}</p>
              <div className="flex items-center gap-3 text-xs text-noir-600">
                <span>{ticket.userName}</span>
                <span>•</span>
                <span>{ticket.createdAt}</span>
              </div>
            </div>
            <Badge status={ticket.status} />
          </motion.div>
        ))}
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject}
        description={`${selected?.userName} • ${selected?.userEmail}`}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge status={selected.status} />
              <Badge status={selected.priority} />
              <span className="text-xs text-noir-500">Criado em {selected.createdAt}</span>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-4">
              <p className="text-sm text-noir-300">{selected.description}</p>
            </div>

            {/* Messages */}
            {selected.messages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs text-noir-500 font-medium">Histórico</h4>
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.isFromSupport ? "bg-gold/5 border border-gold/10" : "bg-white/[0.03]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${msg.isFromSupport ? "text-gold" : "text-white"}`}>
                        {msg.isFromSupport ? "Suporte" : selected.userName}
                      </span>
                      <span className="text-xs text-noir-600">{msg.createdAt}</span>
                    </div>
                    <p className="text-sm text-noir-300">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply */}
            {selected.status !== "closed" && (
              <div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              {selected.status !== "closed" && selected.status !== "resolved" && (
                <>
                  <Button variant="secondary" onClick={handleReply} disabled={!reply.trim()}>
                    Responder
                  </Button>
                  <Button onClick={handleResolve}>
                    Resolver
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
