import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MathText from '../../components/MathText';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const docLabel = (d) => `${cap(d.subject)} · ${d.grade}. klase · ${d.year}${d.session ? ` (${d.session})` : ''}`;

// Valsts eksāmenu treniņš: VIAA uzdevumi, testa jautājumu pārbaude, atvērtie uzdevumi -> AI skolotājs
export default function OfficialExams({ onAskAi }) {
  const { user, api } = useApp();
  const defaultGrade = user.profile.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : 12;
  const [grade, setGrade] = useState(defaultGrade);
  const [docs, setDocs] = useState(null);
  const [docId, setDocId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setDocs(null);
    setError('');
    api(`/api/exams?grade=${grade}`).then((r) => setDocs(r.docs)).catch((e) => setError(e.message));
  }, [grade, api]);

  if (docId) return <ExamDoc id={docId} onBack={() => setDocId(null)} onAskAi={onAskAi} />;

  return (
    <Card
      title="Valsts eksāmeni"
      subtitle="Iepriekšējo gadu VIAA eksāmenu uzdevumi ar atbilžu pārbaudi"
      action={
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100" role="group" aria-label="Klase">
          {[9, 12].map((g) => (
            <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${grade === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{g}. klase</button>
          ))}
        </div>
      }
    >
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!docs && !error && <p className="text-sm text-slate-400">Ielādē…</p>}
      {docs && docs.length === 0 && (
        <EmptyState icon="📄" title={`${grade}. klases eksāmeni vēl tiek pievienoti`} text="Administrators tos pievieno sadaļā Administrēšana. Pagaidām vari jautāt AI skolotājam vai pārslēgt klasi." />
      )}
      {docs && docs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docs.map((d) => (
            <button key={d.id} type="button" onClick={() => setDocId(d.id)} className="group p-4 rounded-2xl border border-slate-200 bg-white text-left cursor-pointer transition-colors hover:border-indigo-400">
              <p className="font-semibold text-slate-900">{d.title}</p>
              <p className="text-xs text-slate-500 mt-1">{docLabel(d)} · {d.tasks} uzdevumi</p>
              <span className="text-xs font-semibold text-accent mt-3 inline-block">Sākt treniņu →</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function ExamDoc({ id, onBack, onAskAi }) {
  const { api, data, update } = useApp();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [section, setSection] = useState('all');

  useEffect(() => {
    api(`/api/exams/${id}`).then(setDoc).catch((e) => setError(e.message));
  }, [id, api]);

  const attempts = useMemo(() => Object.fromEntries((data.examAttempts || []).map((a) => [a.taskId, a])), [data.examAttempts]);
  const record = (taskId, correct) =>
    update((d) => ({ ...d, examAttempts: [...(d.examAttempts || []).filter((a) => a.taskId !== taskId), { taskId, correct, at: new Date().toISOString() }].slice(-2000) }));

  if (error) return <Card><p className="text-sm text-rose-600">{error}</p><Button variant="secondary" onClick={onBack} className="mt-4">← Atpakaļ</Button></Card>;
  if (!doc) return <Card><p className="text-sm text-slate-400">Ielādē uzdevumus…</p></Card>;

  const sections = [...new Set(doc.tasks.map((t) => t.section).filter(Boolean))];
  const tasks = doc.tasks.filter((t) => section === 'all' || t.section === section);
  const choice = doc.tasks.filter((t) => t.kind === 'choice');
  const done = choice.filter((t) => attempts[t.id]);
  const right = done.filter((t) => attempts[t.id].correct);

  return (
    <>
      <Card
        title={doc.title}
        subtitle={docLabel(doc)}
        action={<Button variant="secondary" onClick={onBack} className="text-xs py-1.5 px-3">← Visi eksāmeni</Button>}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-500">Testa jautājumi: <strong className="text-slate-900">{right.length}/{done.length}</strong> pareizi no {choice.length}</span>
          {doc.source_url && <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-accent underline text-xs">Oriģināls VIAA vietnē ↗</a>}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${choice.length ? (right.length / choice.length) * 100 : 0}%` }} /></div>
        {sections.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {['all', ...sections].map((s) => (
              <button key={s} type="button" onClick={() => setSection(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${section === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{s === 'all' ? 'Visas daļas' : s}</button>
            ))}
          </div>
        )}
      </Card>
      {tasks.map((t) => <ExamTask key={t.id} task={t} doc={doc} attempt={attempts[t.id]} onResult={record} onAskAi={onAskAi} />)}
    </>
  );
}

function ExamTask({ task, doc, attempt, onResult, onAskAi }) {
  const { api } = useApp();
  const [picked, setPicked] = useState('');
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const check = async (key) => {
    setPicked(key);
    setBusy(true);
    setError('');
    try {
      const r = await api('/api/exams/check', { method: 'POST', body: { taskId: task.id, answer: key } });
      setResult(r);
      if (r.checkable) onResult(task.id, r.correct);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const label = `${doc.year}. g. ${doc.grade}. kl. ${doc.subject}, ${task.number}. uzdevums`;
  const ask = () => onAskAi(`${label}: ${task.text}${answer.trim() ? `\nMana atbilde: ${answer.trim()}\nVai tā ir pareiza? Ja nē, dod mājienu.` : '\nDod man pirmo mājienu.'}`);

  return (
    <article className="pilot-card bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
      <header className="flex flex-wrap items-center gap-2 text-xs mb-3">
        <span className="font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{task.number}.</span>
        {task.topic && <span className="text-slate-500">{task.topic}</span>}
        {task.points != null && <span className="text-slate-400">· {task.points} p.</span>}
        {attempt && <span className={`ml-auto font-semibold ${attempt.correct ? 'text-emerald-700' : 'text-rose-700'}`}>{attempt.correct ? '✓ Atrisināts' : '✗ Mēģināts'}</span>}
      </header>
      {task.context && <MathText text={task.context} className="text-sm text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3" />}
      {task.figure && <p className="text-xs text-slate-500 italic mb-3">Attēls: {task.figure} (skaties oriģinālajā eksāmenā)</p>}
      <MathText text={task.text} className="text-[15px] text-slate-900 leading-relaxed" />

      {task.kind === 'choice' && task.options.length > 0 ? (
        <div className="grid gap-2 mt-4">
          {task.options.map((o) => {
            const isPicked = picked === o.key && result?.checkable;
            const cls = isPicked ? (result.correct ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50') : 'border-slate-200 hover:border-indigo-400';
            return (
              <button key={o.key} type="button" disabled={busy} onClick={() => check(o.key)} className={`flex gap-3 items-start text-left p-3 rounded-xl border bg-white cursor-pointer transition-colors ${cls}`}>
                <span className="font-bold text-slate-500 w-5 shrink-0">{o.key}</span>
                <MathText as="span" text={o.text} className="text-sm text-slate-800" />
              </button>
            );
          })}
          {result?.checkable && (
            <div role="status" className={`text-sm font-medium ${result.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
              {result.correct ? 'Pareizi! 🎉' : 'Nav gluži. Pamēģini vēlreiz vai paprasi mājienu.'}
              {result.solution && <MathText text={result.solution} className="mt-2 text-slate-600 font-normal" />}
            </div>
          )}
          {result && !result.correct && <button type="button" onClick={ask} className="justify-self-start text-xs font-semibold text-accent hover:underline cursor-pointer">Paprasīt mājienu AI skolotājam →</button>}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} placeholder="Uzraksti savu atbildi vai risinājumu (formulas: $x^2$)…" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" maxLength={1200} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={ask} className="text-xs py-2">{answer.trim() ? 'Pārbaudīt ar AI skolotāju' : 'Saņemt mājienu no AI'}</Button>
            {!attempt && answer.trim() && <Button variant="secondary" onClick={() => onResult(task.id, true)} className="text-xs py-2">Atzīmēt kā izdarītu</Button>}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
    </article>
  );
}
