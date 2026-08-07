"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PHOTO_URLS } from "@/lib/mock-data";

export default function GalleryDemoPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const photos = PHOTO_URLS.slice(0, 16);

  const toggleFav = (idx: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-noir-deep">
      {/* Header */}
      <div className="border-b border-white/5 bg-noir-deep/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white">Casamento Marina & João — Prévia</h1>
            <p className="text-xs text-noir-500">por Studio Lumière</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gold">{favorites.size} favoritas</span>
            <button className="px-3 py-1.5 bg-gold/10 text-gold rounded-lg text-xs border border-gold/20 hover:bg-gold/20 transition-all">
              Enviar seleção
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gold/5 border border-gold/10 rounded-xl p-6 mb-8 text-center"
        >
          <p className="text-gold italic">&ldquo;Marina, aqui está a prévia do seu grande dia! Selecione suas favoritas 💛&rdquo;</p>
          <p className="text-xs text-noir-500 mt-2">— Ana Luísa, Studio Lumière</p>
        </motion.div>

        {/* Photo grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="break-inside-avoid relative group rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt=""
                onClick={() => setLightbox(i)}
                className="w-full h-auto cursor-pointer group-hover:brightness-110 transition-all duration-500"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); toggleFav(i); }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${favorites.has(i) ? "bg-gold text-noir-deep" : "bg-black/40 text-white hover:bg-gold/30"}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={favorites.has(i) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                </motion.button>
              </div>
              {favorites.has(i) && (
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-noir-deep"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Selection summary */}
        {favorites.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-noir-950 border border-gold/20 rounded-xl px-6 py-3 shadow-2xl shadow-black/50 flex items-center gap-4 z-40"
          >
            <span className="text-sm text-white">{favorites.size} fotos selecionadas</span>
            <motion.button whileHover={{ scale: 1.05 }} className="bg-gold hover:bg-gold-light text-noir-deep px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Enviar seleção
            </motion.button>
          </motion.div>
        )}
      </div>

      <footer className="border-t border-white/5 py-8 text-center mt-12">
        <p className="text-xs text-noir-600">Galeria criada com <Link href="/" className="text-gold hover:text-gold-light">NoirFrame</Link></p>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p > 0 ? p - 1 : photos.length - 1); }} className="absolute left-4 text-white/60 hover:text-white z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <motion.img key={lightbox} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={photos[lightbox]} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg" />
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p < photos.length - 1 ? p + 1 : 0); }} className="absolute right-4 text-white/60 hover:text-white z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-6 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={(e) => { e.stopPropagation(); toggleFav(lightbox); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${favorites.has(lightbox) ? "bg-gold text-noir-deep" : "bg-white/10 text-white hover:bg-gold/20 hover:text-gold"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(lightbox) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gold/20 hover:text-gold transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
