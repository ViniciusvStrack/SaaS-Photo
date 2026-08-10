"use client";

import { useState } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

type Photo = { id: string; url: string; thumbnailUrl?: string; filename?: string; galleryId: string; isPortfolio: boolean; tags?: string[] };
type Gallery = { id: string; name: string };

export default function PhotosPage() {
  const [gallery, setGallery] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selected, setSelected] = useState<Photo | null>(null);
  const [tagText, setTagText] = useState("");
  const [deleting, setDeleting] = useState<Photo | null>(null);
  const { showToast } = useToast();
  const list = useApi<Photo[]>(`/api/photos?galleryId=${gallery}&isPortfolio=${portfolio}&pageSize=100`);
  const galleries = useApi<Gallery[]>("/api/galleries?pageSize=100");
  const remove = useApiMutation(`/api/photos/${deleting?.id || "pending"}`, "DELETE");

  function selectPhoto(photo: Photo) {
    setSelected(photo);
    setTagText((photo.tags || []).join(", "));
  }

  async function patchPhoto(photo: Photo, body: Record<string, unknown>, message: string) {
    const response = await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(result => result.json());
    showToast(response.success ? message : response.error || "Erro", response.success ? "success" : "error");
    if (response.success) {
      list.refetch();
      setSelected(previous => previous ? { ...previous, ...body } : previous);
    }
  }

  async function saveTags() {
    if (selected) await patchPhoto(selected, { tags: tagText.split(",").map(tag => tag.trim()).filter(Boolean) }, "Tags atualizadas!");
  }

  async function deletePhoto() {
    const response = await remove.mutate();
    showToast(response.success ? "Foto excluída!" : response.error || "Erro", response.success ? "success" : "error");
    if (response.success) {
      setDeleting(null);
      setSelected(null);
      list.refetch();
    }
  }

  return <div>
    <header className="mb-8"><p className="text-xs uppercase tracking-[.25em] text-gold">Acervo</p><h1 className="text-3xl text-white font-semibold mt-2">Biblioteca de fotos</h1><p className="text-sm text-noir-500 mt-1">{list.data?.length || 0} imagens</p></header>
    <div className="grid sm:grid-cols-2 gap-3 mb-6 max-w-2xl"><Select value={gallery} onChange={event => setGallery(event.target.value)} placeholder="Todas as galerias" options={(galleries.data || []).map(item => ({ value: item.id, label: item.name }))}/><Select value={portfolio} onChange={event => setPortfolio(event.target.value)} placeholder="Todas as fotos" options={[{ value: "true", label: "No portfólio" }, { value: "false", label: "Fora do portfólio" }]}/></div>
    {list.loading ? <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">{Array.from({ length: 10 }, (_, index) => <Skeleton key={index} className="aspect-square"/>)}</div> : list.error ? <Retry error={list.error} retry={list.refetch}/> : list.data?.length ? <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">{list.data.map(photo => <button key={photo.id} onClick={() => selectPhoto(photo)} className="aspect-square relative overflow-hidden rounded-xl group bg-white/[.03]"><img src={photo.thumbnailUrl || photo.url} alt={photo.filename || "Foto"} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>{photo.isPortfolio && <span className="absolute top-2 right-2 bg-gold text-black text-[10px] px-2 py-1 rounded-full">Portfólio</span>}</button>)}</div> : <EmptyState title="Nenhuma foto" description="Faça upload de fotos em uma galeria para vê-las aqui."/>}
    <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.filename || "Foto"} size="xl">{selected && <><img src={selected.url} alt={selected.filename || "Foto"} decoding="async" className="w-full max-h-[52vh] object-contain rounded-xl bg-black"/><div className="flex gap-2 mt-4"><Input label="Tags (separadas por vírgula)" value={tagText} onChange={event => setTagText(event.target.value)}/><Button className="self-end" variant="secondary" onClick={saveTags}>Salvar tags</Button></div><div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => patchPhoto(selected, { isPortfolio: !selected.isPortfolio }, selected.isPortfolio ? "Removida do portfólio" : "Adicionada ao portfólio")}>{selected.isPortfolio ? "Remover do portfólio" : "Adicionar ao portfólio"}</Button><Button variant="danger" onClick={() => setDeleting(selected)}>Excluir</Button></div></>}</Modal>
    <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={deletePhoto} title="Excluir foto" message="Esta ação não pode ser desfeita." isLoading={remove.loading}/>
  </div>;
}

function Retry({ error, retry }: { error: string; retry: () => void }) {
  return <div className="text-center py-16"><p className="text-red-400">{error}</p><Button className="mt-4" onClick={retry}>Tentar novamente</Button></div>;
}
