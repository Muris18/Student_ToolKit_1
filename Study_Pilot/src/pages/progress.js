import React from 'react';
import Link from 'next/link';
import AppShell, { PageHeader, EmptyState } from '../components/AppShell';
import Card from '../components/Card';
import CountUp from '../components/CountUp';
import ProgressTracking from '../features/dashboard/ProgressTracking';
import { useApp } from '../lib/AppContext';
import { overallStats, subjectStats, toDateStr, dienas } from '../lib/helpers';

const DAY_LETTERS = ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'];

function Progress() {
  const { data } = useApp();
  const all = overallStats(data);
  const subjects = subjectStats(data);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { key: toDateStr(d), label: DAY_LETTERS[d.getDay()], active: data.activity.includes(toDateStr(d)) };
  });

  return (
    <>
      <PageHeader title="📊 Progresa un kļūdu analīze" subtitle="Seko savām sekmēm un atrodi tēmas, ko atkārtot pirms eksāmena." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Izpildīti darbi un uzdevumi</p>
          <p className="text-2xl font-bold text-slate-800 mt-1"><CountUp to={all.completed} /> <span className="text-sm text-slate-400 font-semibold">/ {all.total}</span></p>
          <span className="text-xs text-emerald-700 font-medium mt-2 inline-block">{all.total ? `${all.progress}% no visiem` : 'Pievieno termiņus un uzdevumus'}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Pareizo atbilžu īpatsvars testos</p>
          {all.accuracy === null ? <p className="text-2xl font-bold text-slate-300 mt-1">—</p> : <CountUp as="p" to={all.accuracy} suffix="%" className="text-2xl font-bold text-slate-800 mt-1" />}
          <span className="text-xs text-indigo-600 font-medium mt-2 inline-block">{data.quizResults.length} {data.quizResults.length % 10 === 1 && data.quizResults.length % 100 !== 11 ? 'pildīts tests' : 'pildīti testi'}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Aktivitāte šonedēļ</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{all.activeThisWeek} {dienas(all.activeThisWeek)}</p>
          <div className="flex gap-1.5 mt-2">
            {week.map((d) => (
              <span key={d.key} title={d.key} className={`flex-1 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${d.active ? 'bg-gradient-to-br from-accent to-accent2 text-white' : 'bg-slate-100 text-slate-400'}`}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      <Card title="📚 Progress pa priekšmetiem" subtitle="Izpildītie termiņi + uzdevumi un precizitāte testos">
        {subjects.length === 0 ? (
          <EmptyState icon="📚" title="Nav priekšmetu" text="Pievieno priekšmetus profilā.">
            <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">Uz profilu →</Link>
          </EmptyState>
        ) : (
          <div className="space-y-5">
            {subjects.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-800 flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{item.completed} / {item.total} darbi</span>
                    {item.accuracy !== null && <span className="text-xs text-slate-500">testi {item.accuracy}%</span>}
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{item.progress}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.progress}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ProgressTracking />
    </>
  );
}

export default function ProgressPage() {
  return (
    <AppShell className="max-w-5xl">
      <Progress />
    </AppShell>
  );
}
