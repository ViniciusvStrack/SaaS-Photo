"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockPhotos, type Photo } from "@/lib/mock-data";

const TAGS = ["todas", "selecionada", "editada", "entregue", "portfólio", "capa"];

export default function PhotosPage() {
  const [filter, setFilter] = useState("todas");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const filtered = filter === "todas" ? mockPhotos : mockPhotos.filter(p => p.tags.includes(filter));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Biblioteca de Fotos</h1>
          <p className="text-noir-500 text-sm mt-1">{mockPhotos.length} imagens na biblioteca</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-full text-xs border transition-all capitalize ${filter === t ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-500 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {filtered.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setLightbox(photo)}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
          >
            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end opacity-0 group-hover:opacity-100">
              <div className="p-2 w-full">
                <div className="text-xs text-white font-medium truncate">{photo.name}</div>
                <div className="flex gap-1 mt-1">
                  {photo.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-gold/20 text-gold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 flex" onClick={() => setLightbox(null)}>
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.img
                key={lightbox.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={lightbox.url}
                alt=""
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </div>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              onClick={e => e.stopPropagation()}
              className="w-80 bg-noir-950 border-l border-white/10 p-6 overflow-y-auto hidden md:block"
            >
              <button onClick={() => setLightbox(null)} className="text-noir-500 hover:text-white mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-sm font-semibold text-white mb-4">{lightbox.name}</h3>
              <div className="space-y-3">
                <div><span className="text-xs text-noir-500 block">Cliente</span><span className="text-sm text-white">{lightbox.clientName}</span></div>
                <div><span className="text-xs text-noir-500 block">Álbum</span><span className="text-sm text-white">{lightbox.album}</span></div>
                <div><span className="text-xs text-noir-500 block">Data</span><span className="text-sm text-white">{lightbox.date}</span></div>
                <div><span className="text-xs text-noir-500 block">Status</span><span className="text-sm text-gold capitalize">{lightbox.status}</span></div>
                <div>
                  <span className="text-xs text-noir-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {lightbox.tags.map(t => (
                      <span key={t} className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <button className="w-full py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-noir-300 hover:text-white hover:border-white/20 transition-all">Adicionar à galeria</button>
                <button className="w-full py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-noir-300 hover:text-white hover:border-white/20 transition-all">Marcar como portfólio</button>
                <button className="w-full py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-noir-300 hover:text-white hover:border-white/20 transition-all">Baixar original</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
