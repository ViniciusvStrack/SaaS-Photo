"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PHOTO_TYPES = ["casamento", "retrato", "produto", "moda", "eventos", "corporativo", "newborn", "lifestyle", "outro"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", studio: "", photoType: "", city: "", instagram: "", style: "" });

  const VISUAL_STYLES = ["editorial", "minimalista", "luxuoso", "documental", "moderno", "artístico"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir-deep p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold inline-block mb-2"><span className="text-gold">Noir</span>Frame</Link>
          <p className="text-noir-500 text-sm">
            {step === 1 ? "Crie sua conta" : "Personalize seu perfil"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? "w-12 bg-gold" : "w-8 bg-white/10"}`} />
            ))}
          </div>
        </div>

        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={(e) => { e.preventDefault(); setStep(2); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Nome completo</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Senha</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Nome do estúdio / marca</label>
              <input value={form.studio} onChange={e => setForm({ ...form, studio: e.target.value })} placeholder="Ex: Studio Lumière" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-2 font-medium">Tipo de fotografia</label>
              <div className="flex flex-wrap gap-2">
                {PHOTO_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, photoType: t })} className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.photoType === t ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-400 hover:border-white/20"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gold hover:bg-gold-light text-noir-deep py-3 rounded-lg font-semibold text-sm transition-all mt-2">
              Continuar
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={(e) => { e.preventDefault(); router.push("/app/dashboard"); }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Cidade</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Ex: São Paulo, SP" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Instagram</label>
              <input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@seuperfil" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-noir-400 mb-2 font-medium">Estilo visual preferido</label>
              <div className="grid grid-cols-3 gap-2">
                {VISUAL_STYLES.map(s => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, style: s })} className={`px-3 py-2.5 rounded-lg text-xs border transition-all ${form.style === s ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-400 hover:border-white/20"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-lg text-sm text-noir-300 transition-all">Voltar</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 bg-gold hover:bg-gold-light text-noir-deep py-3 rounded-lg font-semibold text-sm transition-all">
                Criar conta
              </motion.button>
            </div>
          </motion.form>
        )}

        <p className="text-center text-xs text-noir-500 mt-6">
          Já tem conta? <Link href="/login" className="text-gold hover:text-gold-light transition-colors">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}
