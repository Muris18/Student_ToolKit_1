import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MathText from '../../components/MathText';
import { useApp } from '../../lib/AppContext';

// Eksāmena simulācija: viss VIAA eksāmens ar taimeri, bez mājieniem un pārbaudes pa vienam.
// Beigās serveris pārbauda testa jautājumus; atvērtos uzdevumus skolēns novērtē pats pēc atbildes parauga.
// Kļūdas tiek ierakstītas examAttempts, tāpēc Testa režīms pēc tam veido treniņu no tām.

const DURATIONS = [45, 90, 120, 180, 0]; // 0 = bez laika ierobežojuma
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const store = (id) => `sp-sim-${id}`;
const loadRun = (id) => { try { return JSON.parse(localStorage.getItem(store(id)) || 'null'); } catch (e) { return null; } };
const saveRun = (id, run) => { try { run ? localStorage.setItem(store(id), JSON.stringify(run)) : localStorage.removeItem(store(id)); } catch (e) {} };
const pts = (t) => (Number(t.points) > 0 ? Number(t.points) : 1);
const clock = (sec) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};
const lvPoints = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'punkta' : 'punktiem');
const isOpen = (t) => t.kind !== 'choice';

// Īsas atbildes salīdzināšana ("125" = "125", "0,09" = "0.09", "$x^{10}$" = "x^10").
// Tikai īsām atbildēm (līdz 40 simboliem) — garus risinājumus un kritērijus vērtē pats skolēns.
const simplify = (s) => String(s || '').toLowerCase()
  .replace(/\\(?:left|right|,|;|!)/g, '').replace(/\\cdot|\\times/g, '*')
  .replace(/[\s${}]/g, '').replace(/,/g, '.').replace(/\.$/, '');
function sameAnswer(mine, model) {
  const a = simplify(mine);
  const b = simplify(model);
  return Boolean(a) && Boolean(b) && b.length <= 40 && a === b;
}

// Rezultāts no vērtējuma: skaita testa jautājumus ar atbildes atslēgu un visus atvērtos uzdevumus
function scoreOf(doc, run) {
  const graded = run.graded || {};
  const counted = doc.tasks.filter((t) => isOpen(t) || graded[t.id]?.checkable);
  const earned = (t) => (isOpen(t) ? Number(run.self?.[t.id] || 0) : graded[t.id]?.correct ? pts(t) : 0);
  const max = counted.reduce((s, t) => s + pts(t), 0);
  const score = counted.reduce((s, t) => s + earned(t), 0);
  return { counted, earned, max, score, percent: max ? Math.round((score / max) * 100) : 0 };
}

