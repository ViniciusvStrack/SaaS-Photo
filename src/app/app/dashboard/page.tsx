"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function MetricCard({ label, value, change, icon, color = "gold" }: { label: string; value: string; change?: string; icon: string; color?: string }) {
  const colors: Record<string, string> = {
    gold: "bg-gold/10 text-gold",
    green: "bg-green-500/10 text-green-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-gold/10 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-noir-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { shoots, clients, galleries, invoices, tasks, messages, proposals } = useData();

  const photographer = user;
  const myClients = clients.filter(c => c.photographerId === user?.id);
  const myShoots = shoots.filter(s => s.photographerId === user?.id);
  const myGalleries = galleries.filter(g => g.photographerId === user?.id);
  const myInvoices = invoices.filter(i => i.photographerId === user?.id);
  const myTasks = tasks.filter(t => t.photographerId === user?.id);
  const myMessages = messages.filter(m => m.photographerId === user?.id);
  const myProposals = proposals.filter(p => p.photographerId === user?.id);

  const upcomingShoots = myShoots.filter(s => s.status === "confirmed").slice(0, 3);
  const newLeads = myClients.filter(c => c.status === "lead" || c.status === "negotiation");
  const pendingGalleries = myGalleries.filter(g => g.status !== "delivered" && g.status !== "draft");
  const pendingTasks = myTasks.filter(t => t.status !== "done").slice(0, 5);
  const unreadMessages = myMessages.filter(m => !m.isRead);
  const pendingProposals = myProposals.filter(p => p.status === "sent");
  
  const paidInvoices = myInvoices.filter(i => i.status === "paid");
  const pendingInvoices = myInvoices.filter(i => i.status === "pending");
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const pendingPayments = pendingInvoices.reduce((s, i) => s + i.total, 0);

  const revenueData = [
    { month: "Jan", value: 8500 },
    { month: "Fev", value: 12000 },
    { month: "Mar", value: 9800 },
    { month: "Abr", value: 15600 },
    { month: "Mai", value: totalRevenue },
    { month: "Jun", value: 14500 },
  ];

  const quickActions = [
    { label: "Novo ensaio", href: "/app/shoots", icon: "M12 5v14M5 12h14" },
    { label: "Novo cliente", href: "/app/clients", icon: "M12 5v14M5 12h14" },
    { label: "Criar galeria", href: "/app/galleries", icon: "M12 5v14M5 12h14" },
    { label: "Novo post", href: "/app/blog", icon: "M12 5v14M5 12h14" },
    { label: "Enviar proposta", href: "/app/proposals", icon: "M12 5v14M5 12h14" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bem-vinda, {photographer?.name?.split(" ")[0]}</h1>
        <p className="text-noir-500 text-sm mt-1">Aqui está o resumo do seu estúdio hoje.</p>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Receita do mês"
          value={`R$ ${(totalRevenue / 1000).toFixed(1)}k`}
          change="+18% vs. mês anterior"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1"
          color="green"
        />
        <MetricCard
          label="A receber"
          value={`R$ ${(pendingPayments / 1000).toFixed(1)}k`}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2"
          color="gold"
        />
        <MetricCard
          label="Novos leads"
          value={newLeads.length.toString()}
          change="+3 esta semana"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
          color="blue"
        />
        <MetricCard
          label="Ensaios confirmados"
          value={upcomingShoots.length.toString()}
          icon="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86"
          color="purple"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-8">
        {quickActions.map(a => (
          <Link key={a.label} href={a.href}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-xs text-noir-400 hover:text-gold hover:border-gold/20 transition-all cursor-pointer flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                <path d={a.icon} />
              </svg>
              {a.label}
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Alerts */}
      {(unreadMessages.length > 0 || pendingProposals.length > 0 || pendingGalleries.length > 0) && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {unreadMessages.length > 0 && (
            <Link href="/app/inbox" className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl hover:border-blue-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-blue-400 font-medium">{unreadMessages.length} mensagens não lidas</span>
                <p className="text-xs text-noir-500">Responda seus clientes</p>
              </div>
            </Link>
          )}
          {pendingProposals.length > 0 && (
            <Link href="/app/proposals" className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl hover:border-yellow-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-yellow-400 font-medium">{pendingProposals.length} propostas aguardando</span>
                <p className="text-xs text-noir-500">Acompanhe as respostas</p>
              </div>
            </Link>
          )}
          {pendingGalleries.length > 0 && (
            <Link href="/app/galleries" className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl hover:border-purple-500/20 transition-all">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                </svg>
              </div>
              <div>
                <span className="text-sm text-purple-400 font-medium">{pendingGalleries.length} galerias pendentes</span>
                <p className="text-xs text-noir-500">Aguardando seleção</p>
              </div>
            </Link>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming shoots */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Próximos Ensaios</h3>
            <Link href="/app/shoots" className="text-xs text-gold hover:text-gold-light transition-colors">Ver todos →</Link>
          </div>
          {upcomingShoots.length > 0 ? (
            <div className="space-y-3">
              {upcomingShoots.map(shoot => (
                <Link key={shoot.id} href={`/app/shoots`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-gold/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{shoot.name}</div>
                      <div className="text-xs text-noir-500">{shoot.date} • {shoot.time} • {shoot.location}</div>
                    </div>
                    <Badge status={shoot.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-noir-500">Nenhum ensaio confirmado</p>
              <Link href="/app/shoots">
                <Button variant="secondary" size="sm" className="mt-2">Agendar ensaio</Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Tasks */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Tarefas</h3>
            <Link href="/app/tasks" className="text-xs text-gold hover:text-gold-light transition-colors">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 ${task.priority === "high" || task.priority === "urgent" ? "border-red-400" : task.priority === "medium" ? "border-yellow-400" : "border-noir-600"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-noir-300 truncate">{task.title}</div>
                  <div className="text-xs text-noir-600">{task.dueDate || "Sem prazo"}</div>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-noir-500 text-center py-4">Tudo em dia! 🎉</p>
            )}
          </div>
        </motion.div>

        {/* Revenue chart */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Receita Mensal</h3>
          <div className="flex items-end gap-2 h-32">
            {revenueData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / 20000) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="w-full bg-gold/20 rounded-t relative overflow-hidden"
                >
                  <div className="absolute bottom-0 w-full h-1/2 bg-gold/40 rounded-t" />
                </motion.div>
                <span className="text-[10px] text-noir-600">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            {[
              { text: "Galeria 'Newborn Valentina' entregue", time: "Há 2 horas", color: "bg-green-400" },
              { text: `Novo lead: ${newLeads[0]?.name || "Juliana Santos"}`, time: "Há 5 horas", color: "bg-blue-400" },
              { text: "Proposta enviada para Tech Corp Brasil", time: "Há 1 dia", color: "bg-yellow-400" },
              { text: "Pagamento confirmado: Belle Mode (R$ 6.000)", time: "Há 2 dias", color: "bg-emerald-400" },
              { text: "Ensaio 'Evento 50 Anos Marcos' finalizado", time: "Há 3 dias", color: "bg-cyan-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                <span className="text-sm text-noir-300 flex-1">{item.text}</span>
                <span className="text-xs text-noir-600 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Studio health */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Saúde do Estúdio</h3>
          <div className="space-y-4">
            {[
              { label: "Taxa de conversão", value: "68%", pct: 68 },
              { label: "Entregas no prazo", value: "92%", pct: 92 },
              { label: "Satisfação", value: "97%", pct: 97 },
              { label: "Ocupação agenda", value: "75%", pct: 75 },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-noir-400">{m.label}</span>
                  <span className="text-gold">{m.value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gold/60 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
