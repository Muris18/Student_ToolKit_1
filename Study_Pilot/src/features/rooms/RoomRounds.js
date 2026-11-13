import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MathText from '../../components/MathText';
import { useApp } from '../../lib/AppContext';
import { subjectName } from '../../lib/helpers';
import { autoMath } from '../../lib/autoMath';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

// ---------- Vestibils: uzdevumu kopas izvēle (īpašnieks) ----------

export function SetPicker({ state, act }) {
  const { data, api, user } = useApp();
  const isHost = state.me.isHost;
  const set = state.room.set;
  const [tab, setTab] = useState('exams');
  const defaultGrade = [9, 12].includes(user.profile?.grade) && user.profile?.level === 'klase' ? user.profile.grade : 12;
  const [grade, setGrade] = useState(defaultGrade);
  const [subjects, setSubjects] = useState(null);
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [startTimer, setStartTimer] = useState(true);

  useEffect(() => {
    if (!isHost || tab !== 'exams') return;
    setSubjects(null);
    api(`/api/exams?grade=${grade}`)
      .then((r) => { const list = [...new Set((r.docs || []).map((d) => d.subject))]; setSubjects(list); setSubject((s) => (list.includes(s) ? s : list[0] || '')); })
      .catch((e) => setError(e.message));
  }, [api, grade, isHost, tab]);

  // Mani testi: AI testi, paša veidotie un pārbaudes darbu testi
  const own = useMemo(() => [
    ...(data.aiQuizzes || []).map((q) => ({ key: `ai-${q.id}`, title: q.title, subject: q.subject || '', grade: q.grade || null, questions: q.questions })),
    ...(data.quizzes || []).map((q) => ({ key: `own-${q.id}`, title: q.title, subject: subjectName(data, q.subjectId), grade: null, questions: q.questions })),
    ...(data.tasks || []).filter((t) => t.study?.quiz?.questions?.length).map((t) => ({
      key: `study-${t.id}`, title: `${t.title} (pārbaudes darbs)`, subject: subjectName(data, t.subjectId), grade: null,
      questions: t.study.quiz.questions.map((q) => ({ ...q, question: autoMath(q.question), options: (q.options || []).map(autoMath), explanation: autoMath(q.explanation) })),
    })),
  ].filter((q) => Array.isArray(q.questions) && q.questions.length), [data]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try { await fn(); } catch (e) { setError(e.message); }
    setBusy(false);
  };
  const pickExam = () => run(() => act('/host', 'POST', { type: 'set-exam', subject, grade, count }));
  const pickOwn = (q) => run(() => act('/host', 'POST', {
    type: 'set-own', title: q.title, subject: q.subject, grade: q.grade,
    questions: q.questions.slice(0, 30).map((x) => ({ question: x.question, options: x.options, correctIndex: x.correctIndex, explanation: x.explanation, context: x.context, topic: x.topic })),
  }));
  const start = () => run(() => act('/host', 'POST', { type: 'start', startTimer }));

  const current = set.total > 0
    ? <p className="text-sm text-slate-700"><strong>{set.title}</strong> · {set.total} uzd.</p>
    : <p className="text-sm text-slate-500">Uzdevumu kopa vēl nav izvēlēta.</p>;

  if (!isHost) {
    return (
      <Card title="Gaidām kārtas sākumu" subtitle="Istabas īpašnieks izvēlas uzdevumus un sāk kārtu">
        {current}
        <p className="text-xs text-slate-500 mt-3">Kamēr gaidi, pieraksti zemāk (labajā pusē), ko šobrīd mācies.</p>
      </Card>
    );
  }

  const input = 'px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800';
  return (
    <Card title="Uzdevumu kopa" subtitle="Izvēlies uzdevumus, ko risinās visi istabā" action={current}>
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit mb-4" role="tablist">
        {[['exams', 'VIAA eksāmeni'], ['own', 'Mani testi']].map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={tab === v} onClick={() => setTab(v)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${tab === v ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-rose-600 mb-3">{error}</p>}

      {tab === 'exams' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-slate-500">Klase
            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={`${input} block mt-1`}>{[9, 12].map((g) => <option key={g} value={g}>{g}. klase</option>)}</select>
          </label>
          <label className="text-xs font-semibold text-slate-500">Priekšmets
            <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!subjects?.length} className={`${input} block mt-1`}>
              {!subjects && <option>Ielādē…</option>}
              {subjects?.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">Uzdevumu skaits
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${input} block mt-1`}>{[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select>
          </label>
          <Button onClick={pickExam} disabled={busy || !subject}>{busy ? 'Veido…' : 'Izvēlēties uzdevumus'}</Button>
        </div>
      )}

      {tab === 'own' && (
        own.length === 0
          ? <p className="text-sm text-slate-500">Tev vēl nav savu testu. Izveido tos Testa režīmā vai sadaļā Pārbaudes darbi.</p>
          : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {own.map((q) => (
                <li key={q.key} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-800">{q.title}</p>
                    <p className="text-xs text-slate-500">{q.questions.length} jaut.{q.subject ? ` · ${cap(q.subject)}` : ''}</p>
                  </div>
                  <Button variant="secondary" disabled={busy} onClick={() => pickOwn(q)} className="text-xs py-1.5 px-3">Izvēlēties</Button>
                </li>
              ))}
            </ul>
          )
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={startTimer} onChange={(e) => setStartTimer(e.target.checked)} /> Sākt arī taimeri
        </label>
        <Button onClick={start} disabled={busy || set.total === 0}>Sākt kārtu</Button>
      </div>
    </Card>
  );
}

// ---------- Kārta: uzdevumu risināšana ----------

export function PlayRound({ state, act }) {
  const qs = state.questions;
  const isHost = state.me.isHost;
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const q = qs[Math.min(index, qs.length - 1)];

  useEffect(() => { setChoice(null); setError(''); }, [q?.id]);
  if (!q) return null;

  const answered = Boolean(q.mine);
  const submit = async () => {
    if (choice === null) return;
    setBusy(true);
    setError('');
    try { await act('/answer', 'POST', { questionId: q.id, choice }); } catch (e) { setError(e.message); }
    setBusy(false);
  };
  const toggleHelp = () => act('/answer', 'POST', { questionId: q.id, help: !q.help.mine }).catch((e) => setError(e.message));
  const finish = () => { if (window.confirm('Pabeigt kārtu un rādīt pārskatu visiem?')) act('/host', 'POST', { type: 'finish' }).catch((e) => setError(e.message)); };

  const chip = (x, i) => {
    const c = !x.mine ? 'bg-slate-100 text-slate-500 border-slate-200' : x.mine.correct ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-400';
    return (
      <button key={x.id} type="button" onClick={() => setIndex(i)} aria-label={`Uzdevums ${i + 1}${x.mine ? (x.mine.correct ? ', pareizi' : ', nepareizi') : ', neatbildēts'}`} aria-current={i === index ? 'step' : undefined}
        className={`w-9 h-9 rounded-lg border text-xs font-bold cursor-pointer ${c} ${i === index ? 'ring-2 ring-accent' : ''}`}>{i + 1}</button>
    );
  };

  return (
    <Card
      title={state.room.set.title || 'Uzdevumi'}
      subtitle={`Uzdevums ${index + 1} no ${qs.length}`}
      action={isHost && <Button variant="secondary" onClick={finish} className="text-xs py-1.5 px-3">Pabeigt kārtu un rādīt pārskatu</Button>}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Uzdevumi">{qs.map(chip)}</div>

        {q.context && (
          <details key={q.id} open={q.context.length < 1200} className="rounded-2xl border border-slate-100 bg-white">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-slate-500">Teksts uzdevumam</summary>
            <MathText text={q.context} className="px-4 pb-4 text-sm text-slate-600 leading-relaxed max-h-80 overflow-y-auto" />
          </details>
        )}

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2">
          {(q.topic || q.source) && <p className="text-[11px] font-semibold text-slate-400">{[q.topic, q.source].filter(Boolean).join(' · ')}</p>}
          <MathText text={q.question} className="font-semibold text-slate-800 text-base md:text-lg" />
        </div>

        <div className="space-y-3">
          {q.options.map((option, i) => {
            let style = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
            if (answered && q.result) {
              if (i === q.result.correctIndex) style = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium';
              else if (i === q.mine.choice) style = 'bg-rose-50 border-rose-500 text-rose-700';
              else style = 'bg-white border-slate-200 text-slate-400 opacity-60';
            } else if (choice === i) style = 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs';
            const n = q.stats?.counts?.[i] ?? 0;
            return (
              <button key={i} type="button" disabled={answered} onClick={() => setChoice(i)} className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${style}`}>
                <MathText as="span" text={option} />
                <span className="text-xs font-bold text-slate-400 shrink-0">{answered && q.stats ? `${n} · ` : ''}{String.fromCharCode(65 + i)}</span>
              </button>
            );
          })}
        </div>

        {answered && q.result?.explanation && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm space-y-1">
            <p className="font-semibold text-indigo-700">Skaidrojums:</p>
            <MathText text={q.result.explanation} className="text-slate-700 leading-relaxed" />
          </div>
        )}
        {answered && q.stats && <p className="text-xs text-slate-500">Atbildēja {q.stats.answered}, pareizi {q.stats.correct}.</p>}
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={toggleHelp} aria-pressed={q.help.mine} className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer ${q.help.mine ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            🙋 {q.help.mine ? 'Palīdzība atzīmēta' : 'Vajag palīdzību'}{q.help.count ? ` (${q.help.count})` : ''}
          </button>
          {!answered
            ? <Button onClick={submit} disabled={choice === null || busy}>Apstiprināt atbildi</Button>
            : index + 1 < qs.length
              ? <Button onClick={() => setIndex(index + 1)}>Nākamais uzdevums</Button>
              : <span className="text-xs text-slate-500">Tas bija pēdējais uzdevums. Gaidi pārskatu.</span>}
        </div>
      </div>
    </Card>
  );
}

