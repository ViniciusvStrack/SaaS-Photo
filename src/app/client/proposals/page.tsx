"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Proposal } from "@/types";

export default function ClientProposalsPage() {
  const { proposals, updateProposal } = useData();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Proposal | null>(null);

  const myProposals = proposals.filter(p => p.clientId === "c1");

  const handleAccept = () => {
    if (!selected) return;
    updateProposal(selected.id, {
      status: "accepted",
      respondedAt: new Date().toISOString().split("T")[0],
    });
    showToast("Proposta aceita! O fotógrafo entrará em contato.", "success");
    setSelected(null);
  };

  const handleDecline = () => {
    if (!selected) return;
    updateProposal(selected.id, {
      status: "declined",
      respondedAt: new Date().toISOString().split("T")[0],
    });
    showToast("Proposta recusada.", "info");
    setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Propostas</h1>
      <p className="text-noir-500 text-sm mb-8">Visualize e responda propostas</p>

      <div className="space-y-4">
        {myProposals.map((proposal, i) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(proposal)}
            className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{proposal.service}</h3>
              <p className="text-xs text-noir-500">{proposal.package} • Válida até {proposal.validUntil}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gold">R$ {proposal.total.toLocaleString()}</div>
              <Badge status={proposal.status} size="sm" />
            </div>
          </motion.div>
        ))}
        {myProposals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5" />
              </svg>
            </div>
            <p className="text-sm text-noir-500">Nenhuma proposta ainda</p>
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.service} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-lg">
              <div>
                <span className="text-sm text-gold">Valor Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gold">R$ {selected.total.toLocaleString()}</span>
                  {selected.discount > 0 && (
                    <span className="text-xs text-noir-500 line-through">R$ {selected.subtotal.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <Badge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Pacote</span>
                <span className="text-sm text-white">{selected.package}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Válida até</span>
                <span className="text-sm text-white">{selected.validUntil}</span>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-4">
              <span className="text-xs text-noir-500 block mb-3">Itens inclusos</span>
              <ul className="space-y-2">
                {selected.items.map(item => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-noir-300 flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {item.description}
                    </span>
                    {item.quantity > 1 && <span className="text-noir-500 text-xs">x{item.quantity}</span>}
                  </li>
                ))}
              </ul>
            </div>

            {selected.notes && (
              <div className="bg-white/[0.03] rounded-lg p-4">
                <span className="text-xs text-noir-500 block mb-1">Observações</span>
                <p className="text-sm text-noir-300">{selected.notes}</p>
              </div>
            )}

            {selected.status === "sent" && (
              <div className="flex gap-2 pt-2">
                <Button variant="danger" className="flex-1" onClick={handleDecline}>
                  Recusar
                </Button>
                <Button className="flex-1" onClick={handleAccept}>
                  Aceitar Proposta
                </Button>
              </div>
            )}

            {selected.status === "accepted" && (
              <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400 mx-auto mb-2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                <p className="text-sm text-green-400 font-medium">Proposta aceita!</p>
                <p className="text-xs text-noir-500 mt-1">O fotógrafo entrará em contato</p>
              </div>
            )}

            {selected.status !== "sent" && selected.status !== "accepted" && (
              <Button variant="secondary" className="w-full" onClick={() => setSelected(null)}>
                Fechar
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
