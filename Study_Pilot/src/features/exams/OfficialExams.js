import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MathText from '../../components/MathText';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import ExamSimulation from './ExamSimulation';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const docLabel = (d) => `${cap(d.subject)} · ${d.grade}. klase · ${d.year}${d.session ? ` (${d.session})` : ''}`;

// Valsts eksāmenu treniņš: VIAA uzdevumi, testa jautājumu pārbaude, atvērtie uzdevumi -> AI skolotājs
const LEVEL_ORDER = ['vispārīgais līmenis', 'optimālais līmenis', 'augstākais līmenis'];
const levelRank = (l) => { const i = LEVEL_ORDER.indexOf(l); return i < 0 ? 9 : i; };
const SUBJECT_ICON = { 'latviešu valoda': '📖', 'angļu valoda': '🇬🇧', matemātika: '📐', dabaszinātnes: '🔬' };
// Latviešu skaitlis: 1, 21, 31 … uzdevums; 11 un pārējie – uzdevumi
const lv = (n, one, many) => (n % 10 === 1 && n % 100 !== 11 ? one : many);
const chip = (on) => `px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${on ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`;

// Valsts eksāmenu treniņš: VIAA uzdevumi, testa jautājumu pārbaude, atvērtie uzdevumi -> AI skolotājs
export default function OfficialExams({ onAskAi }) {
  const { user, api } = useApp();
  const defaultGrade = user.profile.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : 12;
  const [grade, setGrade] = useState(defaultGrade);
  const [docs, setDocs] = useState(null);
  const [docId, setDocId] = useState(null);
  const [simId, setSimId] = useState(null);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    setDocs(null);
    setError('');
    api(`/api/exams?grade=${grade}`).then((r) => setDocs(r.docs)).catch((e) => setError(e.message));
  }, [grade, api]);

  const subjects = useMemo(() => [...new Set((docs || []).map((d) => d.subject))], [docs]);
  const current = subjects.includes(subject) ? subject : subjects[0];
  const ofSubject = (docs || []).filter((d) => d.subject === current);
  const levels = [...new Set(ofSubject.map((d) => d.session).filter(Boolean))].sort((x, y) => levelRank(x) - levelRank(y));
  const shown = ofSubject.filter((d) => level === 'all' || d.session === level || !levels.includes(level));
  const years = [...new Set(shown.map((d) => d.year))].sort((x, y) => y - x);

  if (simId) return <ExamSimulation id={simId} onExit={() => setSimId(null)} />;
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
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Priekšmets">
            {subjects.map((s) => {
              const n = docs.filter((d) => d.subject === s).length;
              const on = s === current;
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => { setSubject(s); setLevel('all'); }} className={`flex-1 min-w-[10rem] flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-colors ${on ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                  <span className="text-2xl" aria-hidden="true">{SUBJECT_ICON[s] || '📄'}</span>
                  <span>
                    <span className={`block font-semibold text-sm ${on ? 'text-indigo-700' : 'text-slate-900'}`}>{cap(s)}</span>
                    <span className="block text-xs text-slate-500">{n} {lv(n, 'eksāmens', 'eksāmeni')}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {levels.length > 1 && (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Līmenis">
              <span className="text-xs font-semibold text-slate-400 mr-1">Līmenis:</span>
              {['all', ...levels].map((l) => (
                <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={chip(level === l)}>{l === 'all' ? 'Visi' : cap(l.replace(' līmenis', ''))}</button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {years.map((y) => (
              <section key={y} aria-label={`${y}. gads`}>
                <h4 className="text-sm font-bold text-slate-900 mb-2">{y}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {shown.filter((d) => d.year === y).sort((x, z) => levelRank(x.session) - levelRank(z.session)).map((d) => (
                    <div key={d.id} className="p-3 rounded-xl border border-slate-200 bg-white transition-colors hover:border-indigo-400">
                      <p className="font-semibold text-sm text-slate-900">{d.session ? cap(d.session) : 'Centralizētais eksāmens'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{d.tasks} {lv(d.tasks, 'uzdevums', 'uzdevumi')}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <button type="button" onClick={() => setDocId(d.id)} className="text-xs font-semibold text-accent cursor-pointer hover:underline">Treniņš →</button>
                        <button type="button" onClick={() => setSimId(d.id)} className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-900 hover:underline">⏱ Simulācija</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
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
      {tasks.map((t, i) => (
        <ExamTask
          key={t.id}
          task={t}
          doc={doc}
          attempt={attempts[t.id]}
          onResult={record}
          onAskAi={onAskAi}
          showContext={Boolean(t.context) && (i === 0 || tasks[i - 1].context !== t.context)}
          showFigure={Boolean(t.figure) && (i === 0 || tasks[i - 1].figure !== t.figure)}
        />
      ))}
    </>
  );
}

function ExamTask({ task, doc, attempt, onResult, onAskAi, showContext, showFigure }) {
  const { api } = useApp();
  const [picked, setPicked] = useState('');
  const [result, setResult] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState(null);

  const reveal = async () => {
    setBusy(true);
    setError('');
    try {
      setModel(await api('/api/exams/answer', { method: 'POST', body: { taskId: task.id } }));
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

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
      {showContext && <MathText text={task.context} className="text-sm text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 max-h-[32rem] overflow-y-auto" />}
      {showFigure && <p className="text-xs text-slate-500 italic mb-3">Attēls: {task.figure} (skaties oriģinālajā eksāmenā)</p>}
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
            {task.has_answer && !model && <Button variant="secondary" disabled={busy} onClick={reveal} className="text-xs py-2">Parādīt atbildes paraugu</Button>}
          </div>
          {model && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm">
              <p className="text-xs font-semibold text-emerald-800 mb-1">Atbildes paraugs</p>
              {model.answer && <MathText text={model.answer} className="text-slate-800" />}
              {model.solution && model.solution !== model.answer && <MathText text={model.solution} className="mt-2 text-slate-600" />}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
    </article>
  );
}
