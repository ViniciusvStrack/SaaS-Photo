"use client";

import { useApi } from "@/hooks/useApi";
import { CONTRACT_STATUS, formatCurrency, formatDate } from "@/lib/constants";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Contract = { id: string; title: string; service: string; value: number; terms: string; status: string; createdAt: string; signedAt?: string };

export default function ClientContracts() {
  const query = useApi<Contract[]>("/api/client/contracts");
  const { showToast } = useToast();

  async function sign(contract: Contract) {
    const signedAt = new Date().toISOString();
    const response = await fetch(`/api/contracts/${contract.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "signed", signedAt, signatureHash: `web-${contract.id}-${signedAt}` }),
    }).then(result => result.json());
    showToast(response.success ? "Contrato assinado!" : response.error || "Erro", response.success ? "success" : "error");
    if (response.success) query.refetch();
  }

  return <div><header className="mb-8"><p className="text-xs uppercase tracking-[.25em] text-gold">Documentos</p><h1 className="text-3xl text-white font-semibold mt-2">Contratos</h1></header>{query.loading ? <TableSkeleton/> : query.error ? <Retry error={query.error} retry={query.refetch}/> : query.data?.length ? <div className="space-y-4">{query.data.map(contract => { const info = CONTRACT_STATUS[contract.status as keyof typeof CONTRACT_STATUS]; return <article key={contract.id} className="p-6 bg-white/[.02] border border-white/5 rounded-2xl"><div className="flex justify-between gap-4"><div><h2 className="text-white text-lg">{contract.title}</h2><p className="text-xs text-noir-500">{contract.service} · {formatDate(contract.createdAt)}</p></div><div className="text-right"><b className="text-gold">{formatCurrency(contract.value)}</b><p className={`text-xs ${info?.textColor}`}>{info?.label}</p></div></div><p className="mt-5 text-sm text-noir-400 whitespace-pre-wrap line-clamp-4">{contract.terms}</p>{contract.status === "sent" && <div className="flex justify-end mt-5"><Button onClick={() => sign(contract)}>Assinar contrato</Button></div>}{contract.signedAt && <p className="text-xs text-green-400 mt-4">Assinado em {formatDate(contract.signedAt, "withTime")}</p>}</article>; })}</div> : <EmptyState title="Nenhum contrato" description="Não há contratos disponíveis."/>}</div>;
}

function Retry({ error, retry }: { error: string; retry: () => void }) {
  return <div className="text-center py-20"><p className="text-red-400">{error}</p><Button className="mt-4" onClick={retry}>Tentar novamente</Button></div>;
}
