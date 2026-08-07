"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "bg-noir-600" },
  { id: "today", label: "Hoje", color: "bg-blue-500" },
  { id: "in_progress", label: "Em Andamento", color: "bg-orange-500" },
  { id: "waiting_client", label: "Aguardando Cliente", color: "bg-yellow-500" },
  { id: "done", label: "Concluído", color: "bg-green-500" },
];

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, moveTask, clients, shoots } = useData();
  const { showToast } = useToast();

  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as TaskPriority, dueDate: "", clientId: "", shootId: "" });

  const myTasks = tasks.filter(t => t.photographerId === user?.id);
  const myClients = clients.filter(c => c.photographerId === user?.id);
  const myShoots = shoots.filter(s => s.photographerId === user?.id);

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = myTasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    addTask({
      photographerId: user?.id || "",
      title: newTask.title,
      description: newTask.description,
      status: "backlog",
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      clientId: newTask.clientId || undefined,
      shootId: newTask.shootId || undefined,
    });

    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", clientId: "", shootId: "" });
    setShowNewTask(false);
    showToast("Tarefa criada", "success");
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus);
    showToast("Tarefa movida", "success");
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setEditingTask(null);
    showToast("Tarefa excluída", "success");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tarefas</h1>
          <p className="text-noir-500 text-sm mt-1">{myTasks.filter(t => t.status !== "done").length} tarefas pendentes</p>
        </div>
        <Button onClick={() => setShowNewTask(true)} leftIcon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>}>
          Nova tarefa
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />
              <span className="text-sm font-medium text-white">{column.label}</span>
              <span className="text-xs text-noir-500 ml-auto">{tasksByColumn[column.id]?.length || 0}</span>
            </div>

            <div className="space-y-2 min-h-[400px] bg-white/[0.01] rounded-xl p-2">
              <AnimatePresence>
                {tasksByColumn[column.id]?.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setEditingTask(task)}
                    className="bg-white/[0.03] border border-white/5 rounded-lg p-3 cursor-pointer hover:border-gold/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm text-white font-medium line-clamp-2">{task.title}</span>
                      <Badge status={task.priority} size="sm" />
                    </div>
                    {task.description && (
                      <p className="text-xs text-noir-500 line-clamp-2 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-noir-600">
                      {task.dueDate && <span>{task.dueDate}</span>}
                      {task.clientId && (
                        <span className="text-gold truncate max-w-[100px]">
                          {myClients.find(c => c.id === task.clientId)?.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasksByColumn[column.id]?.length === 0 && (
                <div className="text-center py-8 text-xs text-noir-600">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      <Modal isOpen={showNewTask} onClose={() => setShowNewTask(false)} title="Nova Tarefa">
        <div className="space-y-4">
          <Input
            label="Título"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="O que precisa ser feito?"
          />
          <div>
            <label className="block text-xs text-noir-400 mb-1.5">Descrição</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Detalhes da tarefa..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-noir-600 focus:outline-none focus:border-gold/40 transition-all resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Prioridade"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
              options={[
                { value: "low", label: "Baixa" },
                { value: "medium", label: "Média" },
                { value: "high", label: "Alta" },
                { value: "urgent", label: "Urgente" },
              ]}
            />
            <Input
              label="Prazo"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
          </div>
          <Select
            label="Cliente (opcional)"
            value={newTask.clientId}
            onChange={(e) => setNewTask({ ...newTask, clientId: e.target.value })}
            options={[{ value: "", label: "Nenhum" }, ...myClients.map(c => ({ value: c.id, label: c.name }))]}
          />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNewTask(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleAddTask}>Criar</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Editar Tarefa">
        {editingTask && (
          <div className="space-y-4">
            <Input
              label="Título"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
            />
            
            <Select
              label="Status"
              value={editingTask.status}
              onChange={(e) => handleMoveTask(editingTask.id, e.target.value as TaskStatus)}
              options={COLUMNS.map(c => ({ value: c.id, label: c.label }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Prioridade"
                value={editingTask.priority}
                onChange={(e) => {
                  updateTask(editingTask.id, { priority: e.target.value as TaskPriority });
                  setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority });
                }}
                options={[
                  { value: "low", label: "Baixa" },
                  { value: "medium", label: "Média" },
                  { value: "high", label: "Alta" },
                  { value: "urgent", label: "Urgente" },
                ]}
              />
              <Input
                label="Prazo"
                type="date"
                value={editingTask.dueDate || ""}
                onChange={(e) => {
                  updateTask(editingTask.id, { dueDate: e.target.value });
                  setEditingTask({ ...editingTask, dueDate: e.target.value });
                }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="danger" onClick={() => handleDeleteTask(editingTask.id)}>Excluir</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setEditingTask(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
