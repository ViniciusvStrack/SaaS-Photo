"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { mockBlogPosts } from "@/lib/mock-data";

export default function PublicBlogPage() {
  const published = mockBlogPosts.filter(p => p.status === "published");

  return (
    <div className="min-h-screen bg-noir-deep">
      {/* Nav */}
      <nav className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold"><span className="text-gold">Noir</span>Frame</Link>
          <div className="flex items-center gap-6 text-sm text-noir-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/blog" className="text-gold">Blog</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-noir-400 text-lg">Dicas, bastidores e inspiração para fotógrafos e clientes</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {published.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                  <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gold">{post.category}</span>
                  <span className="text-xs text-noir-600">•</span>
                  <span className="text-xs text-noir-600">{post.publishedAt}</span>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-gold transition-colors mb-2">{post.title}</h2>
                <p className="text-sm text-noir-400 line-clamp-2">{post.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-noir-600">© 2025 NoirFrame. Feito para fotógrafos.</p>
      </footer>
    </div>
  );
}
