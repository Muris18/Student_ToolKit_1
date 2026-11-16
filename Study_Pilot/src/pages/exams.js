import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import QuizMode from '../features/exams/QuizMode';
import AiTutorChat from '../features/exams/AiTutorChat';
import OfficialExams from '../features/exams/OfficialExams';

const MODES = [
  { id: 'official', label: '📄 Valsts eksāmeni' },
  { id: 'quiz', label: '⚡ Testa režīms' },
  { id: 'ai', label: '🤖 AI mācību palīgs' },
];

function Exams() {
  const router = useRouter();
  const [draft, setDraft] = useState('');

  // Režīms dzīvo URL, lai sānu izvēlne un "atpakaļ" poga strādātu. Pēc noklusējuma: valsts eksāmeni.
  const q = router.query;
  const activeMode = MODES.some((m) => m.id === q.mode) ? q.mode : 'official';

  const go = (mode) => {
    const query = mode === 'official' ? {} : { mode };
    router.push({ pathname: '/exams', query }, undefined, { shallow: true, scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📚 Eksāmenu sagatavošanās</h1>
          <p className="text-xs text-slate-500 mt-0.5">Valsts eksāmeni, testi un AI palīgs</p>
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

      {activeMode === 'quiz' && <QuizMode />}

      {activeMode === 'official' && (
        <OfficialExams
          onAskAi={(text) => {
            const t = text.slice(0, 1400);
            try { sessionStorage.setItem('sp-ai-draft', t); } catch (e) {}
            setDraft(t);
            go('ai');
          }}
        />
      )}

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
