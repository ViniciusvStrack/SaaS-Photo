"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockIntegrations } from "@/data/mock-data";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CATEGORY_LABELS: Record<string, string> = {
  calendar: "Calendário",
  messaging: "Mensagens",
  storage: "Armazenamento",
  payment: "Pagamento",
  social: "Redes Sociais",
  automation: "Automação",
};

const ICON_MAP: Record<string, string> = {
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "message-circle": "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  instagram: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
  "credit-card": "M1 4h22v16H1zM1 10h22",
  wallet: "M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 14a1 1 0 100 2 1 1 0 000-2z",
  cloud: "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  aperture: "M12 22a10 10 0 100-20 10 10 0 000 20z M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94",
  zap: "M13 2L3 14h9l-1 10 10-12h-9l1-10z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const { showToast } = useToast();

  const categories = [...new Set(integrations.map(i => i.category))];

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newState = !i.isConnected;
      showToast(newState ? `${i.name} conectado!` : `${i.name} desconectado`, newState ? "success" : "info");
      return {
        ...i,
        isConnected: newState,
        connectedAt: newState ? new Date().toISOString().split("T")[0] : undefined,
      };
    }));
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Integrações</h1>
        <p className="text-noir-500 text-sm mt-1">Conecte suas ferramentas favoritas</p>
      </motion.div>

      {categories.map(category => (
        <motion.div key={category} variants={fadeUp} className="mb-8">
          <h2 className="text-sm font-semibold text-white mb-4">{CATEGORY_LABELS[category] || category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.filter(i => i.category === category).map(integration => (
              <motion.div
                key={integration.id}
                whileHover={{ y: -2 }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-gold/10 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    integration.isConnected ? "bg-green-500/10" : "bg-white/5"
                  }`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={
                      integration.isConnected ? "text-green-400" : "text-noir-400"
                    }>
                      <path d={ICON_MAP[integration.icon] || "M12 5v14M5 12h14"} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                    <p className="text-xs text-noir-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {integration.isConnected ? (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Conectado {integration.connectedAt && `• ${integration.connectedAt}`}
                    </span>
                  ) : (
                    <span className="text-xs text-noir-500">Não conectado</span>
                  )}
                  <Button
                    size="sm"
                    variant={integration.isConnected ? "ghost" : "secondary"}
                    onClick={() => toggleConnection(integration.id)}
                  >
                    {integration.isConnected ? "Desconectar" : "Conectar"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
