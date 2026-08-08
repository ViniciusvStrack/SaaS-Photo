"use client";

import { useApi } from "@/hooks/useApi";
import { formatCurrency, formatDate, SHOOT_STATUS, TASK_STATUS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/Skeleton";

type Analytics = { clients:{total:number}; shoots:{total:number}; galleries:{total:number}; revenue:{paid:number} };
type Shoot = { id:string; name:string; clientName?:string; date:string; status:string; location?:string };
type Task = { id:string; title:string; status:string; dueDate?:string };
type Notification = { id:string; title:string; message?:string; createdAt:string; isRead:boolean };

export default function DashboardPage() {
  const a = useApi<Analytics>("/api/analytics");
  const s = useApi<Shoot[]>("/api/shoots?status=confirmed&pageSize=5");
  const t = useApi<Task[]>("/api/tasks?status=today,in_progress&pageSize=5");
  const n = useApi<Notification[]>("/api/notifications?pageSize=5");
  const loading = a.loading || s.loading || t.loading;
  const error = a.error || s.error || t.error;
  if (loading) return <div className="space-y-6"><Skeleton className="h-9 w-64"/><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i=><Skeleton key={i} className="h-28"/>)}</div><Skeleton className="h-72"/></div>;
  if (error) return <ErrorState error={error} retry={() => { a.refetch(); s.refetch(); t.refetch(); }} />;
  const metrics = [
    ["Receita recebida", formatCurrency(a.data?.revenue.paid || 0)],
    ["Clientes", String(a.data?.clients.total || 0)],
    ["Ensaios", String(a.data?.shoots.total || 0)],
    ["Galerias", String(a.data?.galleries.total || 0)],
  ];
  return <div className="space-y-8">
    <header><p className="text-xs uppercase tracking-[.25em] text-gold mb-2">Visão geral</p><h1 className="text-3xl font-semibold text-white">Seu estúdio, hoje</h1><p className="text-sm text-noir-500 mt-2">Dados atualizados diretamente da operação.</p></header>
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">{metrics.map(([label,value])=><div key={label} className="bg-white/[.025] border border-white/5 rounded-2xl p-5"><span className="text-xs text-noir-500">{label}</span><strong className="block text-2xl text-white mt-2">{value}</strong></div>)}</section>
    <div className="grid lg:grid-cols-2 gap-6">
      <Panel title="Próximos ensaios">{s.data?.length ? s.data.map(x=><div key={x.id} className="flex justify-between gap-4 py-3 border-b border-white/5 last:border-0"><div><p className="text-sm text-white">{x.name}</p><p className="text-xs text-noir-500">{x.clientName || "Sem cliente"} · {formatDate(x.date)}</p></div><Status value={x.status} map={SHOOT_STATUS}/></div>) : <Empty text="Nenhum ensaio confirmado."/>}</Panel>
      <Panel title="Tarefas pendentes">{t.data?.length ? t.data.map(x=><div key={x.id} className="flex justify-between gap-4 py-3 border-b border-white/5 last:border-0"><div><p className="text-sm text-white">{x.title}</p><p className="text-xs text-noir-500">{x.dueDate ? formatDate(x.dueDate) : "Sem prazo"}</p></div><Status value={x.status} map={TASK_STATUS}/></div>) : <Empty text="Nenhuma tarefa pendente."/>}</Panel>
    </div>
    <Panel title="Notificações">{n.data?.length ? n.data.map(x=><div key={x.id} className="py-3 border-b border-white/5 last:border-0"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${x.isRead ? "bg-noir-600" : "bg-gold"}`}/><p className="text-sm text-white">{x.title}</p></div><p className="text-xs text-noir-500 ml-4 mt-1">{x.message} · {formatDate(x.createdAt,"withTime")}</p></div>) : <Empty text="Nenhuma notificação."/>}</Panel>
  </div>;
}

function Panel({title,children}:{title:string;children:React.ReactNode}) { return <section className="bg-white/[.02] border border-white/5 rounded-2xl p-5"><h2 className="text-sm font-semibold text-white mb-3">{title}</h2>{children}</section>; }
function Empty({text}:{text:string}) { return <p className="text-sm text-noir-500 py-8 text-center">{text}</p>; }
function Status({value,map}:{value:string;map:Record<string,{label:string;textColor:string}>}) { const v=map[value]; return <span className={`text-xs ${v?.textColor || "text-noir-400"}`}>{v?.label || value}</span>; }
function ErrorState({error,retry}:{error:string;retry:()=>void}) { return <div className="min-h-80 grid place-items-center text-center"><div><p className="text-red-400">{error}</p><button onClick={retry} className="mt-4 px-4 py-2 rounded-lg bg-gold text-black">Tentar novamente</button></div></div>; }
