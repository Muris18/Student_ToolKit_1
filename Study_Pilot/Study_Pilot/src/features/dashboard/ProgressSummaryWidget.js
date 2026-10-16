import React from 'react';
import Link from 'next/link';
import Card from '../../components/Card';
import CountUp from '../../components/CountUp';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { subjectStats, overallStats } from '../../lib/helpers';

export default function ProgressSummaryWidget() {
  const { data } = useApp();
  const subjects = subjectStats(data);
  const all = overallStats(data);

  return (
    <Card title="📊 Mācību progress" subtitle="Pa priekšmetiem">
      {subjects.length === 0 ? (
        <EmptyState icon="📚" title="Nav priekšmetu" text="Pievieno priekšmetus, lai redzētu progresu.">
          <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">Pievienot →</Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-black/10">
              <CountUp to={all.progress} suffix="%" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Kopējā izpilde</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Izpildīti <span className="font-medium text-slate-700">{all.completed}</span> no <span className="font-medium text-slate-700">{all.total}</span>
                {all.accuracy !== null && <> · testos <span className="font-medium text-slate-700">{all.accuracy}%</span> pareizi</>}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs gap-3">
                  <span className="font-semibold text-slate-700 flex items-center gap-2 truncate"><i className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />{s.name}</span>
                  <span className="text-slate-500 font-medium shrink-0">{s.total ? `${s.progress}% (${s.completed}/${s.total})` : 'nav darbu'}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.progress}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
