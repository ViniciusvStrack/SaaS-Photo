"use client";

import { motion } from "framer-motion";
import { PHOTO_URLS } from "@/lib/mock-data";

const SECTIONS = [
  { id: 1, name: "Casamentos", photos: [PHOTO_URLS[0], PHOTO_URLS[2], PHOTO_URLS[4], PHOTO_URLS[5], PHOTO_URLS[6]] },
  { id: 2, name: "Moda & Editorial", photos: [PHOTO_URLS[8], PHOTO_URLS[9], PHOTO_URLS[10], PHOTO_URLS[12]] },
  { id: 3, name: "Retratos", photos: [PHOTO_URLS[11], PHOTO_URLS[13], PHOTO_URLS[15], PHOTO_URLS[16]] },
];

export default function PortfolioPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfólio</h1>
          <p className="text-noir-500 text-sm mt-1">Configure sua vitrine profissional pública</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.03 }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-noir-300 hover:text-white transition-all">Preview</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} className="bg-gold hover:bg-gold-light text-noir-deep px-5 py-2 rounded-lg text-sm font-medium transition-all">Publicar</motion.button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Informações</h3>
          <div className="space-y-3">
            <div><label className="text-xs text-noir-500 block mb-1">Nome profissional</label><input defaultValue="Ana Luísa Fotografia" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
            <div><label className="text-xs text-noir-500 block mb-1">Especialidade</label><input defaultValue="Casamentos & Moda Editorial" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40 transition-all" /></div>
            <div><label className="text-xs text-noir-500 block mb-1">Sobre</label><textarea rows={3} defaultValue="Fotógrafa apaixonada por capturar momentos autênticos. São Paulo, SP." className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40 transition-all resize-none" /></div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Layout</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["Grid", "Masonry", "Slider"].map((l, i) => (
              <button key={l} className={`py-3 rounded-lg text-xs border transition-all ${i === 0 ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-noir-500"}`}>{l}</button>
            ))}
          </div>
          <h4 className="text-xs text-noir-500 mb-2">Cor de destaque</h4>
          <div className="flex gap-2">
            {["#c9a96e", "#c0c0c0", "#4a90d9", "#e0e0e0", "#ff6b6b"].map((c, i) => (
              <button key={c} className={`w-8 h-8 rounded-full border-2 transition-all ${i === 0 ? "border-white scale-110" : "border-transparent hover:border-white/30"}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Configurações</h3>
          <div className="space-y-3">
            {[
              { label: "Botão de orçamento", active: true },
              { label: "Formulário de contato", active: true },
              { label: "Depoimentos", active: true },
              { label: "Blog integrado", active: false },
              { label: "Link para Instagram", active: true },
            ].map(opt => (
              <div key={opt.label} className="flex items-center justify-between">
                <span className="text-sm text-noir-300">{opt.label}</span>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${opt.active ? "bg-gold" : "bg-white/10"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${opt.active ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio sections */}
      <h3 className="text-sm font-semibold text-white mb-4">Seções do portfólio</h3>
      {SECTIONS.map((section, si) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-white">{section.name}</h4>
            <span className="text-xs text-noir-500">{section.photos.length} fotos</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {section.photos.map((url, pi) => (
              <motion.div key={pi} whileHover={{ scale: 1.05 }} className="aspect-square rounded-lg overflow-hidden cursor-pointer">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
            <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-noir-600"><path d="M12 5v14M5 12h14" /></svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
