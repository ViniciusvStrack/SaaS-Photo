"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Contract } from "@/types";

export default function ClientContractsPage() {
  const { contracts, updateContract } = useData();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Contract | null>(null);

  const myContracts = contracts.filter(c => c.clientId === "c1");

  const handleSign = () => {
    if (!selected) return;
    updateContract(selected.id, {
      status: "signed",
      signedAt: new Date().toISOString().split("T")[0],
    });
    showToast("Contrato assinado com sucesso!", "success");
    setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Contratos</h1>
      <p className="text-noir-500 text-sm mb-8">Visualize e assine seus contratos</p>

      <div className="space-y-4">
        {myContracts.map((contract, i) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(contract)}
            className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-400">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{contract.title}</h3>
              <p className="text-xs text-noir-500">{contract.service} • R$ {contract.value.toLocaleString()}</p>
            </div>
            <Badge status={contract.status} />
          </motion.div>
        ))}
        {myContracts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" />
              </svg>
            </div>
            <p className="text-sm text-noir-500">Nenhum contrato ainda</p>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Serviço</span>
                <span className="text-sm text-white">{selected.service}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Valor</span>
                <span className="text-sm text-gold">R$ {selected.value.toLocaleString()}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Status</span>
                <Badge status={selected.status} />
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Data</span>
                <span className="text-sm text-white">{selected.createdAt}</span>
              </div>
            </div>

            {selected.clauses.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg p-4">
                <span className="text-xs text-noir-500 block mb-2">Cláusulas</span>
                <ul className="space-y-1">
                  {selected.clauses.map((clause, i) => (
                    <li key={i} className="text-sm text-noir-300 flex items-start gap-2">
                      <span className="text-gold">•</span>
                      {clause}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.status === "signed" || selected.status === "completed" ? (
              <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span className="text-sm text-green-400 font-medium">Contrato assinado</span>
                </div>
                <p className="text-xs text-noir-400">Assinado em {selected.signedAt}</p>
              </div>
            ) : selected.status === "sent" ? (
              <div className="bg-white/[0.03] rounded-lg p-4">
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
                  <p className="text-xs text-noir-500 mb-4">Área de assinatura digital</p>
                  <Button onClick={handleSign}>Assinar Contrato</Button>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button variant="secondary">
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