export default function ExamSimulation({ id, onExit }) {
  const { api, data, update } = useApp();
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [run, setRun] = useState(null); // { startedAt, minutes, answers, open, finishedAt?, graded?, self?, saved? }
  const [minutes, setMinutes] = useState(120);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/exams/${id}`).then(setDoc).catch((e) => setError(e.message));
    setRun(loadRun(id)); // nepabeigta simulācija pēc lapas pārlādes
  }, [id, api]);

  // Pieņem jaunu stāvokli vai funkciju (prev => next), lai ātras secīgas izmaiņas nepazustu
  const persist = useCallback((next) => {
    setRun((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      saveRun(id, value);
      return value;
    });
  }, [id]);

  // Pārejot uz nākamo soli (sākums -> pildīšana -> pašvērtējums -> rezultāts), lapa sākas no augšas
  const phase = !run ? 'setup' : !run.graded ? 'run' : !run.saved ? 'review' : 'result';
  useEffect(() => { window.scrollTo({ top: 0 }); }, [phase]);

  // Saglabā rezultātu lietotāja datos: kļūdas -> examAttempts (Testa režīmam), kopsavilkums -> simulations
  const finalize = useCallback((r) => {
    const { counted, earned, max, score, percent } = scoreOf(doc, r);
    const at = new Date().toISOString();
    const attempts = counted.map((t) => ({ taskId: t.id, correct: earned(t) >= pts(t), at }));
    const ids = new Set(attempts.map((a) => a.taskId));
    const summary = {
      id: `${id}-${r.startedAt}`, docId: id, title: doc.title, at, minutes: r.minutes,
      usedSec: Math.round((r.finishedAt - r.startedAt) / 1000), score, max, percent,
    };
    update((d) => ({
      ...d,
      examAttempts: [...(d.examAttempts || []).filter((a) => !ids.has(a.taskId)), ...attempts].slice(-2000),
      simulations: [...(d.simulations || []).filter((s) => s.id !== summary.id), summary].slice(-50),
    }));
    persist({ ...r, saved: true });
  }, [doc, id, update, persist]);

  const submit = useCallback(async () => {
    if (!run || !doc) return;
    setBusy(true);
    setError('');
    try {
      const choiceAnswers = Object.fromEntries(Object.entries(run.answers).filter(([, v]) => v));
      const r = await api('/api/exams/grade', { method: 'POST', body: { docId: id, answers: choiceAnswers } });
      const graded = Object.fromEntries(r.tasks.map((t) => [t.id, t]));
      // Tukšas atvērtās atbildes uzreiz 0 punkti; īsa atbilde, kas precīzi sakrīt ar paraugu, uzreiz pilni punkti
      // (abus skolēns pēc tam var mainīt)
      const self = {};
      const auto = {};
      doc.tasks.forEach((t) => {
        if (!isOpen(t)) return;
        const mine = String(run.open[t.id] || '');
        if (!mine.trim()) self[t.id] = 0;
        else if (sameAnswer(mine, graded[t.id]?.answer)) { self[t.id] = pts(t); auto[t.id] = true; }
      });
      const next = { ...run, finishedAt: Date.now(), graded, self, auto };
      if (doc.tasks.some((t) => isOpen(t) && self[t.id] == null)) persist(next);
      else finalize(next); // nav ko pašvērtēt -> rezultāts uzreiz
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }, [run, doc, api, id, persist, finalize]);

  if (error && !doc) return <Card><p className="text-sm text-rose-600">{error}</p><Button variant="secondary" onClick={onExit} className="mt-4">← Atpakaļ</Button></Card>;
  if (!doc) return <Card><p className="text-sm text-slate-400">Ielādē eksāmenu…</p></Card>;

  const totalPoints = doc.tasks.reduce((s, t) => s + pts(t), 0);
  const openTasks = doc.tasks.filter(isOpen);
  const past = (data.simulations || []).filter((s) => s.docId === id).slice(-3).reverse();

  // ---------- Sākums ----------
  if (!run) {
    return (
      <Card
        title="Eksāmena simulācija"
        subtitle={doc.title}
        action={<Button variant="secondary" onClick={onExit} className="text-xs py-1.5 px-3">← Atpakaļ</Button>}
      >
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="Uzdevumi" value={doc.tasks.length} />
          <Stat label="Punkti kopā" value={totalPoints} />
          <Stat label="Atvērtie uzdevumi" value={openTasks.length} />
        </div>
        <ul className="mt-5 space-y-2 text-sm text-slate-600">
          <li>⏱️ Taimeris rit visu laiku. Kad laiks beidzas, darbs tiek iesniegts automātiski.</li>
          <li>🤫 Simulācijas laikā nav mājienu un pareizo atbilžu, tāpat kā īstajā eksāmenā.</li>
          <li>✅ Beigās testa jautājumus pārbauda automātiski, bet atvērtos uzdevumus tu novērtē pats pēc atbildes parauga.</li>
          <li>🎯 Kļūdas nonāk Testa režīmā, lai pēc tam varētu tās trenēt.</li>
        </ul>
        <p className="sp-mono text-[11px] font-bold text-slate-400 mt-6 mb-2">Laiks</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Simulācijas laiks">
          {DURATIONS.map((m) => (
            <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)}
              className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border transition-colors ${minutes === m ? 'border-transparent bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {m ? `${m} min` : 'Bez laika'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Oriģinālā eksāmena laiku skaties VIAA dokumentā. Klausīšanās un mutvārdu daļa šeit nav iekļauta.</p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button onClick={() => persist({ startedAt: Date.now(), minutes, answers: {}, open: {} })} className="px-6 py-2.5">Sākt simulāciju</Button>
          {doc.source_url && <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">Oriģināls VIAA vietnē ↗</a>}
        </div>
        {past.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="sp-mono text-[11px] font-bold text-slate-400 mb-2">Iepriekšējie mēģinājumi</p>
            <ul className="space-y-1 text-sm">
              {past.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 text-slate-600">
                  <span>{new Date(s.at).toLocaleDateString('lv-LV')}</span>
                  <span className="font-semibold text-slate-900">{s.score}/{s.max} p. · {s.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  }

  // ---------- Pildīšana ----------
  if (!run.graded) {
    const exit = () => { if (window.confirm('Pārtraukt simulāciju? Atbildes netiks saglabātas.')) { persist(null); onExit(); } };
    return <RunView doc={doc} run={run} persist={persist} onSubmit={submit} busy={busy} error={error} onExit={exit} />;
  }

  const graded = run.graded;

  // ---------- Pašvērtējums ----------
  if (!run.saved) {
    const pending = openTasks.filter((t) => run.self?.[t.id] == null).length;
    return (
      <>
        <Card title="Novērtē atvērtos uzdevumus" subtitle={`Salīdzini savu atbildi ar paraugu un atzīmē punktus. Atlikuši: ${pending} no ${openTasks.length}.`}>
          <p className="text-sm text-slate-500">Esi godīgs pret sevi: īstajā eksāmenā vērtē pēc kritērijiem. Ja atbilde ir daļēji pareiza, dod daļu punktu. Neatbildētajiem uzdevumiem jau ir 0 punktu.</p>
        </Card>
        {openTasks.map((t) => (
          <article key={t.id} className="pilot-card bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <header className="flex flex-wrap items-center gap-2 text-xs mb-3">
              <span className="font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{t.number}.</span>
              {t.topic && <span className="text-slate-500">{t.topic}</span>}
              <span className="text-slate-400">· {pts(t)} p.</span>
              {run.auto?.[t.id] && <span className="ml-auto font-semibold text-emerald-700">✓ Sakrīt ar paraugu</span>}
            </header>
            <MathText text={t.text} className="text-[15px] text-slate-900 leading-relaxed" />
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <p className="sp-mono text-[10.5px] font-bold text-slate-400 mb-1">Tava atbilde</p>
                {String(run.open[t.id] || '').trim() ? <MathText text={run.open[t.id]} className="text-slate-800 whitespace-pre-wrap" /> : <p className="text-slate-400 italic">Nav atbildēts</p>}
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm">
                <p className="sp-mono text-[10.5px] font-bold text-emerald-800 mb-1">Atbildes paraugs</p>
                {graded[t.id]?.answer ? <MathText text={graded[t.id].answer} className="text-slate-800" /> : <p className="text-slate-500 italic">Paraugs nav pieejams. Skaties VIAA vērtēšanas kritērijus.</p>}
                {graded[t.id]?.solution && graded[t.id].solution !== graded[t.id].answer && <MathText text={graded[t.id].solution} className="mt-2 text-slate-600" />}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4" role="group" aria-label={`${t.number}. uzdevuma punkti`}>
              <span className="text-xs font-semibold text-slate-500 mr-1">Mani punkti:</span>
              {Array.from({ length: pts(t) + 1 }, (_, n) => (
                <button key={n} type="button" aria-pressed={run.self?.[t.id] === n} onClick={() => persist((r) => ({ ...r, self: { ...r.self, [t.id]: n } }))}
                  className={`min-w-[2.5rem] px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer border transition-colors ${run.self?.[t.id] === n ? 'border-transparent bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {n}
                </button>
              ))}
            </div>
          </article>
        ))}
        <div className="flex justify-end">
          <Button onClick={() => finalize(run)} disabled={pending > 0} className="px-6 py-2.5">Aprēķināt rezultātu</Button>
        </div>
      </>
    );
  }

  // ---------- Rezultāts ----------
  const { counted, earned, max, score, percent } = scoreOf(doc, run);
  const groups = {};
  counted.forEach((t) => {
    const k = t.topic || t.section || 'Citi';
    const g = (groups[k] = groups[k] || { score: 0, max: 0 });
    g.score += earned(t);
    g.max += pts(t);
  });
  const byTopic = Object.entries(groups).sort((a, b) => a[1].score / a[1].max - b[1].score / b[1].max);
  const wrongChoice = doc.tasks.filter((t) => !isOpen(t) && graded[t.id]?.checkable && !graded[t.id].correct);
  const used = Math.round((run.finishedAt - run.startedAt) / 1000);
  const skipped = counted.length < doc.tasks.length;

  return (
    <>
      <div className="pilot-dashboard-hero rounded-3xl p-6 sm:p-8">
        <span className="sp-mono inline-block bg-indigo-50 text-indigo-700 text-[10.5px] font-semibold px-3 py-1.5 rounded-full border border-indigo-100">Simulācijas rezultāts</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-4 text-slate-900">{percent}%</h2>
        <p className="text-slate-500 mt-1">{score} no {max} {lvPoints(max)} · {doc.title}</p>
        <div className="mt-4 h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full sp-btn-primary" style={{ width: `${percent}%` }} /></div>
        <p className="sp-mono text-[11px] text-slate-400 mt-3">Laiks: {clock(used)}{run.minutes ? ` no ${run.minutes} min` : ''}</p>
        {skipped && <p className="text-xs text-slate-400 mt-1">Daži testa jautājumi bez atbildes atslēgas netika skaitīti.</p>}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={() => { persist(null); router.push('/exams?mode=quiz'); }} className="px-5 py-2.5">Trenēt kļūdas testa režīmā</Button>
          <Button variant="secondary" onClick={() => persist(null)}>Mēģināt vēlreiz</Button>
          <Button variant="ghost" onClick={() => { persist(null); onExit(); }}>Uz eksāmeniem</Button>
        </div>
      </div>

      <Card title="Pa tēmām" subtitle="Vājākās tēmas augšā">
        <ul className="space-y-3">
          {byTopic.map(([name, g]) => {
            const p = Math.round((g.score / g.max) * 100);
            return (
              <li key={name}>
                <div className="flex justify-between gap-3 text-sm mb-1">
                  <span className="text-slate-700">{cap(name)}</span>
                  <span className="font-semibold text-slate-900 shrink-0">{g.score}/{g.max} p.</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${p < 50 ? 'bg-rose-500' : p < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${p}%` }} /></div>
              </li>
            );
          })}
        </ul>
      </Card>

      {wrongChoice.length > 0 && (
        <Card title="Testa jautājumi ar kļūdām" subtitle={`${wrongChoice.length} ${wrongChoice.length % 10 === 1 && wrongChoice.length % 100 !== 11 ? 'jautājums' : 'jautājumi'}`}>
          <ul className="divide-y divide-slate-100">
            {wrongChoice.map((t) => (
              <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{t.number}.</span>
                  {t.topic && <span className="text-slate-500">{t.topic}</span>}
                </div>
                <MathText text={t.text} className="text-sm text-slate-800" />
                <p className="text-xs mt-1.5">
                  <span className="text-rose-700">Tava atbilde: {run.answers[t.id] || '—'}</span>
                  <span className="text-slate-400"> · </span>
                  <span className="text-emerald-700 font-semibold">Pareizi: {graded[t.id].correctKeys}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="sp-mono text-[10.5px] text-slate-500 mt-1">{label}</p>
    </div>
  );
}

// Pildīšanas skats ar taimeri
function RunView({ doc, run, persist, onSubmit, busy, error, onExit }) {
  const [now, setNow] = useState(Date.now());
  const submitted = useRef(false);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const elapsed = (now - run.startedAt) / 1000;
  const left = run.minutes ? run.minutes * 60 - elapsed : null;
  const answered = doc.tasks.filter((t) => (isOpen(t) ? String(run.open[t.id] || '').trim() : run.answers[t.id])).length;
  const total = doc.tasks.length;

  // Laiks beidzies -> iesniedz automātiski (vienreiz)
  useEffect(() => {
    if (left != null && left <= 0 && !submitted.current) { submitted.current = true; onSubmit(); }
  }, [left, onSubmit]);
  // Ja iesniegšana neizdevās (piem., nav tīkla), ļauj mēģināt vēlreiz
  useEffect(() => { if (error) submitted.current = false; }, [error]);

  const submit = () => {
    const missing = total - answered;
    if (missing > 0 && !window.confirm(`Neatbildēti ${missing} uzdevumi. Iesniegt tik un tā?`)) return;
    submitted.current = true;
    onSubmit();
  };
  const setChoice = (taskId, key) => persist((r) => ({ ...r, answers: { ...r.answers, [taskId]: r.answers[taskId] === key ? '' : key } }));
  const setOpen = (taskId, text) => persist((r) => ({ ...r, open: { ...r.open, [taskId]: text } }));
  const low = left != null && left < 300;

  return (
    <>
      <div className="sticky top-16 z-30">
        <div className="glass flex flex-wrap items-center gap-x-5 gap-y-2 p-3 sm:px-5 rounded-2xl border border-slate-200 shadow-soft">
          <div className={`sp-mono text-lg font-bold tabular-nums ${low ? 'text-rose-600' : 'text-slate-900'}`} role="timer" aria-label={left != null ? 'Atlikušais laiks' : 'Pagājušais laiks'}>
            ⏱ {left != null ? clock(left) : clock(elapsed)}
          </div>
          <div className="text-xs text-slate-500">Atbildēti <strong className="text-slate-900">{answered}</strong> no {total}</div>
          <div className="flex-1 min-w-[6rem] h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full sp-btn-primary" style={{ width: `${(answered / total) * 100}%` }} /></div>
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onExit} className="text-xs py-1.5 px-3">Pārtraukt</Button>
            <Button onClick={submit} disabled={busy} className="text-xs py-1.5 px-4">{busy ? 'Iesniedz…' : 'Iesniegt'}</Button>
          </div>
        </div>
        {error && <p role="alert" className="text-xs text-rose-600 mt-2 px-2">{error} Pamēģini iesniegt vēlreiz.</p>}
      </div>

      {doc.tasks.map((t, i) => {
        const prev = doc.tasks[i - 1];
        const showContext = Boolean(t.context) && (!prev || prev.context !== t.context);
        const showFigure = Boolean(t.figure) && (!prev || prev.figure !== t.figure);
        const showSection = Boolean(t.section) && (!prev || prev.section !== t.section);
        return (
          <React.Fragment key={t.id}>
            {showSection && <h3 className="sp-mono text-[11px] font-bold text-slate-400 pt-2">{t.section}</h3>}
            <article className="pilot-card bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
              <header className="flex flex-wrap items-center gap-2 text-xs mb-3">
                <span className="font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">{t.number}.</span>
                {t.points != null && <span className="text-slate-400">{t.points} p.</span>}
              </header>
              {showContext && <MathText text={t.context} className="text-sm text-slate-600 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 max-h-[32rem] overflow-y-auto" />}
              {showFigure && <p className="text-xs text-slate-500 italic mb-3">Attēls: {t.figure} (skaties oriģinālajā eksāmenā)</p>}
              <MathText text={t.text} className="text-[15px] text-slate-900 leading-relaxed" />
              {!isOpen(t) && t.options.length > 0 ? (
                <div className="grid gap-2 mt-4" role="radiogroup" aria-label={`${t.number}. uzdevuma atbilde`}>
                  {t.options.map((o) => {
                    const on = run.answers[t.id] === o.key;
                    return (
                      <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => setChoice(t.id, o.key)}
                        className={`flex gap-3 items-start text-left p-3 rounded-xl border cursor-pointer transition-colors ${on ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <span className={`font-bold w-5 shrink-0 ${on ? 'text-indigo-700' : 'text-slate-500'}`}>{o.key}</span>
                        <MathText as="span" text={o.text} className="text-sm text-slate-800" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea value={run.open[t.id] || ''} onChange={(e) => setOpen(t.id, e.target.value)} rows={3} maxLength={2000}
                  placeholder="Tava atbilde vai risinājums (formulas: $x^2$)…" aria-label={`${t.number}. uzdevuma atbilde`}
                  className="w-full mt-4 px-4 py-3 rounded-xl border border-slate-200 text-sm" />
              )}
            </article>
          </React.Fragment>
        );
      })}

      <div className="flex justify-end">
        <Button onClick={submit} disabled={busy} className="px-6 py-2.5">{busy ? 'Iesniedz…' : 'Iesniegt eksāmenu'}</Button>
      </div>
    </>
  );
}
