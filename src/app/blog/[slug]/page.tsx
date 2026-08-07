"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { mockBlogPosts } from "@/lib/mock-data";

export default function BlogPostPage() {
  const params = useParams();
  const post = mockBlogPosts.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-noir-deep flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Post não encontrado</h1>
          <Link href="/blog" className="text-gold hover:text-gold-light text-sm">← Voltar ao blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-deep">
      <nav className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold"><span className="text-gold">Noir</span>Frame</Link>
          <div className="flex items-center gap-6 text-sm text-noir-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/blog" className="text-sm text-gold hover:text-gold-light transition-colors mb-6 inline-block">← Voltar ao blog</Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gold">{post.category}</span>
            <span className="text-sm text-noir-600">•</span>
            <span className="text-sm text-noir-600">{post.publishedAt}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>
          <p className="text-lg text-noir-400 mb-8">{post.excerpt}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="aspect-[21/9] rounded-2xl overflow-hidden mb-12">
          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto">
          {post.content.split("\n\n").map((p, i) => {
            if (p.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{p.replace("## ", "")}</h2>;
            return <p key={i} className="text-noir-300 leading-relaxed text-lg mb-4">{p}</p>;
          })}

          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs bg-white/5 text-noir-400 border border-white/5">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </article>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-noir-600">© 2025 NoirFrame. Feito para fotógrafos.</p>
      </footer>
    </div>
  );
}
