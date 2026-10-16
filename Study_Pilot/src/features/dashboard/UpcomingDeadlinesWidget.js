import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { upcoming, relDay, daysUntil, subjectName, subjectColor } from '../../lib/helpers';

const priorityStyles = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  normal: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};
const priorityLabels = { high: 'Steidzami', normal: 'Normāla', low: 'Zema' };

export default function UpcomingDeadlinesWidget({ onViewAll }) {
  const { data } = useApp();
  const items = upcoming(data, { limit: 5 });

  return (
    <Card
      title="⏳ Tuvākie termiņi"
      subtitle="Nepabeigtie darbi pēc datuma"
      action={onViewAll && <Button variant="secondary" onClick={onViewAll} className="text-xs py-1.5 px-3">Plānotājs</Button>}
    >
      {items.length === 0 ? (
        <EmptyState icon="📅" title="Nav gaidāmu termiņu" text="Pievieno eksāmenu, pārbaudes darbu vai mājasdarbu plānotājā.">
          {onViewAll && <Button onClick={onViewAll} className="text-xs py-2">+ Pievienot termiņu</Button>}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all" style={{ borderLeft: `4px solid ${subjectColor(data, item.subjectId)}` }}>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wide truncate">{subjectName(data, item.subjectId)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium shrink-0">{item.type}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                <p className={`text-xs ${daysUntil(item.dueDate) <= 2 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{relDay(item.dueDate)}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${priorityStyles[item.priority] || priorityStyles.normal}`}>
                {priorityLabels[item.priority] || 'Normāla'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
