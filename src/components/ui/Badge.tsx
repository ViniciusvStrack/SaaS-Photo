"use client";

// Unified status colors and labels - no more mock-data dependency
const STATUS_COLORS: Record<string, string> = {
  // Client status
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  negotiation: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  scheduled: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  confirmed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  photographed: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  editing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  recurring: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paid: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  // Gallery status
  draft: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  viewed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  selection_received: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  // Proposal status
  accepted: "bg-green-500/20 text-green-400 border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border-red-500/30",
  expired: "bg-slate-400/20 text-slate-400 border-slate-400/30",
  // Contract status
  signed: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  // Payment status
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  // Task status
  backlog: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  today: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  waiting_client: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  done: "bg-green-500/20 text-green-400 border-green-500/30",
  // Blog status
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  // Priority
  low: "bg-slate-400/20 text-slate-400 border-slate-400/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  // Generic
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  lead: "Novo Lead",
  negotiation: "Em Negociação",
  scheduled: "Agendado",
  confirmed: "Confirmado",
  photographed: "Fotografado",
  editing: "Em Edição",
  delivered: "Entregue",
  recurring: "Recorrente",
  paid: "Pago",
  cancelled: "Cancelado",
  draft: "Rascunho",
  sent: "Enviado",
  viewed: "Visualizada",
  selection_received: "Seleção Recebida",
  accepted: "Aceita",
  declined: "Recusada",
  expired: "Expirada",
  signed: "Assinado",
  completed: "Concluído",
  pending: "Pendente",
  overdue: "Atrasado",
  refunded: "Reembolsado",
  backlog: "Backlog",
  today: "Hoje",
  in_progress: "Em Progresso",
  waiting_client: "Aguardando Cliente",
  done: "Concluído",
  published: "Publicado",
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
  active: "Ativo",
  inactive: "Inativo",
};

interface BadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

export function Badge({ status, size = "sm", className = "", label }: BadgeProps) {
  const colorClass = STATUS_COLORS[status] || "bg-noir-600/40 text-noir-400 border-noir-500/30";
  const displayLabel = label || STATUS_LABELS[status] || status;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colorClass} ${sizeClass} ${className}`}>
      {displayLabel}
    </span>
  );
}
