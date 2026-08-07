"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockClients, STATUS_COLORS, STATUS_LABELS, type Client } from "@/lib/mock-data";

const STATUSES = ["all", "lead", "negotiation", "scheduled", "photographed", "editing", "delivered", "recurring"];

export default function ClientsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = mockClients.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-noir-500 text-sm mt-1">{mockClients.length} clientes cadastrados</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Novo cliente
        </motion.button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-600"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filter === s ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-500 hover:text-white"}`}>
              {s === "all" ? "Todos" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(client)}
            className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold shrink-0">{client.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{client.name}</div>
              <div className="text-xs text-noir-500">{client.email} • {client.city}</div>
            </div>
            <div className="hidden sm:block text-xs text-noir-500">{client.type}</div>
            <div className="hidden sm:block text-xs text-noir-500">{client.shootCount} ensaios</div>
            <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${STATUS_COLORS[client.status]}`}>{STATUS_LABELS[client.status]}</span>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" /></svg>
            </div>
            <p className="text-sm text-noir-500">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Client detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-noir-950 border-l border-white/10 h-full overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">{selected.avatar}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-noir-500 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/[0.03] rounded-lg p-4 space-y-3">
                    <h4 className="text-xs text-noir-500 font-medium uppercase tracking-wider">Contato</h4>
                    <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg><span className="text-sm text-noir-300">{selected.email}</span></div>
                    <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-500"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg><span className="text-sm text-noir-300">{selected.phone}</span></div>
                    <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg><span className="text-sm text-noir-300">{selected.city}</span></div>
                  </div>

                  <div className="bg-white/[0.03] rounded-lg p-4">
                    <h4 className="text-xs text-noir-500 font-medium uppercase tracking-wider mb-2">Informações</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-xs text-noir-600 block">Tipo</span><span className="text-sm text-white">{selected.type}</span></div>
                      <div><span className="text-xs text-noir-600 block">Ensaios</span><span className="text-sm text-white">{selected.shootCount}</span></div>
                      <div><span className="text-xs text-noir-600 block">Cliente desde</span><span className="text-sm text-white">{selected.createdAt}</span></div>
                    </div>
                  </div>

                  {selected.notes && (
                    <div className="bg-white/[0.03] rounded-lg p-4">
                      <h4 className="text-xs text-noir-500 font-medium uppercase tracking-wider mb-2">Observações</h4>
                      <p className="text-sm text-noir-300">{selected.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
