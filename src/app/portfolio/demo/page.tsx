"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PHOTO_URLS, TESTIMONIALS } from "@/lib/mock-data";

export default function PortfolioDemoPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = PHOTO_URLS.slice(0, 12);

  return (
    <div className="min-h-screen bg-noir-deep">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          src={PHOTO_URLS[0]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir-deep/50 via-noir-deep/70 to-noir-deep" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Ana Luísa <span className="text-gold">Fotografia</span>
          </h1>
          <p className="text-lg text-noir-400 mb-8">Casamentos • Moda Editorial • Retratos</p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="#portfolio"
            className="inline-block bg-gold hover:bg-gold-light text-noir-deep px-8 py-3.5 rounded-lg font-semibold transition-all"
          >
            Ver Portfólio
          </motion.a>
        </motion.div>
      </section>

      {/* Portfolio grid */}
      <section id="portfolio" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Portfólio
          </motion.h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(i)}
                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group"
              >
                <img src={url} alt="" className="w-full h-auto group-hover:brightness-110 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6 bg-noir-950">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Sobre</h2>
            <p className="text-noir-400 leading-relaxed mb-4">
              Sou fotógrafa há mais de 8 anos, apaixonada por capturar a essência de cada momento. Meu trabalho é guiado pela luz natural, emoções autênticas e uma estética cinematográfica.
            </p>
            <p className="text-noir-400 leading-relaxed mb-6">
              Cada sessão é uma história única, e meu objetivo é transformar momentos efêmeros em memórias eternas.
            </p>
            <div className="flex items-center gap-6 text-sm text-noir-500">
              <div><span className="text-2xl font-bold text-gold block">500+</span>Ensaios</div>
              <div><span className="text-2xl font-bold text-gold block">120+</span>Casamentos</div>
              <div><span className="text-2xl font-bold text-gold block">8</span>Anos</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-[3/4] rounded-2xl overflow-hidden"
          >
            <img src={PHOTO_URLS[9]} alt="" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Depoimentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
              >
                <p className="text-sm text-noir-400 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">{t.avatar}</div>
                  <div><div className="text-xs font-semibold text-white">{t.name}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-noir-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Solicite um <span className="text-gold">Orçamento</span></h2>
          <p className="text-noir-400 mb-8">Conte-me sobre o seu projeto e vamos criar algo incrível juntos.</p>
          <form className="space-y-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input placeholder="Seu nome" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            <input type="email" placeholder="Seu email" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all" />
            <textarea rows={4} placeholder="Conte sobre o seu projeto..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all resize-none" />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="w-full bg-gold hover:bg-gold-light text-noir-deep py-3 rounded-lg font-semibold transition-all">
              Enviar mensagem
            </motion.button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-noir-600">Portfólio criado com <Link href="/" className="text-gold hover:text-gold-light">NoirFrame</Link></p>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p > 0 ? p - 1 : photos.length - 1); }} className="absolute left-4 text-white/60 hover:text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <motion.img key={lightbox} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={photos[lightbox]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p < photos.length - 1 ? p + 1 : 0); }} className="absolute right-4 text-white/60 hover:text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
