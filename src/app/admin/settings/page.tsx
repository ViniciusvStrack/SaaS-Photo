"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("general");
  const { showToast } = useToast();

  const handleSave = () => {
    showToast("Configurações salvas", "success");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-noir-500 text-sm mt-1">Configurações da plataforma</p>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-2 mb-8 border-b border-white/5 pb-4">
        {["general", "email", "security", "api"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-gold/10 text-gold" : "text-noir-500 hover:text-white"
            }`}
          >
            {t === "general" ? "Geral" : t === "email" ? "Email" : t === "security" ? "Segurança" : "API"}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="max-w-2xl">
        {tab === "general" && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Informações da Plataforma</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome da Plataforma" defaultValue="NoirFrame" />
                <Input label="URL Base" defaultValue="https://noirframe.app" />
                <Input label="Email de Contato" defaultValue="contato@noirframe.app" />
                <Input label="Email de Suporte" defaultValue="suporte@noirframe.app" />
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Configurações de Trial</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Dias de Trial" type="number" defaultValue="14" />
                <Input label="Armazenamento Trial (GB)" type="number" defaultValue="5" />
              </div>
            </div>

            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        )}

        {tab === "email" && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Configurações SMTP</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Host SMTP" defaultValue="smtp.sendgrid.net" />
                <Input label="Porta" defaultValue="587" />
                <Input label="Usuário" defaultValue="apikey" />
                <Input label="Senha" type="password" defaultValue="••••••••" />
              </div>
            </div>

            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Segurança</h3>
              <div className="space-y-4">
                {[
                  { label: "Autenticação em dois fatores obrigatória", desc: "Exigir 2FA para todos os admins", active: true },
                  { label: "Logs de auditoria", desc: "Registrar todas as ações administrativas", active: true },
                  { label: "Bloqueio por tentativas", desc: "Bloquear após 5 tentativas de login", active: true },
                  { label: "Sessões simultâneas", desc: "Permitir múltiplas sessões por usuário", active: false },
                ].map(opt => (
                  <div key={opt.label} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm text-white block">{opt.label}</span>
                      <span className="text-xs text-noir-500">{opt.desc}</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${opt.active ? "bg-gold" : "bg-white/10"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${opt.active ? "left-5" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        )}

        {tab === "api" && (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Chaves de API</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <div>
                    <span className="text-sm text-white block">Production Key</span>
                    <span className="text-xs text-noir-500 font-mono">pk_live_••••••••••••</span>
                  </div>
                  <Button variant="ghost" size="sm">Regenerar</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <div>
                    <span className="text-sm text-white block">Sandbox Key</span>
                    <span className="text-xs text-noir-500 font-mono">pk_test_••••••••••••</span>
                  </div>
                  <Button variant="ghost" size="sm">Regenerar</Button>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Webhooks</h3>
              <Input label="URL do Webhook" placeholder="https://..." />
              <p className="text-xs text-noir-500 mt-2">Receba eventos em tempo real</p>
            </div>

            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
