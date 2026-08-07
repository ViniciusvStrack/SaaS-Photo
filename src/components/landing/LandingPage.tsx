"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const HERO_IMAGES = [
  "https://images.pexels.com/photos/34206662/pexels-photo-34206662.png?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/13611240/pexels-photo-13611240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/10289219/pexels-photo-10289219.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/28863302/pexels-photo-28863302.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

const FadeIn = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>
);

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-noir-deep/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight"><span className="text-gold">Noir</span>Frame</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-noir-400">
          <a href="#features" className="hover:text-white transition-colors">Recursos</a>
          <a href="#assistant" className="hover:text-white transition-colors">Assistente IA</a>
          <a href="#plans" className="hover:text-white transition-colors">Planos</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm text-noir-300 hover:text-white transition-colors">Entrar</Link>
          <Link href="/register" className="text-sm bg-gold hover:bg-gold-light text-noir-deep px-5 py-2 rounded-lg font-medium transition-all hover:scale-105">Começar grátis</Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const [img, setImg] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const i = setInterval(() => setImg(p => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={img} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.25, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute inset-0" style={{ y }}>
          <img src={HERO_IMAGES[img]} alt="" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-noir-deep/50 via-noir-deep/80 to-noir-deep" />
      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-noir-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> Plataforma para fotógrafos profissionais
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Menos planilhas.<br />Mais ensaios entregues<br />com <span className="text-gold">excelência</span>.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }} className="text-lg md:text-xl text-noir-400 max-w-2xl mx-auto mb-10">
          Do primeiro contato à entrega final, tudo no mesmo lugar. Agenda, CRM, galerias, contratos, propostas, financeiro e um assistente inteligente que entende o que você escreve.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="bg-gold hover:bg-gold-light text-noir-deep px-8 py-3.5 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-gold/20">Começar grátis</Link>
          <Link href="/demo" className="border border-white/15 hover:border-white/30 text-white px-8 py-3.5 rounded-lg font-medium text-lg transition-all hover:bg-white/5">Ver demonstração</Link>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="text-xs text-noir-600 mt-6">14 dias grátis · Sem cartão de crédito · Cancele quando quiser</motion.p>
      </motion.div>
    </section>
  );
}

const PAIN_POINTS = [
  { icon: "📋", title: "Planilhas infinitas", desc: "Controle de clientes, agenda e financeiro espalhados em 5 apps diferentes." },
  { icon: "📱", title: "Mensagens perdidas", desc: "Leads no WhatsApp, Instagram e email que nunca viram proposta." },
  { icon: "⏰", title: "Entregas atrasadas", desc: "Sem controle de prazos, seleção e edição. Cliente cobra, você se perde." },
  { icon: "📄", title: "Contratos improvisados", desc: "Sem modelo, sem autorização de imagem, sem segurança jurídica." },
];

const FEATURES = [
  { icon: "✨", title: "Assistente Noir com IA", desc: "Diga \"Marcar ensaio da Ana sábado às 15h\" e o sistema cria cliente, agenda, tarefa e cobrança." },
  { icon: "📅", title: "Agenda Inteligente", desc: "Visualize mês, semana e dia. Veja conflitos, prazos de entrega e carga semanal." },
  { icon: "👤", title: "CRM para Fotógrafos", desc: "Leads, negociações, histórico, preferências e valor gerado por cliente." },
  { icon: "📸", title: "Galerias Privadas", desc: "Links com senha, seleção de favoritas, marca d'água e controle de download." },
  { icon: "📄", title: "Propostas & Contratos", desc: "Crie, envie e acompanhe. Seu cliente aceita e assina online." },
  { icon: "💰", title: "Financeiro Completo", desc: "Receita, cobranças, parcelas, ticket médio e inadimplência. Tudo no dashboard." },
  { icon: "🛡️", title: "Segurança & LGPD", desc: "Checklist de segurança, autorização de imagem, galerias protegidas e audit logs." },
  { icon: "⚡", title: "Automações", desc: "Lembrete pré-ensaio, agradecimento, cobrança e pedido de depoimento automáticos." },
  { icon: "📊", title: "Analytics", desc: "Insights sobre receita, conversão, entregas, ocupação e clientes recorrentes." },
  { icon: "👥", title: "Área do Cliente", desc: "Seu cliente acessa galeria, proposta, contrato e seleção em um portal premium." },
];

const PLANS = [
  { name: "Starter", price: "49", yearly: "39", desc: "Para quem está começando.", features: ["Até 50 clientes", "10 galerias", "25 GB", "Blog (10 posts)", "Agenda", "Suporte email"], popular: false },
  { name: "Professional", price: "99", yearly: "79", desc: "Para fotógrafos que querem crescer.", features: ["200 clientes", "Galerias ilimitadas", "100 GB", "Blog ilimitado", "Propostas e contratos", "Financeiro completo", "Automações", "Área do cliente", "Domínio personalizado"], popular: true },
  { name: "Studio", price: "179", yearly: "149", desc: "Para estúdios e equipes.", features: ["500 clientes", "250 GB", "3 usuários", "Relatórios avançados", "API de integração", "Backup automático", "Onboarding dedicado", "Suporte 24/7"], popular: false },
  { name: "Agency", price: "349", yearly: "299", desc: "Para agências e alto volume.", features: ["Clientes ilimitados", "1 TB", "Usuários ilimitados", "Marca branca", "SLA garantido", "Gerente de conta"], popular: false },
];

