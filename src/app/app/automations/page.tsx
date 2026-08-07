"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const TRIGGER_LABELS: Record<string, string> = {
  before_shoot: "Antes do ensaio",
  after_shoot: "Após o ensaio",
  gallery_ready: "Galeria pronta",
  payment_due: "Pagamento próximo",
  birthday: "Aniversário do cliente",
  proposal_followup: "Follow-up de proposta",
  review_request: "Solicitação de depoimento",
};

const CHANNEL_ICONS: Record<string, string> = {
  email: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  whatsapp: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
};

export default function AutomationsPage() {
  const { user } = useAuth();
  const { automations, toggleAutomation } = useData();
  const { showToast } = useToast();

  const myAutomations = automations.filter(a => a.photographerId === user?.id);
  const activeCount = myAutomations.filter(a => a.isActive).length;
  const totalTriggers = myAutomations.reduce((sum, a) => sum + a.triggerCount, 0);

  const handleToggle = (id: string, currentState: boolean) => {
    toggleAutomation(id);
    showToast(currentState ? "Automação desativada" : "Automação ativada", currentState ? "info" : "success");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Automações</h1>
          <p className="text-noir-500 text-sm mt-1">{activeCount} ativas de {myAutomations.length} • {totalTriggers} execuções</p>
        </div>
        <Button leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>}>
          Nova automação
        </Button>
      </motion.div>

      {/* Savings insight */}
      <motion.div variants={fadeUp} className="bg-gold/5 border border-gold/10 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-sm">⚡</span>
          </div>
          <div>
            <p className="text-sm text-gold font-medium">Seu estúdio economizou ~6h esta semana com automações.</p>
            <p className="text-xs text-noir-400">{totalTriggers} mensagens enviadas automaticamente nos últimos 30 dias</p>
          </div>
        </div>
      </motion.div>

      {/* Automations Grid */}
      <div className="space-y-4">
        {myAutomations.map((automation, i) => (
          <motion.div
            key={automation.id}
            variants={fadeUp}
            whileHover={{ x: 4 }}
            className={`bg-white/[0.02] border rounded-xl p-5 transition-all ${
              automation.isActive ? "border-gold/20" : "border-white/5"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                automation.isActive ? "bg-gold/10" : "bg-white/5"
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={automation.isActive ? "text-gold" : "text-noir-500"}>
                  <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{automation.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    automation.isActive ? "bg-green-500/20 text-green-400" : "bg-noir-600/40 text-noir-400"
                  }`}>
                    {automation.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>

                {/* Trigger → Action flow */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium">
                    Quando: {TRIGGER_LABELS[automation.trigger] || automation.trigger}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-600">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="px-2 py-1 rounded bg-gold/10 text-gold text-[10px] font-medium flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={CHANNEL_ICONS[automation.channel] || ""} />
                    </svg>
                    Enviar via {automation.channel === "email" ? "Email" : "WhatsApp"}
                  </span>
                </div>

                {/* Message preview */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-3">
                  <p className="text-xs text-noir-400 italic line-clamp-2">&ldquo;{automation.message}&rdquo;</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-noir-500">
                  <span>{automation.triggerCount} execuções</span>
                  {automation.lastTriggered && <span>Última: {automation.lastTriggered}</span>}
                </div>
              </div>

              {/* Toggle */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <button
                  onClick={() => handleToggle(automation.id, automation.isActive)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    automation.isActive ? "bg-gold" : "bg-white/10"
                  }`}
                >
                  <motion.div
                    animate={{ x: automation.isActive ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
