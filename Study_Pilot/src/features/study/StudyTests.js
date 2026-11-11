import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MathText from '../../components/MathText';
import SubjectSelect from '../../components/SubjectSelect';
import { EmptyState, inputCls, labelCls } from '../../components/AppShell';
import { QuizPlayer } from '../exams/QuizMode';
import { useApp } from '../../lib/AppContext';
import { uid, subjectName, subjectColor, daysUntil, relDay, fmtDate, toDateStr, todayStr, dienas } from '../../lib/helpers';

// Pārbaudes darbi parastajos priekšmetos. Katrs pārbaudes darbs ir plānotāja ieraksts ar type 'Pārbaudes darbs'
// un papildu lauku study: { topic, notes, summary, cards, quiz, sources, planDone, generatedAt }.

export const TEST_TYPE = 'Pārbaudes darbs';
const isTest = (t) => t.type === TEST_TYPE;

export default function StudyTests() {
  const router = useRouter();
  const { data } = useApp();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const task = id ? data.tasks.find((t) => t.id === id && isTest(t)) : null;
  const open = (taskId) => router.push(taskId ? { pathname: '/parbaudes', query: { id: taskId } } : '/parbaudes', undefined, { shallow: true });

  if (task) return <TestDetail key={task.id} task={task} onBack={() => open('')} />;
  return <TestList onOpen={open} />;
}

// ---------- Saraksts un jauns pārbaudes darbs ----------
function TestList({ onOpen }) {
  const { data, update } = useApp();
  const [creating, setCreating] = useState(false);
  const tests = data.tasks.filter(isTest).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = tests.filter((t) => t.status !== 'completed' && daysUntil(t.dueDate) >= 0);
  const past = tests.filter((t) => !upcoming.includes(t));

  const create = ({ subjectId, topic, dueDate, notes }) => {
    const id = uid();
    update((d) => ({
      ...d,
      tasks: [{
        id, title: topic, subjectId, dueDate, priority: 'high', type: TEST_TYPE, status: 'pending',
        createdAt: new Date().toISOString(), doneAt: null, study: { topic, notes },
      }, ...d.tasks],
    }));
    setCreating(false);
    onOpen(id);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">📝 Pārbaudes darbi</h1>
          <p className="text-sm text-slate-500 mt-1">Kontroldarbi parastajos priekšmetos: konspekts, kartītes, tests un plāns līdz datumam.</p>
        </div>
        {!creating && <Button onClick={() => setCreating(true)} className="px-5 py-2.5">+ Jauns pārbaudes darbs</Button>}
      </div>

      {creating && <NewTestForm onCreate={create} onCancel={() => setCreating(false)} />}

      {tests.length === 0 && !creating && (
        <Card>
          <EmptyState icon="📝" title="Vēl nav pārbaudes darbu" text="Pievieno nākamo kontroldarbu: priekšmetu, tēmu un datumu. AI no tēmas, tavām piezīmēm un Vikipēdijas sagatavos konspektu, kartītes un testu.">
            <Button onClick={() => setCreating(true)}>+ Jauns pārbaudes darbs</Button>
          </EmptyState>
        </Card>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3" aria-label="Gaidāmie pārbaudes darbi">
          <h2 className="sp-mono text-[11px] font-bold text-slate-400">Gaidāmie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{upcoming.map((t) => <TestCard key={t.id} task={t} onOpen={onOpen} />)}</div>
        </section>
      )}
      {past.length > 0 && (
        <section className="space-y-3" aria-label="Pagājušie pārbaudes darbi">
          <h2 className="sp-mono text-[11px] font-bold text-slate-400">Pagājušie un izpildītie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80">{past.map((t) => <TestCard key={t.id} task={t} onOpen={onOpen} />)}</div>
        </section>
      )}
    </>
  );
}