const TESTIMONIALS = [
  { name: "Carolina Mendes", role: "Fotógrafa de Casamentos · São Paulo", text: "O NoirFrame transformou minha operação. Antes eu perdia horas em planilhas. Agora tudo está em um lugar só, com uma apresentação que meus clientes adoram.", avatar: "CM" },
  { name: "André Bastos", role: "Fotógrafo de Moda · Rio de Janeiro", text: "Meus clientes abrem a galeria e já sentem que estão recebendo algo premium. O Assistente Noir é incrível — escrevo uma mensagem e ele cria tudo.", avatar: "AB" },
  { name: "Fernanda Lima", role: "Fotógrafa Newborn · Belo Horizonte", text: "Desde que comecei a usar o NoirFrame, minha taxa de conversão subiu 40%. O CRM e as automações fazem toda a diferença. Não perco mais nenhum lead.", avatar: "FL" },
];

const FAQ = [
  { q: "Preciso saber programar para usar?", a: "Não. O NoirFrame foi feito para fotógrafos. Você configura tudo visualmente, sem código." },
  { q: "Posso usar meu próprio domínio?", a: "Sim! Nos planos Pro e acima você conecta seu domínio para portfólio e blog." },
  { q: "Como funciona a entrega de fotos?", a: "Você cria uma galeria privada, faz upload e envia um link com senha. O cliente visualiza, favorita e, se permitido, baixa." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multa. Cancele pelo painel de configurações quando quiser." },
  { q: "O que é o Assistente Noir?", a: "É um assistente inteligente que interpreta comandos em linguagem natural. Você escreve \"ensaio da Ana sábado 15h retrato R$ 450\" e ele cria cliente, agenda, tarefa e cobrança." },
  { q: "Meus dados estão seguros?", a: "Sim. Criptografia, backups, galerias com senha, controle de links e checklist LGPD integrado." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 px-6 bg-noir-950">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas <span className="text-gold">frequentes</span></h2>
        </FadeIn>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-medium text-white pr-4">{item.q}</span>
                  <motion.svg animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.3 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-500 shrink-0"><path d="M6 9l6 6 6-6" /></motion.svg>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-6 pb-4 text-sm text-noir-400 leading-relaxed">{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-noir-deep min-h-screen">
      <Navbar />
      <Hero />

      {/* Pain Points */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Você já viveu <span className="text-gold">isso</span>?</h2>
            <p className="text-noir-400 max-w-xl mx-auto">A maioria dos fotógrafos perde tempo e dinheiro com processos manuais. O NoirFrame resolve isso.</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAIN_POINTS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-red-500/20 transition-colors h-full">
                  <span className="text-2xl mb-3 block">{p.icon}</span>
                  <h3 className="text-sm font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-noir-500 leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-noir-950">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que um fotógrafo precisa em <span className="text-gold">um só lugar</span></h2>
            <p className="text-noir-400 max-w-xl mx-auto">Cada recurso foi pensado para simplificar sua rotina e encantar seus clientes.</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <motion.div whileHover={{ y: -4, borderColor: "rgba(201,169,110,0.3)" }} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 h-full transition-colors cursor-default">
                  <span className="text-xl mb-3 block">{f.icon}</span>
                  <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-noir-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant Noir Showcase */}
      <section id="assistant" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs text-gold mb-6">✨ Assistente Noir com IA</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Transforme uma mensagem em <span className="text-gold">agenda, proposta e contrato</span>
              </h2>
              <p className="text-noir-400 mb-6 leading-relaxed">
                Escreva em linguagem natural: &ldquo;Ana marcou ensaio dia 28 às 18h, corporativo, R$ 750, sinal R$ 200&rdquo;. O sistema interpreta e sugere criar cliente, evento, cobrança, tarefa e lembrete. Você confirma com um clique.
              </p>
              <div className="space-y-3">
                {["Detecta nomes, datas, valores e locais", "Cria registros automaticamente", "Sugere checklists por tipo de ensaio", "Gera mensagens profissionais para clientes"].map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-noir-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold shrink-0"><path d="M5 13l4 4L19 7" /></svg>{t}
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-noir-950 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center"><span className="text-[10px]">✨</span></div>
                  <span className="text-xs text-gold font-medium">Assistente Noir</span>
                </div>
                <div className="bg-gold/5 border border-gold/10 rounded-lg p-3 mb-3 text-sm text-noir-300">
                  &ldquo;Ana marcou dia 28 agosto 18h, evento corporativo no centro, R$ 750, sinal R$ 200&rdquo;
                </div>
                <div className="space-y-2">
                  {[
                    { icon: "👤", label: "Cadastrar cliente: Ana", applied: true },
                    { icon: "📅", label: "Criar ensaio: 28/08 às 18h", applied: true },
                    { icon: "💰", label: "Registrar sinal: R$ 200", applied: false },
                    { icon: "✅", label: "Criar checklist de preparação", applied: false },
                  ].map(a => (
                    <div key={a.label} className={`flex items-center gap-3 p-2.5 rounded-lg border ${a.applied ? "bg-green-500/5 border-green-500/20" : "bg-white/[0.02] border-white/5"}`}>
                      <span>{a.icon}</span>
                      <span className={`text-xs flex-1 ${a.applied ? "text-green-400" : "text-noir-300"}`}>{a.label}</span>
                      {a.applied ? <span className="text-[10px] text-green-400">✓</span> : <span className="text-[10px] text-gold px-2 py-0.5 bg-gold/10 rounded">Aplicar</span>}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 px-6 bg-noir-950">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Do primeiro contato à <span className="text-gold">entrega final</span></h2>
          </FadeIn>
          <div className="space-y-0">
            {[
              { num: "01", title: "Lead chega", desc: "Cliente encontra seu portfólio ou envia mensagem. O sistema identifica e cria o lead automaticamente." },
              { num: "02", title: "Proposta enviada", desc: "Crie propostas profissionais com pacotes, valores e condições. O cliente aceita online." },
              { num: "03", title: "Contrato assinado", desc: "Gere contrato a partir da proposta. Cliente assina digitalmente. Pagamento de sinal registrado." },
              { num: "04", title: "Ensaio realizado", desc: "Checklist de preparação, briefing inteligente e lembrete automático 24h antes." },
              { num: "05", title: "Galeria entregue", desc: "Upload das fotos, galeria privada com senha, seleção de favoritas pelo cliente." },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.08}>
                <div className="flex items-start gap-6 pb-8 relative">
                  {i < 4 && <div className="absolute left-6 top-12 bottom-0 w-px bg-gold/10" />}
                  <div className="w-12 h-12 rounded-full bg-noir-deep border-2 border-gold/30 flex items-center justify-center shrink-0 z-10">
                    <span className="text-gold font-mono text-sm font-bold">{step.num}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-noir-400">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para cada <span className="text-gold">momento</span></h2>
            <p className="text-noir-400">Comece grátis. Cresça quando quiser.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6 }} className={`relative rounded-2xl p-6 h-full flex flex-col ${plan.popular ? "bg-gradient-to-b from-gold/10 to-transparent border-2 border-gold/30" : "bg-white/[0.02] border border-white/5"}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-noir-deep text-[10px] font-bold px-4 py-1 rounded-full">MAIS POPULAR</div>}
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-gold">R$ {plan.price}</span>
                    <span className="text-noir-500 text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-noir-500 mb-1">ou R$ {plan.yearly}/mês no anual</p>
                  <p className="text-xs text-noir-400 mb-5">{plan.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-noir-300">
                        <svg className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`w-full py-2.5 rounded-lg font-medium text-center text-sm transition-all hover:scale-[1.02] block ${plan.popular ? "bg-gold hover:bg-gold-light text-noir-deep" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}`}>
                    Começar com {plan.name}
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-noir-950">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quem usa, <span className="text-gold">recomenda</span></h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:border-gold/20 transition-colors h-full flex flex-col">
                  <p className="text-sm text-noir-400 leading-relaxed italic flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">{t.avatar}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-[11px] text-noir-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Pronto para profissionalizar sua <span className="text-gold">operação</span>?</h2>
            <p className="text-noir-400 text-lg mb-8">Comece grátis em 2 minutos. Sem cartão de crédito.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="bg-gold hover:bg-gold-light text-noir-deep px-8 py-3.5 rounded-lg font-semibold text-lg transition-all hover:scale-105">Criar conta grátis</Link>
              <Link href="/demo" className="border border-white/15 hover:border-white/30 text-white px-8 py-3.5 rounded-lg font-medium text-lg transition-all hover:bg-white/5">Ver demonstração</Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="text-xl font-bold mb-3"><span className="text-gold">Noir</span>Frame</div>
              <p className="text-sm text-noir-500 max-w-sm leading-relaxed">O sistema operacional para fotógrafos que querem vender, organizar e entregar melhor.</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-4">Produto</div>
              <div className="space-y-2 text-sm text-noir-500">
                <a href="#features" className="block hover:text-white transition-colors">Recursos</a>
                <a href="#plans" className="block hover:text-white transition-colors">Planos</a>
                <Link href="/demo" className="block hover:text-white transition-colors">Demo</Link>
                <Link href="/blog" className="block hover:text-white transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-4">Legal</div>
              <div className="space-y-2 text-sm text-noir-500">
                <span className="block">Termos de Uso</span>
                <span className="block">Privacidade</span>
                <span className="block">LGPD</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-xs text-noir-600">© 2025 NoirFrame. Feito com ❤️ para fotógrafos profissionais.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
