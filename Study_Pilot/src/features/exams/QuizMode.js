import React, { useCallback, useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Confetti from '../../components/Confetti';
import MathText from '../../components/MathText';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { uid, subjectName, fmtDate } from '../../lib/helpers';

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const lv = (n, one, many) => (n % 10 === 1 && n % 100 !== 11 ? one : many);
const SUBJECT_ICON = { 'latviešu valoda': '📖', 'angļu valoda': '🇬🇧', matemātika: '📐', dabaszinātnes: '🔬' };
const SOURCE = { ai: 'AI pēc tavām kļūdām', 'ai-diagnostic': 'AI diagnostika', exams: 'VIAA uzdevumi pēc kļūdām', diagnostic: 'VIAA diagnostika' };

// Testa režīms: testus veido sistēma no lietotāja kļūdām (valsts eksāmenos un iepriekšējos testos).
// Lietotājs pats testus neveido.
export default function QuizMode() {
  const { user, data, update, api } = useApp();
  const defaultGrade = user.profile.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : 12;
  const [grade, setGrade] = useState(defaultGrade);
  const [subjects, setSubjects] = useState(null);
  const [mistakes, setMistakes] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [playing, setPlaying] = useState(null);

  const loadMistakes = useCallback(
    () => api(`/api/quiz/mistakes?grade=${grade}`).then((r) => setMistakes(r.bySubject || {})).catch(() => {}),
    [api, grade]
  );

  useEffect(() => {
    setSubjects(null);
    setError('');
    api(`/api/exams?grade=${grade}`)
      .then((r) => setSubjects([...new Set((r.docs || []).map((d) => d.subject))]))
      .catch((e) => setError(e.message));
    loadMistakes();
  }, [grade, api, loadMistakes]);

  const generate = async (subject) => {
    setBusy(subject);
    setError('');
    setNotice('');
    try {
      const r = await api('/api/quiz/generate', { method: 'POST', body: { subject, grade } });
      update((d) => ({ ...d, aiQuizzes: [...(d.aiQuizzes || []), r.quiz].slice(-20) }));
      setNotice(r.notice || '');
      setPlaying(r.quiz);
    } catch (e) {
      setError(e.message);
    }
    setBusy('');
  };

  if (playing) {
    return (
      <>
        {notice && <p role="status" className="text-xs text-slate-600 p-3 rounded-xl bg-amber-50 border border-amber-100">{notice}</p>}
        <QuizPlayer quiz={playing} onExit={() => { setPlaying(null); setNotice(''); setTimeout(loadMistakes, 1500); }} />
      </>
    );
  }

  const history = [...(data.aiQuizzes || [])].reverse().filter((q) => q.grade === grade);
  const ownQuizzes = data.quizzes || [];

  return (
    <>
      <Card
        title="⚡ Testa režīms"
        subtitle="Testus veido AI pēc tavām kļūdām valsts eksāmenu uzdevumos un iepriekšējos testos"
        action={
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100" role="group" aria-label="Klase">
            {[9, 12].map((g) => (
              <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${grade === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{g}. klase</button>
            ))}
          </div>
        }
      >
        {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
        {!subjects && !error && <p className="text-sm text-slate-400">Ielādē…</p>}
        {subjects && subjects.length === 0 && <EmptyState icon="⚡" title="Vēl nav eksāmenu" text="Kad būs pievienoti valsts eksāmeni, šeit varēsi pildīt testus." />}
        {subjects && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((s) => {
              const m = mistakes[s] || { count: 0, topics: [] };
              return (
                <div key={s} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">{SUBJECT_ICON[s] || '📄'}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{cap(s)}</p>
                      <p className={`text-xs ${m.count ? 'text-rose-700 font-medium' : 'text-slate-500'}`}>{m.count ? `${m.count} ${lv(m.count, 'kļūda', 'kļūdas')} atkārtošanai` : 'Kļūdu vēl nav'}</p>
                    </div>
                  </div>
                  {m.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.topics.map((t) => <span key={t.name} className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">{t.name}{t.n > 1 ? ` ×${t.n}` : ''}</span>)}
                    </div>
                  )}
                  <Button onClick={() => generate(s)} disabled={Boolean(busy)} className="text-xs py-2 mt-auto">
                    {busy === s ? 'Veido testu… (līdz 30 s)' : m.count ? 'Izveidot testu no kļūdām' : 'Sākt diagnostikas testu'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4">Kļūdas tiek krātas, kad pildi <strong>Valsts eksāmenus</strong> un šos testus. Kad uzdevumu atrisini pareizi, tas no kļūdu saraksta pazūd.</p>
      </Card>

      {history.length > 0 && (
        <Card title="Iepriekšējie testi" subtitle="Vari pildīt vēlreiz">
          <ul className="space-y-2">
            {history.map((q) => {
              const results = (data.quizResults || []).filter((r) => r.quizId === q.id);
              const best = results.reduce((mx, r) => Math.max(mx, Math.round((r.score / r.total) * 100)), 0);
              return (
                <li key={q.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-800">{q.title}</p>
                    <p className="text-xs text-slate-500">{fmtDate(q.createdAt.slice(0, 10))} · {q.questions.length} jaut. · {SOURCE[q.source] || ''}{results.length ? ` · labākais ${best}%` : ' · nav pildīts'}</p>
                  </div>
                  <Button variant="secondary" onClick={() => setPlaying(q)} className="text-xs py-1.5 px-3">{results.length ? 'Pildīt vēlreiz' : 'Sākt'}</Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {ownQuizzes.length > 0 && (
        <Card title="Agrāk paša veidotie testi" subtitle="Jaunus testus tagad veido AI, bet vecos vari pildīt">
          <ul className="space-y-2">
            {ownQuizzes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{q.title}</p>
                  <p className="text-xs text-slate-500">{subjectName(data, q.subjectId)} · {q.questions.length} jaut.</p>
                </div>
                <Button variant="secondary" onClick={() => setPlaying(q)} className="text-xs py-1.5 px-3">Sākt</Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

// Izmanto arī Pārbaudes darbu sadaļa (features/study/StudyTests.js)
export function QuizPlayer({ quiz, onExit }) {
  const { data, update } = useApp();
  const questions = quiz.questions;
  const auto = Boolean(quiz.subject);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const q = questions[currentIndex];
  const title = auto ? cap(quiz.subject) : subjectName(data, quiz.subjectId);

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const correct = selectedOption === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => [...w, q.id]);
    // Īsts VIAA uzdevums: atzīmē mēģinājumu, lai kļūdu saraksts atjaunotos
    if (q.taskId) {
      update((d) => ({ ...d, examAttempts: [...(d.examAttempts || []).filter((a) => a.taskId !== q.taskId), { taskId: q.taskId, correct, at: new Date().toISOString() }].slice(-2000) }));
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    setIsCompleted(true);
    const wrongItems = auto
      ? questions.filter((x) => wrong.includes(x.id) && !x.taskId).map((x) => ({ question: x.question.slice(0, 600), options: x.options, correctIndex: x.correctIndex, topic: x.topic || '' }))
      : undefined;
    update((d) => ({
      ...d,
      quizResults: [...d.quizResults, {
        id: uid(), quizId: quiz.id, subjectId: quiz.subjectId || '', score, total: questions.length, wrong, date: new Date().toISOString(),
        ...(auto ? { auto: true, subject: quiz.subject, grade: quiz.grade, wrongItems } : {}),
      }],
    }));
  };

  const restart = () => { setCurrentIndex(0); setSelectedOption(null); setIsAnswerSubmitted(false); setScore(0); setWrong([]); setIsCompleted(false); };

  if (isCompleted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Card title="⚡ Tests pabeigts!" subtitle={`${quiz.title} · ${title}`}>
        <div className="text-center py-8 space-y-4 relative">
          {pct >= 70 && <Confetti />}
          <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-600 text-indigo-600 flex items-center justify-center text-2xl font-bold mx-auto shadow-sm">
            {score}/{questions.length}
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{pct >= 90 ? 'Izcili!' : pct >= 70 ? 'Lielisks darbs!' : pct >= 40 ? 'Labi, bet ir ko atkārtot' : 'Vērts atkārtot šo tēmu'}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Pareizi {pct}%. {auto && wrong.length ? 'Kļūdas saglabātas — nākamais tests tās atkārtos.' : 'Rezultāts saglabāts.'}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={onExit}>Atpakaļ</Button>
            <Button onClick={restart}>Pildīt vēlreiz</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`⚡ ${quiz.title}`}
      subtitle={`${title} · jautājums ${currentIndex + 1} no ${questions.length}`}
      action={<Button variant="ghost" onClick={onExit} className="text-xs py-1.5 px-3">Pārtraukt</Button>}
    >
      <div className="space-y-6">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

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
          {q.options.map((option, index) => {
            let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
            if (isAnswerSubmitted) {
              if (index === q.correctIndex) optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium';
              else if (index === selectedOption) optionStyle = 'bg-rose-50 border-rose-500 text-rose-700';
              else optionStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
            } else if (selectedOption === index) {
              optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs';
            }
            return (
              <button key={index} type="button" disabled={isAnswerSubmitted} onClick={() => setSelectedOption(index)} className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${optionStyle}`}>
                <MathText as="span" text={option} />
                <span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + index)}</span>
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && q.explanation && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm space-y-1">
            <p className="font-semibold text-indigo-700">Skaidrojums:</p>
            <MathText text={q.explanation} className="text-slate-700 leading-relaxed" />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">Pareizi: {score}</span>
          {!isAnswerSubmitted ? (
            <Button onClick={handleAnswerSubmit} disabled={selectedOption === null}>Apstiprināt atbildi</Button>
          ) : (
            <Button onClick={handleNextQuestion}>{currentIndex + 1 < questions.length ? 'Nākamais jautājums' : 'Skatīt rezultātus'}</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
