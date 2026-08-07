"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockGalleries, PHOTO_URLS, STATUS_COLORS, STATUS_LABELS, type Gallery } from "@/lib/mock-data";

export default function GalleriesPage() {
  const [selected, setSelected] = useState<Gallery | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Galerias</h1>
          <p className="text-noir-500 text-sm mt-1">Gerencie suas galerias privadas de entrega</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Nova galeria
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGalleries.map((gallery, i) => (
          <motion.div
            key={gallery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelected(gallery)}
            className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-gold/10 transition-all cursor-pointer group"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={gallery.coverUrl} alt={gallery.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-deep/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[gallery.status]}`}>{STATUS_LABELS[gallery.status]}</span>
                <span className="text-xs text-white/70">{gallery.photoCount} fotos</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{gallery.name}</h3>
              <p className="text-xs text-noir-500">{gallery.clientName}</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-noir-600">
                {gallery.allowDownload && <span className="flex items-center gap-1">📥 Download</span>}
                {gallery.allowFavorites && <span className="flex items-center gap-1">❤️ Favoritos</span>}
                <span>🔒 Senha</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gallery detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-noir-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-t-2xl">
                <img src={selected.coverUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-1">{selected.name}</h3>
                  <p className="text-sm text-noir-400">{selected.clientName} • {selected.photoCount} fotos</p>
                </div>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                {selected.message && (
                  <div className="bg-gold/5 border border-gold/10 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gold italic">&ldquo;{selected.message}&rdquo;</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Status</span><span className={`text-sm ${STATUS_COLORS[selected.status].split(" ")[1]}`}>{STATUS_LABELS[selected.status]}</span></div>
                  <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Criada em</span><span className="text-sm text-white">{selected.createdAt}</span></div>
                  <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Expira em</span><span className="text-sm text-white">{selected.expiresAt}</span></div>
                  <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Senha</span><span className="text-sm text-white font-mono">{selected.password}</span></div>
                </div>

                <h4 className="text-sm font-semibold text-white mb-3">Preview das fotos</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {PHOTO_URLS.slice(0, 10).map((url, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={(e) => { e.stopPropagation(); setLightbox(idx); }}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center" onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p > 0 ? p - 1 : 9); }} className="absolute left-4 text-white/60 hover:text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={PHOTO_URLS[lightbox]}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            />
            <button onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p < 9 ? p + 1 : 0); }} className="absolute right-4 text-white/60 hover:text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-6 flex items-center gap-3">
              <motion.button whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gold/20 hover:text-gold transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
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
