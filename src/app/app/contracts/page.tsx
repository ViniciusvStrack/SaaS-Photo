"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockContracts } from "@/lib/mock-data";

const contractStatusColors: Record<string, string> = {
  draft: "bg-noir-600/40 text-noir-400",
  sent: "bg-blue-500/20 text-blue-400",
  signed: "bg-green-500/20 text-green-400",
  completed: "bg-gold/20 text-gold",
};
const contractStatusLabels: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  signed: "Assinado",
  completed: "Concluído",
};

export default function ContractsPage() {
  const [selected, setSelected] = useState<typeof mockContracts[0] | null>(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contratos</h1>
          <p className="text-noir-500 text-sm mt-1">Gerencie contratos e documentos legais</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Novo contrato
        </motion.button>
      </div>

      <div className="space-y-3">
        {mockContracts.map((contract, i) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(contract)}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-400"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{contract.service}</h3>
              <p className="text-xs text-noir-500">{contract.clientName} • Criado em {contract.createdAt}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gold">R$ {contract.value.toLocaleString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${contractStatusColors[contract.status]}`}>{contractStatusLabels[contract.status]}</span>
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
                  <p className="text-sm text-noir-500">{selected.clientName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-noir-500 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Valor</span><span className="text-sm text-gold">R$ {selected.value.toLocaleString()}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Status</span><span className={`text-sm ${contractStatusColors[selected.status].split(" ")[1]}`}>{contractStatusLabels[selected.status]}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Criado em</span><span className="text-sm text-white">{selected.createdAt}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Assinado em</span><span className="text-sm text-white">{selected.signedAt || "—"}</span></div>
              </div>

              {selected.status === "signed" && (
                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                    <span className="text-sm text-green-400 font-medium">Contrato assinado digitalmente</span>
                  </div>
                  <p className="text-xs text-noir-400">Assinado por {selected.clientName} em {selected.signedAt}</p>
                </div>
              )}

              <div className="bg-white/[0.03] rounded-lg p-4">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
                  <p className="text-xs text-noir-500 italic">Área de assinatura</p>
                  {selected.status === "signed" || selected.status === "completed" ? (
                    <p className="text-lg text-gold mt-2 font-serif italic">{selected.clientName}</p>
                  ) : (
                    <p className="text-xs text-noir-600 mt-2">Aguardando assinatura do cliente</p>
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
