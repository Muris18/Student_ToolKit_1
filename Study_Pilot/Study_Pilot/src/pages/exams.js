import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import ExamSelector from '../features/exams/ExamSelector';
import ExamTaskList from '../features/exams/ExamTaskList';
import QuizMode from '../features/exams/QuizMode';
import AiTutorChat from '../features/exams/AiTutorChat';
import { useApp } from '../lib/AppContext';
import { subjectName } from '../lib/helpers';

const MODES = [
  { id: 'select', label: 'Priekšmeti' },
  { id: 'tasks', label: 'Uzdevumi' },
  { id: 'quiz', label: '⚡ Tests' },
  { id: 'ai', label: '🤖 AI Skolotājs' },
];

function Exams() {
  const router = useRouter();
  const { data } = useApp();
  const [draft, setDraft] = useState('');

  // Režīms un priekšmets dzīvo URL, lai sānu izvēlne un "atpakaļ" poga strādātu
  const q = router.query;
  const activeMode = MODES.some((m) => m.id === q.mode) ? q.mode : 'select';
  const subjectId = data.subjects.some((s) => s.id === q.subject) ? q.subject : '';

  const go = (mode, subject = subjectId) => {
    const query = {};
    if (mode !== 'select') query.mode = mode;
    if (subject) query.subject = subject;
    router.push({ pathname: '/exams', query }, undefined, { shallow: true, scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📚 Eksāmenu sagatavošanās</h1>
          <p className="text-xs text-slate-500 mt-0.5">{subjectId ? subjectName(data, subjectId) : 'Tavi uzdevumi, testi un AI palīgs'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => go(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeMode === m.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {activeMode === 'select' && <ExamSelector onSelectSubject={(id) => go('tasks', id)} />}

      {activeMode === 'tasks' && (
        <ExamTaskList
          key={subjectId}
          subjectId={subjectId}
          onChangeSubject={(id) => go('tasks', id)}
          onOpenAiHelp={(task) => {
            setDraft(`${subjectName(data, task.subjectId)}: ${task.title}${task.source ? ` (${task.source})` : ''} — `);
            go('ai');
          }}
        />
      )}

      {activeMode === 'quiz' && <QuizMode key={subjectId} subjectId={subjectId} onChangeSubject={(id) => go('quiz', id)} />}

      {activeMode === 'ai' && <AiTutorChat draft={draft} />}
    </>
  );
}

export default function ExamsPage() {
  return (
    <AppShell className="max-w-5xl">
      <Exams />
    </AppShell>
  );
}
