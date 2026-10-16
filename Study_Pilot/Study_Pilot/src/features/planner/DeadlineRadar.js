import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { upcoming, daysUntil, dienas, fmtDate, subjectName, subjectColor } from '../../lib/helpers';

const urgencyConfig = {
  critical: { badge: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', label: 'Kritiski tuvu!' },
  warning: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Drīz klāt' },
  safe: { badge: 'bg-indigo-50 text-indigo-600 border-indigo-200', label: 'Ir laiks sagatavoties' },
};
const urgencyOf = (n) => (n <= 3 ? 'critical' : n <= 14 ? 'warning' : 'safe');

// Rāda tuvākos eksāmenus un pārbaudes darbus no lietotāja plānotāja
export default function DeadlineRadar({ onViewPlanner, onAdd }) {
  const { data } = useApp();
  const items = upcoming(data, { examsOnly: true, limit: 4 });

  return (
    <Card
      title="📡 Termiņu radars"
      subtitle="Laika atskaite līdz taviem eksāmeniem un pārbaudes darbiem"
      action={onViewPlanner && items.length > 0 && <Button variant="secondary" onClick={onViewPlanner} className="text-xs py-1.5 px-3">Uz kalendāru</Button>}
    >
      {items.length === 0 ? (
        <EmptyState icon="📡" title="Radarā nekā nav" text='Pievieno termiņu ar veidu "Eksāmens" vai "Pārbaudes darbs", un šeit redzēsi, cik dienu atlicis.'>
          {onAdd && <Button onClick={onAdd} className="text-xs py-2">+ Pievienot eksāmenu</Button>}
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const n = daysUntil(item.dueDate);
            const config = urgencyConfig[urgencyOf(n)];
            return (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ borderLeft: `4px solid ${subjectColor(data, item.subjectId)}` }}>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wide truncate">{subjectName(data, item.subjectId)}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 shrink-0">{fmtDate(item.dueDate)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm md:text-base">{item.title}</h4>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-800 block leading-tight">{n === 0 ? 'Šodien' : `${n} ${dienas(n)}`}</span>
                    {n > 0 && <span className="text-[10px] text-slate-400 uppercase tracking-wider">atlikušas</span>}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${config.badge}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