function TestCard({ task, onOpen }) {
  const { data } = useApp();
  const s = task.study || {};
  const n = daysUntil(task.dueDate);
  const learned = (s.cards || []).filter((c) => c.box >= 3).length;
  return (
    <button type="button" onClick={() => onOpen(task.id)} className="pilot-card text-left bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer transition-colors hover:border-indigo-300">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <i className="w-2.5 h-2.5 rounded-full" style={{ background: subjectColor(data, task.subjectId) }} aria-hidden="true" />
        {subjectName(data, task.subjectId)}
        <span className={`ml-auto font-semibold ${n >= 0 && n <= 2 && task.status !== 'completed' ? 'text-rose-700' : 'text-slate-500'}`}>{fmtDate(task.dueDate)} · {relDay(task.dueDate)}</span>
      </div>
      <p className="font-semibold text-slate-900 mt-2">{task.title}</p>
      <p className="text-xs text-slate-500 mt-2">
        {s.summary?.length ? `✓ Konspekts · ${learned}/${(s.cards || []).length} kartītes iemācītas · tests` : 'Materiāli vēl nav sagatavoti'}
      </p>
    </button>
  );
}

function NewTestForm({ onCreate, onCancel }) {
  const { data } = useApp();
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState(toDateStr(new Date(Date.now() + 7 * 86400000)));
  const [notes, setNotes] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!subjectId || topic.trim().length < 3 || !dueDate) return;
    onCreate({ subjectId, topic: topic.trim().slice(0, 200), dueDate, notes: notes.trim().slice(0, 6000) });
  };
  if (!data.subjects.length) {
    return (
      <Card>
        <EmptyState icon="📚" title="Vispirms pievieno priekšmetus" text="Pārbaudes darbs ir piesaistīts priekšmetam, piemēram, vēsturei vai bioloģijai.">
          <Link href="/profile" className="text-sm font-semibold text-accent hover:underline">Uz profilu →</Link>
        </EmptyState>
      </Card>
    );
  }
  return (
    <Card title="Jauns pārbaudes darbs" subtitle="Tas parādīsies arī plānotājā un termiņu radarā">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className={labelCls}>Priekšmets</span>
            <SubjectSelect value={subjectId} onChange={setSubjectId} />
          </div>
          <div>
            <label className={labelCls} htmlFor="st-date">Datums</label>
            <input id="st-date" type="date" value={dueDate} min={todayStr()} onChange={(e) => setDueDate(e.target.value)} required className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="st-topic">Tēma</label>
          <input id="st-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={3} maxLength={200} placeholder="Piem., Latvijas Republikas proklamēšana 1918. gadā" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="st-notes">Piezīmes (nav obligāti)</label>
          <textarea id="st-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} maxLength={6000} placeholder="Ielīmē savu konspektu, skolotāja jautājumus vai grāmatas lappušu galvenos punktus. Jo precīzākas piezīmes, jo labāk AI trāpīs tieši tajā, ko mācījāties." className={`${inputCls} leading-relaxed`} />
          <p className="text-[11px] text-slate-400 mt-1">{notes.length}/6000 · Neraksti personas datus (vārdus, adreses).</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Atcelt</Button>
          <Button type="submit" disabled={!subjectId || topic.trim().length < 3}>Izveidot</Button>
        </div>
      </form>
    </Card>
  );
}

// ---------- Viena pārbaudes darba lapa ----------
const TABS = [
  ['plan', '🗓 Plāns'],
  ['summary', '📄 Konspekts'],
  ['cards', '🃏 Kartītes'],
  ['quiz', '⚡ Tests'],
  ['sources', '🔗 Avoti un piezīmes'],
];

