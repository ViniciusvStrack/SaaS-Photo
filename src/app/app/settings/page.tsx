"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const TABS = ["Perfil", "Marca", "Domínio", "Plano", "Notificações", "Segurança"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Perfil");

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-noir-500 text-sm mt-1">Personalize seu estúdio e conta</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-1 mb-8 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === t ? "bg-gold/10 text-gold" : "text-noir-500 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </motion.div>

      {tab === "Perfil" && (
        <motion.div variants={fadeUp} className="max-w-2xl space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Dados Pessoais</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xl font-bold">AL</div>
              <div>
                <button className="text-xs text-gold hover:text-gold-light transition-colors">Alterar foto</button>
                <p className="text-xs text-noir-600 mt-1">JPG ou PNG, máximo 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs text-noir-500 block mb-1">Nome completo</label><input defaultValue="Ana Luísa Rodrigues" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Email</label><input defaultValue="ana@studiolumiere.com" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Telefone</label><input defaultValue="(11) 99876-5432" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Cidade</label><input defaultValue="São Paulo, SP" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Dados do Estúdio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs text-noir-500 block mb-1">Nome do estúdio</label><input defaultValue="Studio Lumière" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Especialidade</label><input defaultValue="Casamentos & Moda" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Instagram</label><input defaultValue="@studiolumiere" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Website</label><input defaultValue="studiolumiere.com.br" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-6 py-2.5 rounded-lg text-sm font-medium transition-all">
              Salvar alterações
            </motion.button>
          </div>
        </motion.div>
      )}

      {tab === "Marca" && (
        <motion.div variants={fadeUp} className="max-w-2xl space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Identidade Visual</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-noir-500 block mb-2">Logo</label>
                <div className="w-32 h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors">
                  <div className="text-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600 mx-auto mb-1"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg><span className="text-xs text-noir-600">Upload</span></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-noir-500 block mb-2">Cor principal</label>
                <div className="flex gap-3">
                  {["#c9a96e", "#c0c0c0", "#4a90d9", "#e0e0e0", "#9b59b6", "#e74c3c"].map((c, i) => (
                    <button key={c} className={`w-10 h-10 rounded-lg border-2 transition-all ${i === 0 ? "border-white" : "border-transparent hover:border-white/30"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "Plano" && (
        <motion.div variants={fadeUp} className="max-w-2xl">
          <div className="bg-gradient-to-r from-gold/10 to-transparent border border-gold/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gold">Plano Pro</h3>
                <p className="text-sm text-noir-400">R$ 99/mês • Renovação em 15/06/2025</p>
              </div>
              <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-medium">Ativo</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-white mb-3">Recursos do seu plano</h4>
            <div className="grid grid-cols-2 gap-2">
              {["Portfólio ilimitado", "Galerias ilimitadas", "CRM completo", "Blog ilimitado", "Propostas e contratos", "Domínio personalizado"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-noir-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M5 13l4 4L19 7" /></svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === "Domínio" && (
        <motion.div variants={fadeUp} className="max-w-2xl">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Domínio Personalizado</h3>
            <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-green-400">studiolumiere.com.br — Conectado</span>
            </div>
            <div><label className="text-xs text-noir-500 block mb-1">Adicionar novo domínio</label><div className="flex gap-2"><input placeholder="meudominio.com.br" className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /><button className="bg-gold hover:bg-gold-light text-noir-deep px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Conectar</button></div></div>
          </div>
        </motion.div>
      )}

      {tab === "Notificações" && (
        <motion.div variants={fadeUp} className="max-w-2xl">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4">
            {[
              { label: "Novo lead recebido", desc: "Receba um aviso quando alguém solicitar orçamento", active: true },
              { label: "Galeria visualizada", desc: "Saiba quando o cliente abrir a galeria", active: true },
              { label: "Seleção de fotos recebida", desc: "Notificação quando o cliente selecionar favoritas", active: true },
              { label: "Pagamento confirmado", desc: "Receba confirmação de pagamentos", active: true },
              { label: "Lembretes de entrega", desc: "Aviso quando um prazo estiver próximo", active: false },
              { label: "Relatório semanal", desc: "Resumo da semana por email", active: false },
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
        </motion.div>
      )}

      {tab === "Segurança" && (
        <motion.div variants={fadeUp} className="max-w-2xl space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Alterar Senha</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-noir-500 block mb-1">Senha atual</label><input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Nova senha</label><input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
              <div><label className="text-xs text-noir-500 block mb-1">Confirmar nova senha</label><input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
            </div>
            <button className="mt-4 bg-gold hover:bg-gold-light text-noir-deep px-6 py-2.5 rounded-lg text-sm font-medium transition-all">Alterar senha</button>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Sessões Ativas</h3>
            <p className="text-xs text-noir-500 mb-4">Dispositivos conectados à sua conta</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div><span className="text-sm text-white block">MacBook Pro — Chrome</span><span className="text-xs text-noir-500">São Paulo, SP • Agora</span></div>
                <span className="text-xs text-green-400">Atual</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div><span className="text-sm text-white block">iPhone 15 — Safari</span><span className="text-xs text-noir-500">São Paulo, SP • Há 2 horas</span></div>
                <button className="text-xs text-red-400 hover:text-red-300">Encerrar</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
