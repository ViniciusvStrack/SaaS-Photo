"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockPhotographers, mockPlans, mockGalleries, mockClients } from "@/data/mock-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function AdminStudiosPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof mockPhotographers[0] | null>(null);

  const filtered = mockPhotographers.filter(p => {
    if (search && !p.studioName.toLowerCase().includes(search.toLowerCase()) && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStudioStats = (photographerId: string) => {
    const galleries = mockGalleries.filter(g => g.photographerId === photographerId);
    const clients = mockClients.filter(c => c.photographerId === photographerId);
    return { galleries: galleries.length, clients: clients.length };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Estúdios</h1>
          <p className="text-noir-500 text-sm mt-1">{mockPhotographers.length} estúdios cadastrados</p>
        </div>
      </div>

      <div className="max-w-xs mb-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar estúdios..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((photographer, i) => {
          const plan = mockPlans.find(p => p.id === photographer.planId);
          const stats = getStudioStats(photographer.id);
          
          return (
            <motion.div
              key={photographer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelected(photographer)}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-gold/10 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                  {photographer.avatar || photographer.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{photographer.studioName}</h3>
                  <p className="text-xs text-noir-500 truncate">{photographer.name}</p>
                </div>
                <Badge status={photographer.subscriptionStatus} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <div className="text-sm font-bold text-white">{stats.clients}</div>
                  <div className="text-[10px] text-noir-500">Clientes</div>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <div className="text-sm font-bold text-white">{stats.galleries}</div>
                  <div className="text-[10px] text-noir-500">Galerias</div>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                  <div className="text-sm font-bold text-white">{photographer.storageUsed.toFixed(0)}GB</div>
                  <div className="text-[10px] text-noir-500">Storage</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-noir-500">{plan?.name || "—"}</span>
                <span className="text-xs text-gold">R$ {plan?.monthlyPrice || 0}/mês</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Studio Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.studioName}
        description={selected?.name}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Plano</span>
                <span className="text-sm text-gold">{mockPlans.find(p => p.id === selected.planId)?.name}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Status</span>
                <Badge status={selected.subscriptionStatus} />
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Cidade</span>
                <span className="text-sm text-white">{selected.city}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Desde</span>
                <span className="text-sm text-white">{selected.createdAt}</span>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-noir-500">Armazenamento</span>
                <span className="text-xs text-white">{selected.storageUsed.toFixed(1)}GB / {selected.storageLimit}GB</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold/60 rounded-full transition-all"
                  style={{ width: `${(selected.storageUsed / selected.storageLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Email</span>
                <span className="text-sm text-white">{selected.email}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Telefone</span>
                <span className="text-sm text-white">{selected.phone || "—"}</span>
              </div>
              {selected.instagram && (
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <span className="text-xs text-noir-500 block">Instagram</span>
                  <span className="text-sm text-white">{selected.instagram}</span>
                </div>
              )}
              {selected.website && (
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <span className="text-xs text-noir-500 block">Website</span>
                  <span className="text-sm text-white">{selected.website}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button variant="primary" className="flex-1">
                Acessar como Estúdio
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