function TestDetail({ task, onBack }) {
  const { data, update, api, setAiConsent } = useApp();
  const s = task.study || {};
  const has = Boolean(s.summary?.length);
  const [tab, setTab] = useState(has ? 'plan' : 'sources');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);

  const setStudy = (fn) => update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, study: fn(t.study || {}) } : t)) }));

  // over: { topic, notes } — ja lietotājs tikko mainīja tēmu vai piezīmes, ņem jaunās vērtības
  const generate = async (kind, over = {}) => {
    setBusy(kind);
    setError(null);
    try {
      const r = await api('/api/study/generate', {
        method: 'POST',
        body: {
          subject: subjectName(data, task.subjectId), topic: over.topic ?? (s.topic || task.title), notes: over.notes ?? (s.notes || ''), kind,
          previous: kind === 'quiz' ? (s.quiz?.questions || []).map((q) => q.question) : [],
        },
      });
      const quiz = { id: uid(), questions: r.quiz.questions, createdAt: new Date().toISOString() };
      setStudy((st) => ({
        ...st,
        ...(kind === 'all' ? { summary: r.summary, cards: r.cards, sources: r.sources, generatedAt: new Date().toISOString() } : {}),
        quiz,
      }));
      setTab(kind === 'all' ? 'plan' : 'quiz');
    } catch (e) {
      setError({ message: e.message, code: e.code });
    }
    setBusy('');
  };

  const consent = async () => {
    setError(null);
    try { await setAiConsent(true); await generate('all'); } catch (e) { setError({ message: e.message }); }
  };

  const n = daysUntil(task.dueDate);
  return (
    <>
      <div className="pilot-dashboard-hero rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="sp-mono inline-block bg-indigo-50 text-indigo-700 text-[10.5px] font-semibold px-3 py-1.5 rounded-full border border-indigo-100">{subjectName(data, task.subjectId)} · pārbaudes darbs</span>
            <h1 className="text-2xl md:text-3xl font-bold mt-3 text-slate-900">{task.title}</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {fmtDate(task.dueDate)} · {n > 0 ? `pēc ${n} ${dienas(n)}` : n === 0 ? 'šodien' : 'jau pagājis'}
            </p>
          </div>
          <Button variant="secondary" onClick={onBack} className="text-xs py-1.5 px-3">← Visi darbi</Button>
        </div>
        {has && (
          <div className="flex flex-wrap gap-2 mt-6" role="tablist" aria-label="Sadaļas">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${tab === id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error.code === 'NO_AI_CONSENT' ? (
            <div className="space-y-3">
              <p className="font-semibold">Lai AI sagatavotu materiālus, vajag tavu piekrišanu</p>
              <p className="text-slate-700">
                Tēmu, priekšmetu, klasi un tavas piezīmes nosūta uz <strong>DeepSeek</strong>, kas datus apstrādā ārpus ES (Ķīnā).
                Tēmas tekstu nosūta arī Vikipēdijai, lai atrastu avotus. Tavs vārds, e-pasts un skola netiek sūtīti. Sīkāk — <Link href="/privacy" className="underline">privātuma politikā</Link>.
              </p>
              <Button onClick={consent}>Piekrītu un sagatavot</Button>
            </div>
          ) : error.message}
        </div>
      )}

      {(!has || tab === 'sources') && (
        <NotesAndSources task={task} setStudy={setStudy} canGenerate={!busy} onGenerate={(over) => generate('all', over)} busy={busy === 'all'} has={has} />
      )}
      {has && tab === 'plan' && <StudyPlan task={task} setStudy={setStudy} onGo={setTab} />}
      {has && tab === 'summary' && <Summary study={s} />}
      {has && tab === 'cards' && <Flashcards cards={s.cards || []} onChange={(cards) => setStudy((st) => ({ ...st, cards }))} />}
      {has && tab === 'quiz' && (
        s.quiz?.questions?.length ? (
          <>
            <QuizPlayer key={s.quiz.id} quiz={{ id: s.quiz.id, title: task.title, subjectId: task.subjectId, questions: s.quiz.questions }} onExit={() => setTab('plan')} />
            <div className="flex justify-end">
              <Button variant="secondary" disabled={Boolean(busy)} onClick={() => generate('quiz')}>{busy === 'quiz' ? 'AI veido…' : '↻ Jauns tests ar citiem jautājumiem'}</Button>
            </div>
          </>
        ) : <Card><p className="text-sm text-slate-500">Testa vēl nav.</p></Card>
      )}
    </>
  );
}

