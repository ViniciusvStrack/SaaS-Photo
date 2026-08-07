"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    { id: "dashboard", label: "Dashboard", description: "Ir para o dashboard", icon: "🏠", action: () => router.push("/app/dashboard"), category: "Navegação" },
    { id: "calendar", label: "Agenda", description: "Abrir agenda", icon: "📅", action: () => router.push("/app/calendar"), category: "Navegação" },
    { id: "clients", label: "Clientes", description: "Gerenciar clientes", icon: "👤", action: () => router.push("/app/clients"), category: "Navegação" },
    { id: "shoots", label: "Ensaios", description: "Ver ensaios", icon: "📸", action: () => router.push("/app/shoots"), category: "Navegação" },
    { id: "galleries", label: "Galerias", description: "Gerenciar galerias", icon: "🖼️", action: () => router.push("/app/galleries"), category: "Navegação" },
    { id: "assistant", label: "Assistente Noir", description: "Abrir assistente inteligente", icon: "✨", action: () => router.push("/app/assistant"), category: "Navegação" },
    { id: "analytics", label: "Analytics", description: "Relatórios e métricas", icon: "📊", action: () => router.push("/app/analytics"), category: "Navegação" },
    { id: "security", label: "Segurança", description: "Central de segurança", icon: "🛡️", action: () => router.push("/app/security"), category: "Navegação" },
    { id: "tasks", label: "Tarefas", description: "Kanban de tarefas", icon: "✅", action: () => router.push("/app/tasks"), category: "Navegação" },
    { id: "inbox", label: "Mensagens", description: "Central de mensagens", icon: "📧", action: () => router.push("/app/inbox"), category: "Navegação" },
    { id: "finance", label: "Financeiro", description: "Gestão financeira", icon: "💰", action: () => router.push("/app/finance"), category: "Navegação" },
    { id: "new-client", label: "Novo cliente", description: "Cadastrar novo cliente", icon: "➕", action: () => router.push("/app/clients"), category: "Criar" },
    { id: "new-shoot", label: "Novo ensaio", description: "Agendar novo ensaio", icon: "➕", action: () => router.push("/app/shoots"), category: "Criar" },
    { id: "new-proposal", label: "Nova proposta", description: "Criar proposta comercial", icon: "➕", action: () => router.push("/app/proposals"), category: "Criar" },
    { id: "new-task", label: "Nova tarefa", description: "Criar tarefa", icon: "➕", action: () => router.push("/app/tasks"), category: "Criar" },
    { id: "new-post", label: "Novo post", description: "Criar post no blog", icon: "➕", action: () => router.push("/app/blog"), category: "Criar" },
    { id: "settings", label: "Configurações", description: "Configurações do sistema", icon: "⚙️", action: () => router.push("/app/settings"), category: "Sistema" },
  ];

  const filtered = search
    ? commands.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (command: Command) => {
    command.action();
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    }
  };

  const categories = [...new Set(filtered.map(c => c.category))];

  return (
    <>
      {/* Trigger button for topbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-noir-500 hover:text-white hover:border-white/20 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Buscar...
        <kbd className="ml-4 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-noir-500">⌘K</kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="flex justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="relative w-full max-w-lg bg-noir-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 border-b border-white/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-noir-500 shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Buscar ou executar comando..."
                    className="flex-1 bg-transparent py-4 text-sm text-white placeholder:text-noir-500 focus:outline-none"
                  />
                  <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-noir-600">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto p-2">
                  {categories.map(category => {
                    const items = filtered.filter(c => c.category === category);
                    return (
                      <div key={category}>
                        <div className="px-3 py-2 text-[10px] text-noir-600 font-medium uppercase tracking-wider">
                          {category}
                        </div>
                        {items.map(command => {
                          const idx = filtered.indexOf(command);
                          return (
                            <button
                              key={command.id}
                              onClick={() => handleSelect(command)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                idx === selectedIndex
                                  ? "bg-gold/10 text-gold"
                                  : "text-noir-300 hover:bg-white/[0.03]"
                              }`}
                            >
                              <span className="text-base">{command.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">{command.label}</div>
                                <div className="text-[10px] text-noir-500">{command.description}</div>
                              </div>
                              {idx === selectedIndex && (
                                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-noir-600">↵</kbd>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-center py-8 text-sm text-noir-500">
                      Nenhum resultado para &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
