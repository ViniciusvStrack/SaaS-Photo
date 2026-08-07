"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockShoots, STATUS_COLORS, STATUS_LABELS } from "@/lib/mock-data";

type View = "month" | "week" | "day";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [view, setView] = useState<View>("month");
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const [currentYear] = useState(2025);
  const [selectedShoot, setSelectedShoot] = useState<typeof mockShoots[0] | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getShootsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mockShoots.filter(s => s.date === dateStr);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-noir-500 text-sm mt-1">Organize seus ensaios, reuniões e entregas.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["month", "week", "day"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === v ? "bg-gold/10 text-gold border border-gold/20" : "bg-white/[0.03] text-noir-500 border border-white/5 hover:text-white"}`}>
              {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentMonth(p => p > 0 ? p - 1 : 11)} className="text-noir-500 hover:text-white transition-colors p-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{MONTHS[currentMonth]} {currentYear}</h2>
        <button onClick={() => setCurrentMonth(p => p < 11 ? p + 1 : 0)} className="text-noir-500 hover:text-white transition-colors p-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Calendar grid */}
      <motion.div layout className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS.map(d => (
            <div key={d} className="p-3 text-center text-xs text-noir-500 font-medium">{d}</div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-7"
          >
            {days.map((day, i) => {
              const shoots = day ? getShootsForDay(day) : [];
              const isToday = day === 15 && currentMonth === 4;
              return (
                <div key={i} className={`min-h-[80px] md:min-h-[100px] p-2 border-b border-r border-white/5 ${!day ? "bg-white/[0.01]" : "hover:bg-white/[0.02]"} transition-colors`}>
                  {day && (
                    <>
                      <span className={`text-xs ${isToday ? "w-6 h-6 flex items-center justify-center rounded-full bg-gold text-noir-deep font-bold" : "text-noir-500"}`}>{day}</span>
                      <div className="mt-1 space-y-1">
                        {shoots.map(s => (
                          <button key={s.id} onClick={() => setSelectedShoot(s)} className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate ${STATUS_COLORS[s.status]} hover:opacity-80 transition-opacity`}>
                            {s.name.substring(0, 20)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Upcoming list */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-white mb-4">Todos os eventos</h3>
        <div className="space-y-3">
          {mockShoots.map(shoot => (
            <motion.div
              key={shoot.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedShoot(shoot)}
              className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-gold/10 transition-all cursor-pointer"
            >
              <div className="w-12 text-center shrink-0">
                <div className="text-lg font-bold text-white">{shoot.date.split("-")[2]}</div>
                <div className="text-[10px] text-noir-500">{MONTHS[parseInt(shoot.date.split("-")[1]) - 1]?.substring(0, 3)}</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{shoot.name}</div>
                <div className="text-xs text-noir-500">{shoot.time} • {shoot.location}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${STATUS_COLORS[shoot.status]}`}>{STATUS_LABELS[shoot.status]}</span>
              <div className="text-sm font-medium text-gold shrink-0">R$ {shoot.value.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shoot detail modal */}
      <AnimatePresence>
        {selectedShoot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedShoot(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-noir-950 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedShoot.name}</h3>
                  <p className="text-sm text-noir-500">{selectedShoot.clientName}</p>
                </div>
                <button onClick={() => setSelectedShoot(null)} className="text-noir-500 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Data</span><span className="text-sm text-white">{selectedShoot.date}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Horário</span><span className="text-sm text-white">{selectedShoot.time}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Tipo</span><span className="text-sm text-white">{selectedShoot.type}</span></div>
                <div className="bg-white/[0.03] rounded-lg p-3"><span className="text-xs text-noir-500 block">Valor</span><span className="text-sm text-gold">R$ {selectedShoot.value.toLocaleString()}</span></div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 mb-4"><span className="text-xs text-noir-500 block mb-1">Local</span><span className="text-sm text-white">{selectedShoot.location}</span></div>
              {selectedShoot.notes && <div className="bg-white/[0.03] rounded-lg p-3 mb-4"><span className="text-xs text-noir-500 block mb-1">Observações</span><span className="text-sm text-noir-300">{selectedShoot.notes}</span></div>}
              <div>
                <span className="text-xs text-noir-500 block mb-2">Checklist</span>
                <div className="space-y-2">
                  {selectedShoot.checklist.map(c => (
                    <div key={c.item} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${c.done ? "bg-gold/20 border-gold" : "border-white/20"}`}>
                        {c.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gold"><path d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm ${c.done ? "text-noir-400 line-through" : "text-white"}`}>{c.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
