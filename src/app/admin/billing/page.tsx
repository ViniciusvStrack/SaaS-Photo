"use client";

import { motion } from "framer-motion";
import { mockPhotographers, mockPlans, mockInvoices } from "@/data/mock-data";
import { Badge } from "@/components/ui/Badge";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminBillingPage() {
  const activePhotographers = mockPhotographers.filter(p => p.subscriptionStatus === "active");
  
  const mrr = mockPhotographers.reduce((sum, p) => {
    const plan = mockPlans.find(pl => pl.id === p.planId);
    if (plan && p.subscriptionStatus === "active") {
      return sum + plan.monthlyPrice;
    }
    return sum;
  }, 0);

  const arr = mrr * 12;

  const subscriptions = mockPhotographers.map(p => {
    const plan = mockPlans.find(pl => pl.id === p.planId);
    return {
      ...p,
      planName: plan?.name || "—",
      planPrice: plan?.monthlyPrice || 0,
    };
  });

  const revenueByPlan = mockPlans.map(plan => {
    const count = mockPhotographers.filter(p => p.planId === plan.id && p.subscriptionStatus === "active").length;
    return {
      name: plan.name,
      count,
      revenue: count * plan.monthlyPrice,
    };
  }).filter(p => p.count > 0);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Faturamento</h1>
        <p className="text-noir-500 text-sm mt-1">Acompanhe assinaturas e receita</p>
      </motion.div>

      {/* Metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <span className="text-xs text-noir-500 block mb-2">MRR</span>
          <span className="text-2xl font-bold text-gold">R$ {mrr.toLocaleString()}</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <span className="text-xs text-noir-500 block mb-2">ARR</span>
          <span className="text-2xl font-bold text-white">R$ {arr.toLocaleString()}</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <span className="text-xs text-noir-500 block mb-2">Assinaturas Ativas</span>
          <span className="text-2xl font-bold text-green-400">{activePhotographers.length}</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <span className="text-xs text-noir-500 block mb-2">Ticket Médio</span>
          <span className="text-2xl font-bold text-white">R$ {activePhotographers.length > 0 ? Math.round(mrr / activePhotographers.length) : 0}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue by Plan */}
        <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Receita por Plano</h3>
          <div className="space-y-4">
            {revenueByPlan.map(plan => (
              <div key={plan.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-noir-300">{plan.name}</span>
                  <span className="text-gold">R$ {plan.revenue} ({plan.count})</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(plan.revenue / mrr) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gold/50 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subscriptions List */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Assinaturas</h3>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium">Estúdio</th>
                  <th className="text-left px-6 py-3 text-xs text-noir-500 font-medium">Plano</th>
                  <th className="text-right px-6 py-3 text-xs text-noir-500 font-medium">Valor</th>
                  <th className="text-right px-6 py-3 text-xs text-noir-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-sm text-white">{sub.studioName}</td>
                    <td className="px-6 py-3 text-sm text-noir-400">{sub.planName}</td>
                    <td className="px-6 py-3 text-sm text-gold text-right">R$ {sub.planPrice}</td>
                    <td className="px-6 py-3 text-right"><Badge status={sub.subscriptionStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
