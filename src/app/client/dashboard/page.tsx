"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const { galleries, proposals, contracts, shoots } = useData();

  // For demo, we'll show galleries from first photographer
  const myGalleries = galleries.filter(g => g.clientId === "c1").slice(0, 3);
  const myProposals = proposals.filter(p => p.clientId === "c1");
  const myContracts = contracts.filter(c => c.clientId === "c1");
  const myShoots = shoots.filter(s => s.clientId === "c1");

  const upcomingShoots = myShoots.filter(s => s.status === "confirmed");
  const pendingGalleries = myGalleries.filter(g => g.status === "sent" || g.status === "viewed");

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Olá, {user?.name?.split(" ")[0]}</h1>
        <p className="text-noir-500 text-sm mt-1">Bem-vinda ao seu portal de cliente</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gold">{myGalleries.length}</div>
          <div className="text-xs text-noir-500">Galerias</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{upcomingShoots.length}</div>
          <div className="text-xs text-noir-500">Próximos Ensaios</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{myContracts.filter(c => c.status === "signed").length}</div>
          <div className="text-xs text-noir-500">Contratos</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{pendingGalleries.length}</div>
          <div className="text-xs text-noir-500">Aguardando Seleção</div>
        </div>
      </motion.div>

      {/* Pending Actions */}
      {pendingGalleries.length > 0 && (
        <motion.div variants={fadeUp} className="mb-8">
          <div className="bg-gold/5 border border-gold/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gold">Você tem {pendingGalleries.length} galeria(s) aguardando seleção!</h3>
                <p className="text-xs text-noir-400">Selecione suas fotos favoritas</p>
              </div>
            </div>
            <Link href="/client/galleries">
              <Button size="sm">Ver Galerias</Button>
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Galleries */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Suas Galerias</h3>
            <Link href="/client/galleries" className="text-xs text-gold">Ver todas →</Link>
          </div>
          {myGalleries.length > 0 ? (
            <div className="space-y-3">
              {myGalleries.map(gallery => (
                <Link key={gallery.id} href="/client/galleries">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-noir-800 shrink-0">
                      <img src={gallery.coverUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{gallery.name}</div>
                      <div className="text-xs text-noir-500">{gallery.photos.length} fotos</div>
                    </div>
                    <Badge status={gallery.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-noir-500 text-center py-8">Nenhuma galeria ainda</p>
          )}
        </motion.div>

        {/* Upcoming Sessions */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Próximas Sessões</h3>
          {upcomingShoots.length > 0 ? (
            <div className="space-y-3">
              {upcomingShoots.map(shoot => (
                <div key={shoot.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{shoot.name}</div>
                    <div className="text-xs text-noir-500">{shoot.date} às {shoot.time}</div>
                  </div>
                  <Badge status={shoot.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-noir-500 text-center py-8">Nenhuma sessão agendada</p>
          )}
        </motion.div>

        {/* Proposals */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Propostas</h3>
            <Link href="/client/proposals" className="text-xs text-gold">Ver todas →</Link>
          </div>
          {myProposals.slice(0, 2).map(proposal => (
            <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] mb-2">
              <div>
                <div className="text-sm text-white">{proposal.service}</div>
                <div className="text-xs text-noir-500">{proposal.package}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gold font-medium">R$ {proposal.total.toLocaleString()}</div>
                <Badge status={proposal.status} size="sm" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Contracts */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Contratos</h3>
            <Link href="/client/contracts" className="text-xs text-gold">Ver todos →</Link>
          </div>
          {myContracts.slice(0, 2).map(contract => (
            <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] mb-2">
              <div>
                <div className="text-sm text-white">{contract.service}</div>
                <div className="text-xs text-noir-500">R$ {contract.value.toLocaleString()}</div>
              </div>
              <Badge status={contract.status} size="sm" />
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
