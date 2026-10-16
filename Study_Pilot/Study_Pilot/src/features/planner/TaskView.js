import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { relDay, fmtDate, daysUntil, subjectName, subjectColor } from '../../lib/helpers';

// Visi plānotāja termiņi ar filtriem; atzīmēt / labot / dzēst
export default function TaskView({ onAddNewTask, onEditTask }) {
  const { data, update } = useApp();
  const [filter, setFilter] = useState('pending');

  const tasks = [...data.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pending = tasks.filter((t) => t.status !== 'completed');
  const done = tasks.filter((t) => t.status === 'completed');
  const shown = filter === 'pending' ? pending : filter === 'completed' ? done.reverse() : tasks;

  const toggle = (id) =>
    update((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed', doneAt: t.status === 'completed' ? null : new Date().toISOString() } : t)),
    }));
  const remove = (id) => update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));

  const tabs = [
    { id: 'pending', label: `Aktīvie (${pending.length})` },
    { id: 'completed', label: `Izpildītie (${done.length})` },
    { id: 'all', label: `Visi (${tasks.length})` },
  ];

  return (
    <Card title="📋 Plānotie darbi" subtitle="Tavi termiņi, eksāmeni un mājasdarbi" action={<Button onClick={onAddNewTask} className="text-xs py-1.5 px-3">+ Pievienot</Button>}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${filter === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          tasks.length === 0 ? (
            <EmptyState icon="📝" title="Vēl nav neviena termiņa" text="Pievieno eksāmenu datumus, pārbaudes darbus vai mājasdarbus.">
              <Button onClick={onAddNewTask} className="text-xs py-2">+ Pirmais termiņš</Button>
            </EmptyState>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Šajā sadaļā nav darbu.</p>
          )
        ) : (
          <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {shown.map((task) => {
              const isDone = task.status === 'completed';
              const overdue = !isDone && daysUntil(task.dueDate) < 0;
              return (
                <li key={task.id} className={`group p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-2xs hover:border-indigo-200'}`} style={{ borderLeft: `4px solid ${subjectColor(data, task.subjectId)}` }}>
                  <label className="flex items-center gap-3 min-w-0 cursor-pointer flex-1">
                    <input type="checkbox" checked={isDone} onChange={() => toggle(task.id)} className="w-4 h-4 rounded-md accent-[rgb(var(--acc))] cursor-pointer shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                      <span className={`text-[11px] ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                        {subjectName(data, task.subjectId)} · {task.type} · {fmtDate(task.dueDate)} ({overdue ? 'nokavēts' : relDay(task.dueDate).toLowerCase()})
                      </span>
                    </div>
                  </label>
                  <div className="flex gap-1 shrink-0 opacity-100 desktop:opacity-0 desktop:group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => onEditTask && onEditTask(task)} className="text-xs text-slate-400 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer" aria-label="Labot">✎</button>
                    <button type="button" onClick={() => remove(task.id)} className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer" aria-label="Dzēst">✕</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
