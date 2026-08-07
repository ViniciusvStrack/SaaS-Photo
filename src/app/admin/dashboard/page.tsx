"use client";

import { motion } from "framer-motion";
import { mockPhotographers, mockPlans, mockTickets, mockGalleries, mockInvoices } from "@/data/mock-data";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function MetricCard({ label, value, change, icon, color = "gold" }: { label: string; value: string; change?: string; icon: string; color?: string }) {
  const colorClasses = {
    gold: "bg-gold/10 text-gold",
    green: "bg-green-500/10 text-green-400",
    blue: "bg-blue-500/10 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-gold/10 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-noir-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d={icon} />
          </svg>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {change && <div className="text-xs text-green-400">{change}</div>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const activePhotographers = mockPhotographers.filter(p => p.subscriptionStatus === "active");
  const trialPhotographers = mockPhotographers.filter(p => p.subscriptionStatus === "trial");
  const totalGalleries = mockGalleries.length;
  const totalStorage = mockPhotographers.reduce((sum, p) => sum + p.storageUsed, 0);
  const openTickets = mockTickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  
  // Calculate MRR
  const mrr = mockPhotographers.reduce((sum, p) => {
    const plan = mockPlans.find(pl => pl.id === p.planId);
    if (plan && p.subscriptionStatus === "active") {
      return sum + plan.monthlyPrice;
    }
    return sum;
  }, 0);

  const paidInvoices = mockInvoices.filter(i => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);

  const monthlyGrowth = [
    { month: "Jan", users: 45, revenue: 4500 },
    { month: "Fev", users: 52, revenue: 5200 },
    { month: "Mar", users: 61, revenue: 6100 },
    { month: "Abr", users: 78, revenue: 7800 },
    { month: "Mai", users: 89, revenue: 8900 },
    { month: "Jun", users: 103, revenue: 10300 },
  ];

  const recentSignups = [
    { name: "Studio Lumière", plan: "Pro", date: "Há 2 horas", status: "active" },
    { name: "MV Fotografia", plan: "Studio", date: "Há 5 horas", status: "active" },
    { name: "Julia Mendes Photo", plan: "Starter", date: "Há 1 dia", status: "trial" },
    { name: "Carlos Foto", plan: "Pro", date: "Há 2 dias", status: "active" },
    { name: "Ana Clara Studio", plan: "Starter", date: "Há 3 dias", status: "trial" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-noir-500 text-sm mt-1">Visão geral da plataforma NoirFrame</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Fotógrafos Ativos"
          value={activePhotographers.length.toString()}
          change={`+${trialPhotographers.length} em trial`}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
          color="blue"
        />
        <MetricCard
          label="MRR"
          value={`R$ ${mrr.toLocaleString()}`}
          change="+12% vs. mês anterior"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
          color="green"
        />
        <MetricCard
          label="Total Galerias"
          value={totalGalleries.toString()}
          icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16"
          color="purple"
        />
        <MetricCard
          label="Armazenamento Usado"
          value={`${totalStorage.toFixed(1)} GB`}
          icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
          color="gold"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Crescimento de Receita</h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyGrowth.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gold font-medium">{`R$${(d.revenue / 1000).toFixed(1)}k`}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.revenue / 11000) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="w-full bg-gradient-to-t from-gold/40 to-gold/10 rounded-t"
                />
                <span className="text-xs text-noir-500">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Estatísticas Rápidas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-noir-400">Taxa de Conversão</span>
              <span className="text-sm text-gold font-medium">68%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1 }} className="h-full bg-gold/60 rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-noir-400">Churn Mensal</span>
              <span className="text-sm text-green-400 font-medium">2.3%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "2.3%" }} transition={{ duration: 1 }} className="h-full bg-green-500/60 rounded-full" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-noir-400">Tickets Abertos</span>
              <span className="text-sm text-yellow-400 font-medium">{openTickets}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-noir-400">Plano Mais Vendido</span>
              <span className="text-sm text-white font-medium">Pro</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Últimos Cadastros</h3>
          <div className="space-y-3">
            {recentSignups.map((signup, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                  {signup.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{signup.name}</div>
                  <div className="text-xs text-noir-500">{signup.plan} • {signup.date}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  signup.status === "active" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                }`}>
                  {signup.status === "active" ? "Ativo" : "Trial"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Alertas Operacionais</h3>
          <div className="space-y-3">
            {openTickets > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-yellow-400 font-medium">{openTickets} tickets de suporte abertos</div>
                  <div className="text-xs text-noir-500">Requer atenção da equipe</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-blue-400 font-medium">{trialPhotographers.length} usuários em trial</div>
                <div className="text-xs text-noir-500">Trials expirando em breve</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-green-400 font-medium">Sistema operando normalmente</div>
                <div className="text-xs text-noir-500">Uptime: 99.9%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