// ---------- Pārskats: kļūdu analīze ----------

export function ReviewPanel({ state, act }) {
  const qs = state.questions;
  const members = state.members;
  const total = qs.length;
  const mineCorrect = qs.filter((q) => q.mine?.correct).length;
  const groupSum = members.reduce((s, m) => s + (m.correct || 0), 0);
  const groupPct = pct(groupSum, members.length * total);
  const rows = qs.map((q, i) => {
    const st = q.stats || { answered: 0, correct: 0, counts: q.options.map(() => 0) };
    return { q, i, st, errRate: st.answered ? (st.answered - st.correct) / st.answered : 0 };
  }).sort((a, b) => b.errRate - a.errRate || a.i - b.i);
  const hard = rows.filter((r) => r.st.answered > 0 && r.errRate >= 0.5).length;
  const [error, setError] = useState('');
  const next = () => act('/host', 'POST', { type: 'new-round' }).catch((e) => setError(e.message));

  return (
    <div className="space-y-6">
      <Card
        title="Kārtas pārskats"
        subtitle={state.room.set.title}
        action={state.me.isHost && <Button onClick={next}>Jauna kārta</Button>}
      >
        {error && <p role="alert" className="text-sm text-rose-600 mb-3">{error}</p>}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100"><p className="text-2xl font-bold text-slate-900">{mineCorrect}/{total}</p><p className="text-xs text-slate-500">Mans rezultāts</p></div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100"><p className="text-2xl font-bold text-slate-900">{groupPct}%</p><p className="text-xs text-slate-500">Grupas vidējais</p></div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100"><p className="text-2xl font-bold text-slate-900">{hard}</p><p className="text-xs text-slate-500">Grūtie uzdevumi</p></div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Uzdevumi sakārtoti pēc kļūdu īpatsvara: grūtākie pirmie. Tavas kļūdas tiek saglabātas Testa režīmam.</p>
      </Card>

      {rows.map(({ q, i, st, errRate }) => (
        <Card key={q.id} title={`Uzdevums ${i + 1}`} subtitle={st.answered ? `Kļūdījās ${Math.round(errRate * 100)}% (${st.answered - st.correct} no ${st.answered})` : 'Neviens neatbildēja'}
          action={q.help.count > 0 && <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">🙋 {q.help.count} atzīmēja palīdzību</span>}>
          {q.context && (
            <details className="rounded-2xl border border-slate-100 bg-white mb-3">
              <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-slate-500">Teksts uzdevumam</summary>
              <MathText text={q.context} className="px-4 pb-4 text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto" />
            </details>
          )}
          <MathText text={q.question} className="font-semibold text-slate-800 mb-3" />
          <ul className="space-y-2">
            {q.options.map((o, j) => {
              const right = q.result && j === q.result.correctIndex;
              const mine = q.mine && j === q.mine.choice;
              const p = pct(st.counts[j] || 0, st.answered);
              return (
                <li key={j} className={`relative overflow-hidden rounded-xl border p-3 text-sm ${right ? 'border-emerald-500' : mine ? 'border-rose-400' : 'border-slate-200'}`}>
                  <div className={`absolute inset-y-0 left-0 ${right ? 'bg-emerald-100' : 'bg-slate-100'}`} style={{ width: `${p}%` }} aria-hidden="true" />
                  <div className="relative flex items-center justify-between gap-3">
                    <span className="flex gap-2 min-w-0"><span className="font-bold text-slate-400">{String.fromCharCode(65 + j)}</span><MathText as="span" text={o} className="text-slate-800" /></span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {right && <strong className="text-emerald-700 mr-2">pareizā</strong>}
                      {mine && <strong className="text-slate-700 mr-2">tava</strong>}
                      {st.counts[j] || 0} ({p}%)
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {q.result?.explanation && (
            <div className="mt-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm">
              <p className="font-semibold text-indigo-700">Skaidrojums:</p>
              <MathText text={q.result.explanation} className="text-slate-700 leading-relaxed" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
