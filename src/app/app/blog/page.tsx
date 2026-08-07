"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBlogPosts, type BlogPost } from "@/lib/mock-data";

export default function BlogPage() {
  const [selected, setSelected] = useState<BlogPost | null>(null);

  const statusColors: Record<string, string> = {
    published: "bg-green-500/20 text-green-400",
    draft: "bg-noir-600/40 text-noir-400",
    scheduled: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels: Record<string, string> = {
    published: "Publicado",
    draft: "Rascunho",
    scheduled: "Agendado",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-noir-500 text-sm mt-1">Gerencie seus posts e conteúdos</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Novo post
        </motion.button>
      </div>

      {/* AI suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gold/5 to-transparent border border-gold/10 rounded-xl p-5 mb-8"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gold mb-1">Sugestão de post com IA</h4>
            <p className="text-xs text-noir-400">Com base nos seus ensaios recentes, que tal escrever sobre <span className="text-white">&quot;Bastidores: Como foi fotografar uma campanha de moda em estúdio&quot;</span>? Posts de bastidores geram 3x mais engajamento.</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {mockBlogPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelected(post)}
            className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
          >
            <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
              <img src={post.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusColors[post.status]}`}>{statusLabels[post.status]}</span>
                <span className="text-xs text-noir-600">{post.category}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{post.title}</h3>
              <p className="text-xs text-noir-500 line-clamp-2">{post.excerpt}</p>
            </div>
            <div className="text-xs text-noir-600 shrink-0 hidden md:block">{post.publishedAt || "—"}</div>
          </motion.div>
        ))}
      </div>

      {/* Post preview modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-noir-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative aspect-[21/9] overflow-hidden rounded-t-2xl">
                <img src={selected.coverUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selected.status]}`}>{statusLabels[selected.status]}</span>
                  <span className="text-xs text-noir-500">{selected.category}</span>
                  {selected.publishedAt && <span className="text-xs text-noir-600">{selected.publishedAt}</span>}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{selected.title}</h2>
                <p className="text-sm text-noir-400 mb-6">{selected.excerpt}</p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selected.tags.map(t => (
                    <span key={t} className="px-2 py-1 rounded-full text-xs bg-white/5 text-noir-400 border border-white/5">{t}</span>
                  ))}
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  {selected.content.split("\n\n").map((p, i) => {
                    if (p.startsWith("## ")) return <h3 key={i} className="text-lg font-semibold text-white mt-6 mb-2">{p.replace("## ", "")}</h3>;
                    return <p key={i} className="text-noir-300 leading-relaxed mb-3">{p}</p>;
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <h4 className="text-xs text-noir-500 font-medium mb-2">SEO</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-600 block">Slug</span><span className="text-sm text-white font-mono">{selected.slug}</span></div>
                    <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-600 block">Categoria</span><span className="text-sm text-white">{selected.category}</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
