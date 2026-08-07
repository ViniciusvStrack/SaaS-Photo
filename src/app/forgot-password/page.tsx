"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir-deep p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold inline-block mb-2"><span className="text-gold">Noir</span>Frame</Link>
          <p className="text-noir-500 text-sm">Recuperar sua senha</p>
        </div>
        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
            <p className="text-sm text-noir-400 text-center">Insira seu email e enviaremos um link para redefinir sua senha.</p>
            <div>
              <label className="block text-xs text-noir-400 mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gold hover:bg-gold-light text-noir-deep py-3 rounded-lg font-semibold text-sm transition-all">
              Enviar link de recuperação
            </motion.button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Email enviado!</h3>
            <p className="text-sm text-noir-400">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
          </motion.div>
        )}
        <p className="text-center text-xs text-noir-500 mt-6">
          <Link href="/login" className="text-gold hover:text-gold-light transition-colors">← Voltar para o login</Link>
        </p>
      </motion.div>
    </div>
  );
}
