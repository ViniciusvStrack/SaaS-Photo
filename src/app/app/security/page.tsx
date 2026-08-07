"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface SecurityItem { id: string; label: string; description: string; done: boolean; category: string }

const INITIAL_CHECKLIST: SecurityItem[] = [
  { id: "s1", label: "Autenticação em dois fatores (2FA)", description: "Adicione uma camada extra de proteção à sua conta", done: true, category: "Conta" },
  { id: "s2", label: "Senha forte e única", description: "Use pelo menos 12 caracteres com letras, números e símbolos", done: true, category: "Conta" },
  { id: "s3", label: "Email de recuperação verificado", description: "Tenha um email alternativo para recuperação", done: true, category: "Conta" },
  { id: "s4", label: "Galerias protegidas com senha", description: "Todas as galerias ativas devem ter senha", done: true, category: "Galerias" },
  { id: "s5", label: "Links de galeria com expiração", description: "Configure prazo de validade para links públicos", done: false, category: "Galerias" },
  { id: "s6", label: "Marca d'água em prévias", description: "Proteja fotos não pagas com marca d'água", done: true, category: "Galerias" },
  { id: "s7", label: "Backup 3-2-1 configurado", description: "3 cópias, 2 mídias diferentes, 1 off-site", done: false, category: "Backup" },
  { id: "s8", label: "Teste de restauração recente", description: "Verifique se seus backups funcionam", done: false, category: "Backup" },
  { id: "s9", label: "Autorização de uso de imagem", description: "Todos os clientes com autorização assinada", done: true, category: "LGPD" },
  { id: "s10", label: "Política de privacidade no site", description: "Informe como os dados são tratados", done: false, category: "LGPD" },
  { id: "s11", label: "Consentimento para publicação", description: "Autorização para uso em portfólio e redes", done: true, category: "LGPD" },
  { id: "s12", label: "Dispositivos registrados revisados", description: "Verifique acessos de dispositivos", done: true, category: "Conta" },
];

export default function SecurityPage() {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [showIncident, setShowIncident] = useState(false);
  const [incidents, setIncidents] = useState([
    { id: "inc1", type: "Link de galeria compartilhado indevidamente", date: "2025-04-15", status: "resolved", clientsAffected: 1, action: "Link desativado e nova galeria criada com senha diferente" },
  ]);
  const { showToast } = useToast();

  const doneCount = checklist.filter(i => i.done).length;
  const totalCount = checklist.length;
  const score = Math.round((doneCount / totalCount) * 100);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
    showToast("Checklist atualizado", "success");
  };

  const scoreColor = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const scoreLabel = score >= 80 ? "Excelente" : score >= 60 ? "Bom" : "Atenção necessária";

  const categories = [...new Set(checklist.map(i => i.category))];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Central de Segurança
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </h1>
        <p className="text-noir-500 text-sm mt-1">Proteja seus dados, clientes e operação</p>
      </motion.div>

      {/* Security Score */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 mb-4">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <motion.path
                d="M18 2.0845a15.9155 15.9155 0 010 31.831 15.9155 15.9155 0 010-31.831"
                fill="none"
                stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${score} ${100 - score}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-[10px] text-noir-500">/ 100</span>
            </div>
          </div>
          <span className={`text-sm font-semibold ${scoreColor}`}>{scoreLabel}</span>
          <span className="text-xs text-noir-500">{doneCount} de {totalCount} itens completos</span>
        </div>

        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Resumo de Segurança</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Galerias com senha", value: "8/10", status: "warning" },
              { label: "Links com expiração", value: "5/10", status: "warning" },
              { label: "Contratos com autorização", value: "9/10", status: "good" },
              { label: "Último backup", value: "Há 2 dias", status: "good" },
              { label: "Dispositivos ativos", value: "2", status: "good" },
              { label: "Incidentes abertos", value: incidents.filter(i => i.status !== "resolved").length.toString(), status: incidents.filter(i => i.status !== "resolved").length > 0 ? "danger" : "good" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <span className="text-xs text-noir-400">{item.label}</span>
                <span className={`text-xs font-medium ${
                  item.status === "good" ? "text-green-400" : item.status === "warning" ? "text-yellow-400" : "text-red-400"
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Checklist by Category */}
      <motion.div variants={fadeUp} className="space-y-6 mb-8">
        {categories.map(category => (
          <div key={category} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              {category === "Conta" ? "🔐" : category === "Galerias" ? "📸" : category === "Backup" ? "💾" : "🛡️"} {category}
            </h3>
            <div className="space-y-3">
              {checklist.filter(i => i.category === category).map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                      item.done ? "bg-green-500/20 border-green-500" : "border-white/20 hover:border-gold"
                    }`}
                  >
                    {item.done && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-400">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <span className={`text-sm ${item.done ? "text-noir-400" : "text-white"}`}>{item.label}</span>
                    <p className="text-xs text-noir-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Incidents */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Registro de Incidentes</h3>
          <Button size="sm" variant="danger" onClick={() => setShowIncident(true)}>
            Reportar incidente
          </Button>
        </div>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map(incident => (
              <div key={incident.id} className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  incident.status === "resolved" ? "bg-green-500/20" : "bg-red-500/20"
                }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={
                    incident.status === "resolved" ? "text-green-400" : "text-red-400"
                  }>
                    {incident.status === "resolved" 
                      ? <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                      : <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>
                    }
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{incident.type}</div>
                  <div className="text-xs text-noir-500">{incident.date} • {incident.clientsAffected} cliente(s) afetado(s)</div>
                  <div className="text-xs text-noir-400 mt-1">{incident.action}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  incident.status === "resolved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {incident.status === "resolved" ? "Resolvido" : "Aberto"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-noir-500 text-center py-8">Nenhum incidente registrado 🛡️</p>
        )}
      </motion.div>

      {/* Incident Modal */}
      <Modal isOpen={showIncident} onClose={() => setShowIncident(false)} title="Reportar Incidente de Segurança">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-noir-400 block mb-1.5">Tipo de incidente</label>
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 appearance-none">
              <option className="bg-noir-950">Link de galeria vazado</option>
              <option className="bg-noir-950">HD/SSD perdido</option>
              <option className="bg-noir-950">Conta invadida</option>
              <option className="bg-noir-950">Fotos apagadas acidentalmente</option>
              <option className="bg-noir-950">Pagamento suspeito</option>
              <option className="bg-noir-950">Tentativa de phishing</option>
              <option className="bg-noir-950">Contrato enviado para pessoa errada</option>
              <option className="bg-noir-950">Cliente pediu remoção de foto</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-noir-400 block mb-1.5">Descrição</label>
            <textarea rows={3} placeholder="Descreva o incidente..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 resize-none" />
          </div>
          <div>
            <label className="text-xs text-noir-400 block mb-1.5">Ação tomada</label>
            <textarea rows={2} placeholder="O que você fez para resolver..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 resize-none" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowIncident(false)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={() => {
              setIncidents(prev => [...prev, { id: `inc-${Date.now()}`, type: "Novo incidente", date: new Date().toISOString().split("T")[0], status: "open", clientsAffected: 0, action: "Em investigação" }]);
              setShowIncident(false);
              showToast("Incidente registrado", "warning");
            }}>
              Registrar
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
