import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Confetti from '../../components/Confetti';
import SubjectSelect from '../../components/SubjectSelect';
import { EmptyState } from '../../components/AppShell';
import QuizBuilder from './QuizBuilder';
import { useApp } from '../../lib/AppContext';
import { uid, subjectName, subjectColor, fmtDate } from '../../lib/helpers';

// Testu saraksts → izveide/labošana → pildīšana → rezultāts
export default function QuizMode({ subjectId, onChangeSubject }) {
  const { data, update } = useApp();
  const [view, setView] = useState({ name: 'list' }); // list | build | play

  const quizzes = data.quizzes.filter((q) => !subjectId || q.subjectId === subjectId);

  const saveQuiz = (quiz) => {
    update((d) => ({ ...d, quizzes: d.quizzes.some((q) => q.id === quiz.id) ? d.quizzes.map((q) => (q.id === quiz.id ? quiz : q)) : [...d.quizzes, quiz] }));
    setView({ name: 'list' });
  };
  const removeQuiz = (id) => {
    if (!window.confirm('Dzēst šo testu un tā rezultātus?')) return;
    update((d) => ({ ...d, quizzes: d.quizzes.filter((q) => q.id !== id), quizResults: d.quizResults.filter((r) => r.quizId !== id) }));
  };

  if (view.name === 'build') {
    return <QuizBuilder initial={view.quiz} defaultSubjectId={subjectId} onSave={saveQuiz} onCancel={() => setView({ name: 'list' })} />;
  }
  if (view.name === 'play') {
    return <QuizPlayer quiz={view.quiz} onExit={() => setView({ name: 'list' })} />;
  }

  return (
    <Card
      title="⚡ Testa režīms"
      subtitle="Tavi testi — izveido jautājumus un pārbaudi sevi"
      action={<Button onClick={() => setView({ name: 'build' })} className="text-xs py-1.5 px-3">+ Jauns tests</Button>}
    >
      <div className="space-y-4">
        <div className="sm:w-64"><SubjectSelect value={subjectId || ''} onChange={onChangeSubject} allowAll /></div>
        {quizzes.length === 0 ? (
          <EmptyState icon="⚡" title="Nav testu" text="Izveido testu ar saviem jautājumiem un atbilžu variantiem. Rezultāti parādīsies progresa sadaļā.">
            <Button onClick={() => setView({ name: 'build' })} className="text-xs py-2">+ Izveidot testu</Button>
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizzes.map((q) => {
              const results = data.quizResults.filter((r) => r.quizId === q.id);
              const best = results.reduce((m, r) => Math.max(m, Math.round((r.score / r.total) * 100)), 0);
              const last = results[results.length - 1];
              return (
                <li key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3" style={{ borderLeft: `5px solid ${subjectColor(data, q.subjectId)}` }}>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{subjectName(data, q.subjectId)}</p>
                    <p className="font-bold text-slate-800 mt-0.5">{q.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {q.questions.length} jaut. · {results.length ? `labākais ${best}% · pēdējo reizi ${fmtDate(last.date.slice(0, 10))}` : 'vēl nav pildīts'}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button onClick={() => setView({ name: 'play', quiz: q })} className="text-xs py-2 flex-1">Sākt</Button>
                    <Button variant="secondary" onClick={() => setView({ name: 'build', quiz: q })} className="text-xs py-2">Labot</Button>
                    <Button variant="ghost" onClick={() => removeQuiz(q.id)} className="text-xs py-2 px-2.5" aria-label="Dzēst">✕</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}

function QuizPlayer({ quiz, onExit }) {
  const { data, update } = useApp();
  const questions = quiz.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const subjectTitle = subjectName(data, quiz.subjectId);

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) setScore((s) => s + 1);
    else setWrong((w) => [...w, currentQuestion.id]);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
      update((d) => ({ ...d, quizResults: [...d.quizResults, { id: uid(), quizId: quiz.id, subjectId: quiz.subjectId, score, total: questions.length, wrong, date: new Date().toISOString() }] }));
    }
  };

  const restart = () => { setCurrentIndex(0); setSelectedOption(null); setIsAnswerSubmitted(false); setScore(0); setWrong([]); setIsCompleted(false); };

  if (isCompleted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Card title="⚡ Tests pabeigts!" subtitle={`${quiz.title} · ${subjectTitle}`}>
        <div className="text-center py-8 space-y-4 relative">
          {pct >= 70 && <Confetti />}
          <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-600 text-indigo-600 flex items-center justify-center text-2xl font-bold mx-auto shadow-sm">
            {score}/{questions.length}
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{pct >= 90 ? 'Izcili!' : pct >= 70 ? 'Lielisks darbs!' : pct >= 40 ? 'Labi, bet ir ko atkārtot' : 'Vērts atkārtot šo tēmu'}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Pareizi {pct}%. Rezultāts saglabāts — kļūdas redzēsi progresa sadaļā.</p>
          <div className="pt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={onExit}>Uz testu sarakstu</Button>
            <Button onClick={restart}>Pildīt vēlreiz</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`⚡ ${quiz.title}`}
      subtitle={`${subjectTitle} · jautājums ${currentIndex + 1} no ${questions.length}`}
      action={<Button variant="ghost" onClick={onExit} className="text-xs py-1.5 px-3">Pārtraukt</Button>}
    >
      <div className="space-y-6">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-300 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-base md:text-lg whitespace-pre-wrap">{currentQuestion.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
            if (isAnswerSubmitted) {
              if (index === currentQuestion.correctIndex) optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium';
              else if (index === selectedOption) optionStyle = 'bg-rose-50 border-rose-500 text-rose-700';
              else optionStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
            } else if (selectedOption === index) {
              optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs';
            }
            return (
              <button key={index} type="button" disabled={isAnswerSubmitted} onClick={() => setSelectedOption(index)} className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}>
                <span>{option}</span>
                <span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + index)}</span>
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && currentQuestion.explanation && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm space-y-1">
            <p className="font-semibold text-indigo-700">Skaidrojums:</p>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{currentQuestion.explanation}</p>
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
