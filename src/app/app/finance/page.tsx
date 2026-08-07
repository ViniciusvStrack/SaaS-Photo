"use client";

import { motion } from "framer-motion";
import { mockTransactions, revenueData, STATUS_COLORS, STATUS_LABELS } from "@/lib/mock-data";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FinancePage() {
  const paid = mockTransactions.filter(t => t.status === "paid");
  const pending = mockTransactions.filter(t => t.status === "pending");
  const totalPaid = paid.reduce((s, t) => s + t.value, 0);
  const totalPending = pending.reduce((s, t) => s + t.value, 0);
  const ticketMedio = paid.length > 0 ? Math.round(totalPaid / paid.length) : 0;

  const byType = mockTransactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p className="text-noir-500 text-sm mt-1">Acompanhe receitas, pagamentos e faturamento</p>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Receita confirmada", value: `R$ ${(totalPaid / 1000).toFixed(1)}k`, color: "text-green-400" },
          { label: "A receber", value: `R$ ${(totalPending / 1000).toFixed(1)}k`, color: "text-yellow-400" },
          { label: "Total faturado", value: `R$ ${((totalPaid + totalPending) / 1000).toFixed(1)}k`, color: "text-gold" },
          { label: "Ticket médio", value: `R$ ${ticketMedio.toLocaleString()}`, color: "text-white" },
        ].map(m => (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <span className="text-xs text-noir-500 block mb-2">{m.label}</span>
            <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Receita Mensal</h3>
          <div className="flex items-end gap-3 h-48">
            {revenueData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gold font-medium">{`${(d.value / 1000).toFixed(1)}k`}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / 22000) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full bg-gradient-to-t from-gold/40 to-gold/10 rounded-t relative"
                />
                <span className="text-xs text-noir-500">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By type */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Receita por Tipo</h3>
          <div className="space-y-4">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, value]) => {
              const pct = Math.round((value / (totalPaid + totalPending)) * 100);
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

      {/* Transactions */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Transações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium">Cliente</th>
                <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium hidden sm:table-cell">Descrição</th>
                <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium hidden md:table-cell">Data</th>
                <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium hidden md:table-cell">Tipo</th>
                <th className="text-right px-6 py-3 text-xs text-noir-500 font-medium">Valor</th>
                <th className="text-right px-6 py-3 text-xs text-noir-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 text-sm text-white">{t.clientName}</td>
                  <td className="px-6 py-3 text-sm text-noir-400 hidden sm:table-cell">{t.description}</td>
                  <td className="px-6 py-3 text-sm text-noir-500 hidden md:table-cell">{t.date}</td>
                  <td className="px-6 py-3 text-sm text-noir-500 hidden md:table-cell">{t.type}</td>
                  <td className="px-6 py-3 text-sm text-gold text-right font-medium">R$ {t.value.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right"><span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
