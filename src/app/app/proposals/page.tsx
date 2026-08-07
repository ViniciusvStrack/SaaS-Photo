"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockProposals, STATUS_COLORS, STATUS_LABELS, type Proposal } from "@/lib/mock-data";

export default function ProposalsPage() {
  const [selected, setSelected] = useState<Proposal | null>(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Propostas</h1>
          <p className="text-noir-500 text-sm mt-1">Gerencie orçamentos e propostas comerciais</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Nova proposta
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total enviadas", value: mockProposals.filter(p => p.status === "sent").length.toString() },
          { label: "Aceitas", value: mockProposals.filter(p => p.status === "accepted").length.toString() },
          { label: "Taxa conversão", value: `${Math.round((mockProposals.filter(p => p.status === "accepted").length / mockProposals.length) * 100)}%` },
          { label: "Valor total aceito", value: `R$ ${(mockProposals.filter(p => p.status === "accepted").reduce((s, p) => s + p.value, 0) / 1000).toFixed(1)}k` },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <span className="text-xs text-noir-500 block mb-1">{m.label}</span>
            <span className="text-xl font-bold text-white">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockProposals.map((proposal, i) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(proposal)}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white truncate">{proposal.service}</h3>
                <span className="text-xs text-noir-600">— {proposal.package}</span>
              </div>
              <p className="text-xs text-noir-500">{proposal.clientName} • Criada em {proposal.createdAt}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gold">R$ {proposal.value.toLocaleString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[proposal.status]}`}>{STATUS_LABELS[proposal.status]}</span>
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
              className="bg-noir-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selected.service}</h3>
                  <p className="text-sm text-noir-500">{selected.clientName} • Pacote {selected.package}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-noir-500 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-lg mb-4">
                <span className="text-sm text-gold">Valor total</span>
                <span className="text-2xl font-bold text-gold">R$ {selected.value.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Status</span><span className={`text-sm ${STATUS_COLORS[selected.status].split(" ")[1]}`}>{STATUS_LABELS[selected.status]}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Validade</span><span className="text-sm text-white">{selected.validity}</span></div>
              </div>

              <div className="bg-white/[0.03] rounded-lg p-4">
                <span className="text-xs text-noir-500 block mb-3">Itens inclusos</span>
                <ul className="space-y-2">
                  {selected.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-noir-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold shrink-0"><path d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
