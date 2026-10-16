import React from 'react';
import Card from '../../components/Card';
import SubjectManager from '../profile/SubjectManager';
import { useApp } from '../../lib/AppContext';
import { gradeLabel } from '../../lib/helpers';

// Izvēlies vienu no saviem priekšmetiem, lai strādātu ar tā uzdevumiem un testiem
export default function ExamSelector({ onSelectSubject }) {
  const { user, data } = useApp();

  if (data.subjects.length === 0) {
    return (
      <Card title="📚 Sāc ar priekšmetiem" subtitle={`Kurus priekšmetus kārto ${gradeLabel(user.profile)}? Pievieno tos, un tad vari krāt uzdevumus un veidot testus.`}>
        <SubjectManager compact />
      </Card>
    );
  }

  return (
    <Card title="📚 Izvēlies priekšmetu" subtitle={`${gradeLabel(user.profile)} · ${data.subjects.length} priekšmeti`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.subjects.map((s) => {
          const ex = data.exercises.filter((x) => x.subjectId === s.id);
          const quizzes = data.quizzes.filter((q) => q.subjectId === s.id).length;
          const done = ex.filter((x) => x.completed).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSubject(s.id)}
              className="group p-4 rounded-2xl border border-slate-200 bg-white text-left transition-all cursor-pointer hover:border-indigo-400 hover:-translate-y-0.5"
              style={{ borderLeft: `5px solid ${s.color}` }}
            >
              <p className="font-bold text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {ex.length ? `${done}/${ex.length} uzdevumi izpildīti` : 'Nav uzdevumu'} · {quizzes} {quizzes === 1 ? 'tests' : 'testi'}
              </p>
              <span className="text-xs font-semibold text-accent mt-3 inline-block group-hover:translate-x-1 transition-transform">Atvērt →</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
