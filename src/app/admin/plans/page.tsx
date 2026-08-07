"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockPlans } from "@/data/mock-data";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function AdminPlansPage() {
  const [editPlan, setEditPlan] = useState<typeof mockPlans[0] | null>(null);
  const { showToast } = useToast();

  const handleSave = () => {
    showToast("Plano atualizado com sucesso", "success");
    setEditPlan(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Planos</h1>
          <p className="text-noir-500 text-sm mt-1">Gerencie os planos de assinatura</p>
        </div>
        <Button leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>}>
          Novo plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlans.filter(p => p.monthlyPrice > 0).map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white/[0.02] border rounded-xl p-6 relative ${plan.isPopular ? "border-gold/30" : "border-white/5"}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-noir-deep text-[10px] font-bold rounded-full">
                MAIS POPULAR
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-noir-500 mt-1">{plan.description}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${plan.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {plan.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-gold">R$ {plan.monthlyPrice}</span>
              <span className="text-noir-500 text-sm">/mês</span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-noir-500">Armazenamento</span>
                <span className="text-white">{plan.storageGB} GB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-noir-500">Clientes</span>
                <span className="text-white">{plan.maxClients}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-noir-500">Galerias</span>
                <span className="text-white">{plan.maxGalleries}</span>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              {plan.features.slice(0, 5).map((feature, fi) => (
                <div key={fi} className="flex items-center gap-2 text-xs text-noir-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold shrink-0">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
              {plan.features.length > 5 && (
                <p className="text-xs text-noir-600">+{plan.features.length - 5} recursos</p>
              )}
            </div>

            <Button variant="secondary" className="w-full" onClick={() => setEditPlan(plan)}>
              Editar Plano
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={!!editPlan}
        onClose={() => setEditPlan(null)}
        title={`Editar ${editPlan?.name}`}
        size="lg"
      >
        {editPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" defaultValue={editPlan.name} />
              <Input label="Preço Mensal (R$)" type="number" defaultValue={editPlan.monthlyPrice} />
              <Input label="Preço Anual (R$)" type="number" defaultValue={editPlan.yearlyPrice} />
              <Input label="Armazenamento (GB)" type="number" defaultValue={editPlan.storageGB} />
              <Input label="Max Clientes" type="number" defaultValue={editPlan.maxClients} />
              <Input label="Max Galerias" type="number" defaultValue={editPlan.maxGalleries} />
            </div>

            <div>
              <label className="block text-xs text-noir-400 mb-2">Recursos inclusos</label>
              <div className="grid grid-cols-2 gap-2">
                {["Portfólio", "Blog", "Automações", "Portal Cliente", "Suporte Prioritário"].map(feature => (
                  <label key={feature} className="flex items-center gap-2 text-sm text-noir-300 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-white/20 bg-white/5 accent-gold" />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setEditPlan(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
