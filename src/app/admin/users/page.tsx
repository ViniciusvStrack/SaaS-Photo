"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockUsers, mockPhotographers, STATUS_COLORS } from "@/data/mock-data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const { showToast } = useToast();

  const allUsers = [...mockUsers, ...mockPhotographers.filter(p => !mockUsers.find(u => u.id === p.id))];

  const filtered = allUsers.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleToggleStatus = (userId: string) => {
    showToast("Status do usuário alterado", "success");
    setSelectedUser(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-noir-500 text-sm mt-1">{allUsers.length} usuários registrados</p>
        </div>
        <Button leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>}>
          Novo usuário
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-xs">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuários..."
          />
        </div>
        <div className="flex gap-2">
          {["all", "admin", "photographer", "client"].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                roleFilter === role
                  ? "bg-gold/10 text-gold border border-gold/20"
                  : "bg-white/5 text-noir-400 border border-white/5 hover:text-white"
              }`}
            >
              {role === "all" ? "Todos" : role === "admin" ? "Admins" : role === "photographer" ? "Fotógrafos" : "Clientes"}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-noir-500 font-medium">Usuário</th>
                <th className="text-left px-6 py-4 text-xs text-noir-500 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-xs text-noir-500 font-medium hidden sm:table-cell">Papel</th>
                <th className="text-left px-6 py-4 text-xs text-noir-500 font-medium hidden lg:table-cell">Último Login</th>
                <th className="text-left px-6 py-4 text-xs text-noir-500 font-medium">Status</th>
                <th className="text-right px-6 py-4 text-xs text-noir-500 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.role === "admin" ? "bg-red-500/20 text-red-400" :
                        user.role === "photographer" ? "bg-gold/20 text-gold" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {user.avatar || user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-noir-400 hidden md:table-cell">{user.email}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.role === "admin" ? "bg-red-500/20 text-red-400" :
                      user.role === "photographer" ? "bg-gold/20 text-gold" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {user.role === "admin" ? "Admin" : user.role === "photographer" ? "Fotógrafo" : "Cliente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-noir-500 hidden lg:table-cell">{user.lastLogin || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                      Ver
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name}
        description={selectedUser?.email}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Papel</span>
                <span className="text-sm text-white capitalize">{selectedUser.role}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Status</span>
                <span className={`text-sm ${selectedUser.isActive ? "text-green-400" : "text-red-400"}`}>
                  {selectedUser.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Criado em</span>
                <span className="text-sm text-white">{selectedUser.createdAt}</span>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3">
                <span className="text-xs text-noir-500 block">Último Login</span>
                <span className="text-sm text-white">{selectedUser.lastLogin || "—"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedUser(null)}>
                Fechar
              </Button>
              <Button
                variant={selectedUser.isActive ? "danger" : "primary"}
                className="flex-1"
                onClick={() => handleToggleStatus(selectedUser.id)}
              >
                {selectedUser.isActive ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
