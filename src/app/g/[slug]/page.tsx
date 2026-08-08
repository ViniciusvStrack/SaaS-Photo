"use client";

import { useState, useEffect, useCallback } from "react";

// ============ TYPES ============
interface GalleryData {
  gallery: {
    id: string;
    name: string;
    clientName: string;
    coverUrl: string | null;
    message: string | null;
    allowDownload: boolean;
    allowFavorites: boolean;
    maxSelections: number | null;
    watermark: boolean;
    photoCount: number;
    viewCount: number;
  };
  photos: Photo[];
  studio: {
    name: string;
    brandColor: string | null;
    instagram: string | null;
    website: string | null;
  } | null;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string | null;
  width: number | null;
  height: number | null;
  order: number;
}

// ============ PAGE ============
export default function PublicGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [data, setData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [selectionSent, setSelectionSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  // Fetch gallery
  const fetchGallery = useCallback(async (pw?: string) => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/public/gallery/${slug}${pw ? `?password=${encodeURIComponent(pw)}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) {
        setError(json.error);
        setLoading(false);
        return;
      }

      // If requires password
      if (json.data?.requiresPassword) {
        setNeedsPassword(true);
        setData({ gallery: json.data, photos: [], studio: null } as unknown as GalleryData);
        setLoading(false);
        return;
      }

      setData(json.data);
      setNeedsPassword(false);
    } catch {
      setError("Erro ao carregar galeria. Tente novamente.");
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Handle password submit
  const submitPassword = async () => {
    setPasswordError(false);
    await fetchGallery(password);
    if (needsPassword) {
      setPasswordError(true);
    }
  };

  // Toggle favorite
  const toggleFavorite = (photoId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        if (data?.gallery.maxSelections && next.size >= data.gallery.maxSelections) {
          showToast(`Máximo de ${data.gallery.maxSelections} fotos`);
          return prev;
        }
        next.add(photoId);
      }
      return next;
    });

    // Send to API
    fetch(`/api/public/gallery/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "favorite",
        photoId,
        isFavorite: !favorites.has(photoId),
        password: password || undefined,
      }),
    }).catch(() => {});
  };

  // Send selection
  const sendSelection = async () => {
    if (favorites.size === 0) {
      showToast("Selecione pelo menos uma foto");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/public/gallery/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "selection",
          photoIds: Array.from(favorites),
          password: password || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectionSent(true);
        showToast(`✅ ${favorites.size} fotos selecionadas e enviadas!`);
      } else {
        showToast(json.error || "Erro ao enviar seleção");
      }
    } catch {
      showToast("Erro de conexão");
    }
    setSending(false);
  };

  // Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && data) setLightbox(prev => prev !== null ? Math.min(prev + 1, data.photos.length - 1) : null);
      if (e.key === "ArrowLeft") setLightbox(prev => prev !== null ? Math.max(prev - 1, 0) : null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, data]);

  const brandColor = data?.studio?.brandColor || "#c9a96e";

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: brandColor, borderTopColor: "transparent" }} />
          <p className="text-zinc-500 text-sm">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  // ============ ERROR ============
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📸</div>
          <h1 className="text-xl font-semibold text-white mb-2">Galeria não encontrada</h1>
          <p className="text-zinc-400 text-sm">{error}</p>
          <button onClick={() => fetchGallery()} className="mt-6 px-6 py-2.5 rounded-full text-sm font-medium text-black" style={{ backgroundColor: brandColor }}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ============ PASSWORD WALL ============
  if (needsPassword) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          {data?.gallery.coverUrl && (
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-2" style={{ borderColor: brandColor }}>
              <img src={data.gallery.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-xl font-semibold text-white mb-1">{(data?.gallery as unknown as { galleryName?: string })?.galleryName || "Galeria Privada"}</h1>
          <p className="text-zinc-400 text-sm mb-6">Digite a senha para acessar as fotos</p>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
              onKeyDown={e => e.key === "Enter" && submitPassword()}
              placeholder="Senha da galeria"
              className={`w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-center text-lg tracking-widest focus:outline-none ${passwordError ? "border-red-500" : "border-zinc-800 focus:border-[var(--brand)]"}`}
              style={{ "--brand": brandColor } as React.CSSProperties}
              autoFocus
            />
            {passwordError && <p className="text-red-400 text-xs">Senha incorreta</p>}
            <button onClick={submitPassword} className="w-full py-3 rounded-xl text-sm font-semibold text-black" style={{ backgroundColor: brandColor }}>
              Acessar Galeria
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { gallery, photos, studio } = data;

  // ============ GALLERY VIEW ============
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">{gallery.name}</h1>
            <p className="text-xs text-zinc-500">{studio?.name || ""} • {photos.length} fotos</p>
          </div>
          <div className="flex items-center gap-3">
            {gallery.allowFavorites && favorites.size > 0 && (
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>
                {favorites.size} selecionada{favorites.size > 1 ? "s" : ""}
                {gallery.maxSelections ? ` / ${gallery.maxSelections}` : ""}
              </span>
            )}
            {gallery.allowFavorites && !selectionSent && favorites.size > 0 && (
              <button
                onClick={sendSelection}
                disabled={sending}
                className="px-4 py-2 rounded-full text-xs font-semibold text-black disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                {sending ? "Enviando..." : "Enviar Seleção"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Welcome message */}
      {gallery.message && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-zinc-300 text-sm text-center italic">"{gallery.message}"</p>
        </div>
      )}

      {/* Selection sent banner */}
      {selectionSent && (
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${brandColor}15`, border: `1px solid ${brandColor}30` }}>
            <p className="text-sm font-medium" style={{ color: brandColor }}>
              ✅ Seleção enviada com sucesso! ({favorites.size} fotos)
            </p>
            <p className="text-xs text-zinc-400 mt-1">O fotógrafo receberá sua seleção em instantes.</p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-24">
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="break-inside-avoid mb-2 sm:mb-3 group relative">
              <img
                src={photo.url}
                alt={photo.filename || `Foto ${index + 1}`}
                className="w-full rounded-lg cursor-pointer transition-transform duration-200 hover:brightness-110"
                loading="lazy"
                onClick={() => setLightbox(index)}
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Favorite button */}
              {gallery.allowFavorites && !selectionSent && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(photo.id); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                  style={{
                    backgroundColor: favorites.has(photo.id) ? brandColor : "rgba(0,0,0,0.5)",
                    color: favorites.has(photo.id) ? "#000" : "#fff",
                  }}
                  title={favorites.has(photo.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              )}

              {/* Favorite indicator (always visible when selected) */}
              {favorites.has(photo.id) && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center group-hover:hidden" style={{ backgroundColor: brandColor }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#000" stroke="#000" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              )}

              {/* Download button */}
              {gallery.allowDownload && (
                <a
                  href={photo.url}
                  download={photo.filename || `foto-${index + 1}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  title="Baixar foto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              )}

              {/* Photo number */}
              <span className="absolute bottom-2 left-2 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}/{photos.length}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: brandColor }}>{studio?.name}</span>
            {studio?.instagram && (
              <a href={`https://instagram.com/${studio.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300">
                {studio.instagram}
              </a>
            )}
          </div>
          <span className="text-[10px] text-zinc-600">Powered by NoirFrame</span>
        </div>
      </footer>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          {/* Close */}
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          {/* Next */}
          {lightbox < photos.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}

          {/* Image */}
          <img
            src={photos[lightbox].url}
            alt={photos[lightbox].filename || ""}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Bottom bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 rounded-full px-4 py-2">
            <span className="text-xs text-zinc-400">{lightbox + 1} / {photos.length}</span>
            {gallery.allowFavorites && !selectionSent && (
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(photos[lightbox].id); }}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: favorites.has(photos[lightbox].id) ? brandColor : "rgba(255,255,255,0.1)",
                  color: favorites.has(photos[lightbox].id) ? "#000" : "#fff",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={favorites.has(photos[lightbox].id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {favorites.has(photos[lightbox].id) ? "Favoritada" : "Favoritar"}
              </button>
            )}
            {gallery.allowDownload && (
              <a
                href={photos[lightbox].url}
                download={photos[lightbox].filename || `foto-${lightbox + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1 rounded-full bg-white/10 hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Baixar
              </a>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </div>
  );
}
