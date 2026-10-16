import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CountUp from '../../components/CountUp';
import SubjectManager from '../profile/SubjectManager';
import { useApp } from '../../lib/AppContext';
import { gradeLabel, upcoming, daysUntil, dienas, overallStats, subjectName, fmtDate } from '../../lib/helpers';

export default function DashboardMain() {
  const { user, data } = useApp();
  const router = useRouter();
  const p = user.profile;
  const nextExam = upcoming(data, { examsOnly: true, limit: 1 })[0];
  const stats = overallStats(data);
  const isNew = data.subjects.length === 0;
  const [editingSubjects, setEditingSubjects] = useState(isNew);

  const steps = [
    { done: data.subjects.length > 0, label: 'Pievieno savus priekšmetus', href: '/profile' },
    { done: data.tasks.length > 0, label: 'Ieliec pirmo termiņu vai eksāmena datumu', href: '/planner' },
    { done: data.exercises.length > 0, label: 'Pievieno eksāmena uzdevumus, ko risināt', href: '/exams?mode=tasks' },
    { done: data.quizzes.length > 0, label: 'Izveido savu pirmo testu', href: '/exams?mode=quiz' },
  ];
  const stepsDone = steps.filter((s) => s.done).length;

  let line = 'Sāc ar savu priekšmetu pievienošanu — tad vari plānot termiņus, krāt uzdevumus un veidot testus.';
  if (!isNew && nextExam) {
    const n = daysUntil(nextExam.dueDate);
    line = n === 0
      ? `Šodien: ${nextExam.title} (${subjectName(data, nextExam.subjectId)}). Veiksmi!`
      : `Līdz "${nextExam.title}" atlikušas ${n} ${dienas(n)} (${fmtDate(nextExam.dueDate)}).`;
  } else if (!isNew) {
    line = 'Nav ieplānotu eksāmenu. Pievieno eksāmenu datumus plānotājā, lai redzētu atskaiti.';
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-accent to-accent2 rounded-3xl p-5 sm:p-8 text-white shadow-lg shadow-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="bg-black/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {gradeLabel(p)}{p.program ? ` · ${p.program}` : ''}{p.school ? ` · ${p.school}` : ''}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">
            {isNew ? 'Laipni lūdzam' : 'Sveicināts atpakaļ'}, {p.firstName}! 👋
          </h2>
          <p className="text-white/80 mt-1 max-w-xl text-sm md:text-base">{line}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.push(isNew ? '/profile' : '/exams')}>
            {isNew ? 'Pievienot priekšmetus' : 'Sākt risināt'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stepsDone < steps.length ? (
          <Card
            title={editingSubjects ? '📚 Kurus priekšmetus mācies?' : '🚀 Sākuma soļi'}
            subtitle={editingSubjects ? 'Izvēlies no ieteiktajiem vai ieraksti savu' : `${stepsDone} no ${steps.length} izdarīti`}
            className="md:col-span-2"
            action={editingSubjects && data.subjects.length > 0 && <Button onClick={() => setEditingSubjects(false)} className="text-xs py-1.5 px-3">Gatavs ✓</Button>}
          >
            {editingSubjects ? (
              <SubjectManager compact />
            ) : (
              <ul className="space-y-2">
                {steps.map((s) => (
                  <li key={s.label}>
                    <button type="button" onClick={() => router.push(s.href)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${s.done ? 'border-emerald-200 bg-emerald-50/50 text-slate-400 line-through' : 'border-slate-100 bg-slate-50/70 text-slate-800 font-semibold hover:border-indigo-300'}`}>
                      <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[11px] ${s.done ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'}`}>{s.done ? '✓' : ''}</span>
                      {s.label}
                      {!s.done && <span className="ml-auto text-slate-400">→</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : (
          <Card title="🗓️ Šī nedēļa" subtitle="Aktivitāte pēdējās 7 dienās" className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100"><CountUp as="p" to={stats.activeThisWeek} className="text-2xl font-bold text-slate-800" /><p className="text-xs text-slate-500 mt-1">{stats.activeThisWeek === 1 ? 'aktīva diena' : 'aktīvas dienas'}</p></div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100"><CountUp as="p" to={stats.completed} className="text-2xl font-bold text-slate-800" /><p className="text-xs text-slate-500 mt-1">{stats.completed === 1 ? 'izpildīts darbs' : 'izpildīti darbi'}</p></div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100"><CountUp as="p" to={data.quizResults.length} className="text-2xl font-bold text-slate-800" /><p className="text-xs text-slate-500 mt-1">{data.quizResults.length === 1 ? 'pildīts tests' : 'pildīti testi'}</p></div>
            </div>
          </Card>
        )}

        <Card title="📊 Tavs progress" subtitle="Izpildīto darbu īpatsvars">
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(rgb(var(--acc)) ${stats.progress * 3.6}deg, rgb(var(--s100)) 0deg)` }}
            >
              <div className="w-[5.5rem] h-[5.5rem] rounded-full bg-white flex items-center justify-center text-xl font-bold text-slate-800">
                <CountUp to={stats.progress} suffix="%" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              {stats.total ? `${stats.completed} no ${stats.total} termiņiem un uzdevumiem` : 'Vēl nav neviena termiņa vai uzdevuma'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