function NotesAndSources({ task, setStudy, onGenerate, canGenerate, busy, has }) {
  const s = task.study || {};
  const [notes, setNotes] = useState(s.notes || '');
  const [topic, setTopic] = useState(s.topic || task.title);
  const dirty = notes !== (s.notes || '') || topic !== (s.topic || task.title);
  const clean = () => ({ notes: notes.trim().slice(0, 6000), topic: topic.trim().slice(0, 200) || task.title });
  const save = () => setStudy((st) => ({ ...st, ...clean() }));
  const run = () => { const v = clean(); if (dirty) save(); onGenerate(v); };
  return (
    <>
      <Card title={has ? 'Tēma un piezīmes' : 'Sagatavo materiālus'} subtitle={has ? 'Ja piezīmes maini, sagatavo materiālus no jauna' : 'AI no tēmas, tavām piezīmēm un Vikipēdijas izveidos konspektu, kartītes, testu un plānu'}>
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="sd-topic">Tēma</label>
            <input id="sd-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={200} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="sd-notes">Tavas piezīmes</label>
            <textarea id="sd-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} maxLength={6000} placeholder="Ielīmē konspektu vai skolotāja jautājumus. Nav obligāti, bet ar tām materiāli būs precīzāki." className={`${inputCls} leading-relaxed`} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {dirty && <Button variant="secondary" onClick={save}>Saglabāt</Button>}
            <Button disabled={!canGenerate} onClick={run} className="px-5 py-2.5">
              {busy ? 'AI gatavo materiālus… (līdz 1 min)' : has ? '↻ Sagatavot no jauna' : '✨ Sagatavot materiālus ar AI'}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">Viena sagatavošana = viens AI jautājums no dienas limita. AI var kļūdīties: svarīgo pārbaudi mācību grāmatā.</p>
        </div>
      </Card>
      {has && (
        <Card title="Avoti" subtitle="Vikipēdijas raksti, ko AI izmantoja papildus tavām piezīmēm">
          {s.sources?.length ? (
            <ul className="space-y-2 text-sm">
              {s.sources.map((src) => (
                <li key={src.url}><a href={src.url} target="_blank" rel="noopener noreferrer" className="text-accent underline">{src.title} ↗</a> <span className="text-xs text-slate-400">· Vikipēdija, CC BY-SA</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">Vikipēdijā atbilstošu rakstu neatrada, tāpēc materiāli balstīti uz tavām piezīmēm un AI zināšanām. Pārbaudi tos ar mācību grāmatu.</p>}
        </Card>
      )}
    </>
  );
}

function Summary({ study }) {
  return (
    <Card title="📄 Konspekts" subtitle="Galvenais, kas jāzina">
      <div className="space-y-5">
        {study.summary.map((sec) => (
          <section key={sec.heading}>
            <h3 className="font-semibold text-slate-900 mb-2">{sec.heading}</h3>
            <ul className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
              {sec.points.map((p, i) => <li key={i} className="flex gap-2"><span className="text-accent" aria-hidden="true">✦</span><MathText as="span" text={p} /></li>)}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
}

// Kartītes: 3 kastītes (Leitnera sistēma). "Zinu" -> nākamā kastīte, "Vēl nezinu" -> atpakaļ uz 1.
// Kārta sākas ar zemākajām kastītēm; secība tiek noteikta kārtas sākumā, lai kartītes nelēkātu.
function Flashcards({ cards, onChange }) {
  const [round, setRound] = useState(0);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const order = useMemo(() => [...cards].sort((a, b) => a.box - b.box).map((c) => c.id), [round, cards.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const learned = cards.filter((c) => c.box >= 3).length;
  if (!cards.length) return <Card><p className="text-sm text-slate-500">Kartīšu nav.</p></Card>;
  const finished = i >= order.length;
  const current = finished ? null : cards.find((c) => c.id === order[i]);

  const answer = (knew) => {
    onChange(cards.map((c) => (c.id === current.id ? { ...c, box: knew ? Math.min(3, c.box + 1) : 1 } : c)));
    setFlipped(false);
    setI((x) => x + 1);
  };
  const nextRound = () => { setRound((r) => r + 1); setI(0); setFlipped(false); };
  const reset = () => { onChange(cards.map((c) => ({ ...c, box: 1 }))); nextRound(); };

  return (
    <Card title="🃏 Kartītes" subtitle={`Iemācītas ${learned} no ${cards.length}${finished ? '' : ` · kartīte ${i + 1} no ${order.length}`}`}>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-5"><div className="h-full rounded-full sp-btn-primary" style={{ width: `${(learned / cards.length) * 100}%` }} /></div>
      {finished || !current ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-lg font-semibold text-slate-900">{learned === cards.length ? 'Visas kartītes iemācītas! 🎉' : 'Kārta pabeigta'}</p>
          <p className="text-sm text-slate-500">{learned === cards.length ? 'Pirms pārbaudes darba vari tās izskatīt vēlreiz.' : 'Nākamā kārta sāksies ar kartītēm, kuras vēl nezini.'}</p>
          <Button onClick={nextRound}>Nākamā kārta</Button>
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Rādīt jautājumu' : 'Rādīt atbildi'}
            className="w-full min-h-[12rem] p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-indigo-300">
            <span className="sp-mono text-[10.5px] font-bold text-slate-400 mb-3">{flipped ? 'Atbilde' : 'Jautājums'} · kastīte {current.box}/3</span>
            <MathText as="div" text={flipped ? current.back : current.front} className={`text-slate-900 leading-relaxed ${flipped ? 'text-base' : 'text-lg font-semibold'}`} />
            {!flipped && <span className="text-xs text-slate-400 mt-4">Padomā un tad spied, lai redzētu atbildi</span>}
          </button>
          <div className="flex flex-wrap justify-between gap-2 mt-4">
            <Button variant="ghost" onClick={reset} className="text-xs">Sākt no jauna</Button>
            {flipped ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => answer(false)}>Vēl nezinu</Button>
                <Button onClick={() => answer(true)}>Zinu ✓</Button>
              </div>
            ) : <Button onClick={() => setFlipped(true)}>Rādīt atbildi</Button>}
          </div>
        </>
      )}
    </Card>
  );
}

// Plāns līdz datumam: bez AI, pēc atlikušo dienu skaita. Izpildītās dienas tiek atzīmētas study.planDone.
// Diena 0: konspekts + kartītes; starpdienas pārmaiņus kartītes/tests (līdz 8); pirmspēdējā: tests + nezināmās kartītes; pēdējā: pārbaudes darbs.
export function buildPlan(dueDate, today = todayStr()) {
  const start = new Date(`${today}T00:00:00`);
  const days = Math.round((new Date(`${dueDate}T00:00:00`) - start) / 86400000);
  if (days < 0) return [];
  const steps = [];
  const add = (offset, title, tab) => steps.push({ date: toDateStr(new Date(start.getTime() + offset * 86400000)), title, tab });
  if (days === 0) { add(0, 'Izlasi konspektu, izej kartītes un izpildi testu', 'summary'); return steps; }
  add(0, 'Izlasi konspektu un pirmo reizi izej visas kartītes', 'summary');
  const middle = Math.min(Math.max(days - 2, 0), 8);
  for (let k = 1; k <= middle; k++) {
    const offset = Math.max(1, Math.round((k * (days - 2)) / middle));
    add(offset, k % 2 ? 'Kartītes: atkārto tās, ko vēl nezini' : 'Izpildi testu un izlasi skaidrojumus kļūdām', k % 2 ? 'cards' : 'quiz');
  }
  if (days >= 2) add(days - 1, 'Pēdējā sagatavošanās: tests vēlreiz un visas nezināmās kartītes', 'quiz');
  add(days, 'Pārbaudes darbs! No rīta ātri pārskati konspektu', 'summary');
  return steps.filter((st, idx, arr) => arr.findIndex((x) => x.date === st.date) === idx);
}

function StudyPlan({ task, setStudy, onGo }) {
  const plan = buildPlan(task.dueDate);
  const done = task.study?.planDone || {};
  const toggle = (date) => setStudy((st) => ({ ...st, planDone: { ...(st.planDone || {}), [date]: !(st.planDone || {})[date] } }));
  const today = todayStr();
  if (!plan.length) return <Card title="🗓 Plāns"><p className="text-sm text-slate-500">Pārbaudes darbs jau ir pagājis. Ja gribi atkārtot, izmanto kartītes un testu.</p></Card>;
  return (
    <Card title="🗓 Plāns līdz pārbaudes darbam" subtitle="Atzīmē dienas, kad esi izdarījis">
      <ol className="space-y-2">
        {plan.map((p) => {
          const isDone = Boolean(done[p.date]);
          const isToday = p.date === today;
          return (
            <li key={p.date} className={`flex items-center gap-3 p-3 rounded-xl border ${isToday ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
              <input type="checkbox" checked={isDone} onChange={() => toggle(p.date)} aria-label={`${fmtDate(p.date)} izdarīts`} className="w-4 h-4 accent-[rgb(var(--acc))] cursor-pointer shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="sp-mono text-[10.5px] font-bold text-slate-400">{isToday ? 'Šodien' : `${fmtDate(p.date)} · ${relDay(p.date)}`}</p>
                <p className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{p.title}</p>
              </div>
              {p.tab && <button type="button" onClick={() => onGo(p.tab)} className="text-xs font-semibold text-accent hover:underline cursor-pointer shrink-0">Atvērt →</button>}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
