"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ClientGalleriesPage() {
  const { galleries, updateGallery } = useData();
  const { showToast } = useToast();

  const [selectedGallery, setSelectedGallery] = useState<typeof galleries[0] | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // For demo, show galleries for client c1
  const myGalleries = galleries.filter(g => g.clientId === "c1");

  const toggleFavorite = (photoId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSendSelection = () => {
    if (!selectedGallery) return;
    updateGallery(selectedGallery.id, {
      status: "selection_received",
      clientSelections: Array.from(favorites),
    });
    showToast(`${favorites.size} fotos selecionadas enviadas!`, "success");
    setFavorites(new Set());
    setSelectedGallery(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Minhas Galerias</h1>
      <p className="text-noir-500 text-sm mb-8">Acesse suas fotos e selecione suas favoritas</p>

      {!selectedGallery ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGalleries.map((gallery, i) => (
            <motion.div
              key={gallery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedGallery(gallery)}
              className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-gold/20 transition-all group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={gallery.coverUrl} alt={gallery.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-deep/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <Badge status={gallery.status} />
                  <span className="text-xs text-white/70">{gallery.photos.length} fotos</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white truncate">{gallery.name}</h3>
                <p className="text-xs text-noir-500 mt-1">{gallery.createdAt}</p>
              </div>
            </motion.div>
          ))}
          {myGalleries.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                </svg>
              </div>
              <p className="text-sm text-noir-500">Nenhuma galeria disponível ainda</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Gallery Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedGallery(null); setFavorites(new Set()); }} className="text-noir-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedGallery.name}</h2>
                <p className="text-xs text-noir-500">{selectedGallery.photos.length} fotos</p>
              </div>
            </div>
            {selectedGallery.allowFavorites && favorites.size > 0 && (
              <Button onClick={handleSendSelection}>
                Enviar {favorites.size} selecionadas
              </Button>
            )}
          </div>

          {/* Message */}
          {selectedGallery.message && (
            <div className="bg-gold/5 border border-gold/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gold italic">&ldquo;{selectedGallery.message}&rdquo;</p>
            </div>
          )}

          {/* Photo Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {selectedGallery.photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="break-inside-avoid relative group rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt=""
                  onClick={() => setLightbox(idx)}
                  className="w-full h-auto cursor-pointer group-hover:brightness-110 transition-all duration-500"
                />
                {selectedGallery.allowFavorites && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      favorites.has(photo.id)
                        ? "bg-gold text-noir-deep"
                        : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={favorites.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                )}
                {favorites.has(photo.id) && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-noir-deep">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Selection Footer */}
          {selectedGallery.allowFavorites && favorites.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-noir-950 border border-gold/20 rounded-xl px-6 py-3 shadow-2xl shadow-black/50 flex items-center gap-4 z-40"
            >
              <span className="text-sm text-white">{favorites.size} fotos selecionadas</span>
              <Button onClick={handleSendSelection}>Enviar seleção</Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && selectedGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white/60 hover:text-white z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p > 0 ? p - 1 : selectedGallery.photos.length - 1); }}
              className="absolute left-4 text-white/60 hover:text-white z-10"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={selectedGallery.photos[lightbox].url}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(p => p !== null && p < selectedGallery.photos.length - 1 ? p + 1 : 0); }}
              className="absolute right-4 text-white/60 hover:text-white z-10"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {selectedGallery.allowFavorites && (
              <div className="absolute bottom-6 flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedGallery.photos[lightbox].id); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    favorites.has(selectedGallery.photos[lightbox].id)
                      ? "bg-gold text-noir-deep"
                      : "bg-white/10 text-white hover:bg-gold/20 hover:text-gold"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(selectedGallery.photos[lightbox].id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
