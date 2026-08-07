"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEMO_STEPS = [
  { num: "01", title: "Abra o Assistente Noir", desc: "Na barra lateral, clique em \"Assistente IA\". É o coração inteligente do sistema.", route: "/app/assistant" },
  { num: "02", title: "Digite um comando natural", desc: "Escreva algo como: \"Marcar ensaio da Julia sábado às 15h no parque, retrato, R$ 450\". O sistema vai interpretar e sugerir ações.", route: "/app/assistant" },
  { num: "03", title: "Confirme as ações", desc: "Revise as entidades detectadas e clique em \"Aplicar tudo\". Cliente, ensaio, tarefa e cobrança serão criados automaticamente.", route: "/app/assistant" },
  { num: "04", title: "Veja a agenda atualizada", desc: "Abra \"Agenda\" para ver o ensaio criado. Clique nele para ver detalhes e checklist.", route: "/app/calendar" },
  { num: "05", title: "Explore os clientes", desc: "Abra \"Clientes\" para ver o CRM. Filtre por status, busque por nome, veja detalhes.", route: "/app/clients" },
  { num: "06", title: "Confira o financeiro", desc: "Abra \"Financeiro\" para ver receitas, cobranças pendentes e gráficos.", route: "/app/finance" },
  { num: "07", title: "Veja as galerias", desc: "Abra \"Galerias\" para ver as galerias privadas. Clique para ver fotos e status.", route: "/app/galleries" },
  { num: "08", title: "Teste a área do cliente", desc: "Saia e entre como cliente (cliente/cliente). Veja galerias, propostas e contratos pelo olhar do cliente.", route: "/client/dashboard" },
  { num: "09", title: "Revise a segurança", desc: "Volte como fotógrafo e abra \"Segurança\". O score muda conforme você altera o checklist.", route: "/app/security" },
  { num: "10", title: "Explore o analytics", desc: "Abra \"Analytics\" para ver insights inteligentes sobre seu estúdio.", route: "/app/analytics" },
];

export default function DemoPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDemoLogin = async (role: "admin" | "photographer" | "client") => {
    const creds = { admin: ["admin", "admin"], photographer: ["studio", "studio"], client: ["cliente", "cliente"] };
    const [email, password] = creds[role];
    setLoading(role);
    const result = await login(email, password);
    if (result.success) {
      const routes = { admin: "/admin/dashboard", photographer: "/app/dashboard", client: "/client/dashboard" };
      router.push(routes[role]);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-noir-deep">
      <nav className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold"><span className="text-gold">Noir</span>Frame</Link>
          <Link href="/login" className="text-sm text-noir-400 hover:text-white transition-colors">Entrar</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-sm text-gold mb-6">🎬 Demonstração Interativa</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Experimente o <span className="text-gold">NoirFrame</span></h1>
          <p className="text-noir-400 text-lg max-w-xl mx-auto">Entre com uma das contas demo e explore todas as funcionalidades do sistema. Sem cadastro necessário.</p>
        </motion.div>

        {/* Quick Access */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[
            { role: "photographer" as const, icon: "📸", label: "Fotógrafo", user: "studio / studio", desc: "Dashboard, assistente IA, agenda, CRM, galerias, financeiro", highlight: true },
            { role: "admin" as const, icon: "⚙️", label: "Administrador", user: "admin / admin", desc: "Painel admin, usuários, estúdios, planos, billing" },
            { role: "client" as const, icon: "👤", label: "Cliente", user: "cliente / cliente", desc: "Portal do cliente, galerias, propostas, contratos" },
          ].map(item => (
            <motion.div key={item.role} whileHover={{ y: -4 }} className={`rounded-xl p-6 cursor-pointer transition-all ${item.highlight ? "bg-gold/5 border-2 border-gold/30" : "bg-white/[0.02] border border-white/5 hover:border-gold/20"}`}>
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
              <p className="text-xs text-gold font-mono mb-2">{item.user}</p>
              <p className="text-xs text-noir-400 mb-4">{item.desc}</p>
              <button
                onClick={() => handleDemoLogin(item.role)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${item.highlight ? "bg-gold hover:bg-gold-light text-noir-deep" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}`}
              >
                {loading === item.role ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Entrando...
                  </span>
                ) : `Entrar como ${item.label}`}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Script */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Roteiro de demonstração</h2>
          <p className="text-noir-400 text-sm text-center mb-8">Siga estes passos para conhecer os recursos principais do NoirFrame.</p>

          <div className="space-y-4">
            {DEMO_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-gold font-mono text-sm font-bold">{step.num}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-noir-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Limitations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-3">⚠️ Ambiente de demonstração</h3>
          <ul className="space-y-2 text-xs text-noir-400">
            <li>• Os dados são pré-carregados para demonstração. Em produção, você começa do zero.</li>
            <li>• As credenciais admin/admin, studio/studio e cliente/cliente são apenas para demo. Em produção, senhas fortes são obrigatórias.</li>
            <li>• Upload de fotos, envio de emails e pagamentos são simulados neste ambiente.</li>
            <li>• O Assistente Noir usa regras locais. Em produção, pode ser conectado a IA real (OpenAI/Anthropic).</li>
            <li>• Dados podem ser resetados a qualquer momento.</li>
          </ul>
        </motion.div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-noir-600">© 2025 NoirFrame. Demonstração interativa.</p>
      </footer>
    </div>
  );
}
