"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockShoots, STATUS_COLORS, STATUS_LABELS, type Shoot } from "@/lib/mock-data";

export default function ShootsPage() {
  const [selected, setSelected] = useState<Shoot | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? mockShoots : mockShoots.filter(s => s.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Ensaios & Projetos</h1>
          <p className="text-noir-500 text-sm mt-1">{mockShoots.length} sessões fotográficas</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Novo ensaio
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {["all", "confirmed", "editing", "photographed", "delivered", "paid"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filter === s ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-500 hover:text-white"}`}>
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((shoot, i) => (
          <motion.div
            key={shoot.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => setSelected(shoot)}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{shoot.name}</h3>
                <p className="text-xs text-noir-500">{shoot.clientName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[shoot.status]}`}>{STATUS_LABELS[shoot.status]}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div><span className="text-[10px] text-noir-600 block">Data</span><span className="text-xs text-noir-300">{shoot.date}</span></div>
              <div><span className="text-[10px] text-noir-600 block">Horário</span><span className="text-xs text-noir-300">{shoot.time}</span></div>
              <div><span className="text-[10px] text-noir-600 block">Valor</span><span className="text-xs text-gold">R$ {shoot.value.toLocaleString()}</span></div>
            </div>
            <div className="text-xs text-noir-500 truncate mb-3">📍 {shoot.location}</div>
            <div className="flex items-center gap-1">
              {shoot.checklist.map((c, ci) => (
                <div key={ci} className={`w-2 h-2 rounded-full ${c.done ? "bg-gold" : "bg-white/10"}`} title={c.item} />
              ))}
              <span className="text-[10px] text-noir-600 ml-1">{shoot.checklist.filter(c => c.done).length}/{shoot.checklist.length}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-noir-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                  <p className="text-sm text-noir-500">{selected.clientName} • {selected.type}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-noir-500 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Data</span><span className="text-sm text-white">{selected.date}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Horário</span><span className="text-sm text-white">{selected.time}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Status</span><span className={`text-sm ${STATUS_COLORS[selected.status].split(" ")[1]}`}>{STATUS_LABELS[selected.status]}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Valor</span><span className="text-sm text-gold">R$ {selected.value.toLocaleString()}</span></div>
              </div>

              <div className="bg-white/[0.03] rounded-lg p-4 mb-4">
                <span className="text-xs text-noir-500 block mb-1">Local</span>
                <span className="text-sm text-white">{selected.location}</span>
              </div>

              {selected.notes && (
                <div className="bg-white/[0.03] rounded-lg p-4 mb-4">
                  <span className="text-xs text-noir-500 block mb-1">Briefing / Observações</span>
                  <span className="text-sm text-noir-300">{selected.notes}</span>
                </div>
              )}

              <div className="bg-white/[0.03] rounded-lg p-4">
                <span className="text-xs text-noir-500 block mb-3">Checklist</span>
                <div className="space-y-2">
                  {selected.checklist.map(c => (
                    <div key={c.item} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${c.done ? "bg-gold/20 border-gold" : "border-white/20"}`}>
                        {c.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold"><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${c.done ? "text-noir-500 line-through" : "text-white"}`}>{c.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
