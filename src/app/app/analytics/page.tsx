"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { clients, shoots, galleries, invoices, blogPosts, proposals, tasks } = useData();

  const myClients = clients.filter(c => c.photographerId === user?.id);
  const myShoots = shoots.filter(s => s.photographerId === user?.id);
  const myGalleries = galleries.filter(g => g.photographerId === user?.id);
  const myInvoices = invoices.filter(i => i.photographerId === user?.id);
  const myPosts = blogPosts.filter(p => p.photographerId === user?.id);
  const myProposals = proposals.filter(p => p.photographerId === user?.id);
  const myTasks = tasks.filter(t => t.photographerId === user?.id);

  const paidInvoices = myInvoices.filter(i => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const pendingRevenue = myInvoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);
  const avgTicket = paidInvoices.length > 0 ? Math.round(totalRevenue / paidInvoices.length) : 0;
  
  const acceptedProposals = myProposals.filter(p => p.status === "accepted").length;
  const sentProposals = myProposals.filter(p => p.status !== "draft").length;
  const conversionRate = sentProposals > 0 ? Math.round((acceptedProposals / sentProposals) * 100) : 0;
  
  const completedTasks = myTasks.filter(t => t.status === "done").length;
  const totalTasks = myTasks.length;
  
  const deliveredShoots = myShoots.filter(s => s.status === "delivered" || s.status === "paid").length;

  const revenueByType = myShoots.reduce((acc, s) => {
    const key = s.type || "Outro";
    acc[key] = (acc[key] || 0) + s.value;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenueByType = Object.values(revenueByType).reduce((s, v) => s + v, 0);

  const monthlyRevenue = [
    { month: "Jan", value: 8500 }, { month: "Fev", value: 12000 }, { month: "Mar", value: 9800 },
    { month: "Abr", value: 15600 }, { month: "Mai", value: totalRevenue || 21000 }, { month: "Jun", value: 14500 },
  ];

  const insights = [
    { text: `Casamentos geraram ${revenueByType["Casamento"] ? Math.round((revenueByType["Casamento"] / totalRevenueByType) * 100) : 40}% da receita total.`, type: "info" },
    { text: `Sua taxa de conversão de propostas é de ${conversionRate}%.`, type: conversionRate >= 60 ? "success" : "warning" },
    { text: `Você completou ${completedTasks} de ${totalTasks} tarefas (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%).`, type: "info" },
    { text: `${myGalleries.filter(g => g.status === "sent" || g.status === "viewed").length} galerias aguardando seleção do cliente.`, type: "warning" },
    { text: `Ticket médio: R$ ${avgTicket.toLocaleString()}. ${avgTicket > 3000 ? "Acima da média do mercado!" : "Considere revisar seus pacotes."}`, type: avgTicket > 3000 ? "success" : "info" },
    { text: `R$ ${(pendingRevenue / 1000).toFixed(1)}k a receber nos próximos 30 dias.`, type: "info" },
  ];

  const topClients = [...myClients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-noir-500 text-sm mt-1">Inteligência operacional do seu estúdio</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Receita Total", value: `R$ ${(totalRevenue / 1000).toFixed(1)}k`, color: "text-gold" },
          { label: "Conversão", value: `${conversionRate}%`, color: conversionRate >= 60 ? "text-green-400" : "text-yellow-400" },
          { label: "Ticket Médio", value: `R$ ${avgTicket.toLocaleString()}`, color: "text-white" },
          { label: "Ensaios Entregues", value: deliveredShoots.toString(), color: "text-green-400" },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <span className="text-xs text-noir-500 block mb-2">{m.label}</span>
            <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Receita Mensal</h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gold font-medium">{`${(d.value / 1000).toFixed(1)}k`}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / 22000) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="w-full bg-gradient-to-t from-gold/40 to-gold/10 rounded-t"
                />
                <span className="text-xs text-noir-500">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue by Type */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Receita por Tipo</h3>
          <div className="space-y-4">
            {Object.entries(revenueByType).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, value]) => {
              const pct = totalRevenueByType > 0 ? Math.round((value / totalRevenueByType) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-noir-300">{type}</span>
                    <span className="text-gold">R$ {value.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gold/50 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Insights */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            Insights Inteligentes <span className="text-gold text-xs">✨ IA</span>
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  insight.type === "success" ? "bg-green-500/5 border border-green-500/10" :
                  insight.type === "warning" ? "bg-yellow-500/5 border border-yellow-500/10" :
                  "bg-blue-500/5 border border-blue-500/10"
                }`}
              >
                <span className="text-sm mt-0.5">
                  {insight.type === "success" ? "✅" : insight.type === "warning" ? "⚠️" : "💡"}
                </span>
                <p className="text-sm text-noir-300">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Clients */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Top Clientes por Receita</h3>
          <div className="space-y-3">
            {topClients.map((client, i) => (
              <div key={client.id} className="flex items-center gap-3">
                <span className="text-xs text-noir-600 w-4">{i + 1}.</span>
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{client.name}</div>
                  <div className="text-xs text-noir-500">{client.shootCount} ensaios</div>
                </div>
                <span className="text-sm text-gold font-medium">R$ {client.totalRevenue.toLocaleString()}</span>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-sm text-noir-500 text-center py-4">Nenhum cliente com receita</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Clientes ativos", value: myClients.filter(c => c.status !== "lead").length, total: myClients.length },
          { label: "Galerias criadas", value: myGalleries.length, total: null },
          { label: "Posts publicados", value: myPosts.filter(p => p.status === "published").length, total: myPosts.length },
          { label: "Recorrência", value: myClients.filter(c => c.status === "recurring").length, total: myClients.length },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-xs text-noir-500">{m.label}</div>
            {m.total !== null && (
              <div className="text-[10px] text-noir-600">de {m.total} total</div>
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
