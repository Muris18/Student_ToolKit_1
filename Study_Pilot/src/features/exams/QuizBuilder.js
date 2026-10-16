import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SubjectSelect from '../../components/SubjectSelect';
import { inputCls, labelCls } from '../../components/AppShell';
import { uid } from '../../lib/helpers';

const newQuestion = () => ({ id: uid(), question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });

// Testa izveide / labošana: jautājumi ar 2–6 atbilžu variantiem
export default function QuizBuilder({ initial, defaultSubjectId, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId || defaultSubjectId || '');
  const [questions, setQuestions] = useState(initial?.questions || [newQuestion()]);
  const [error, setError] = useState('');

  const setQ = (qi, patch) => setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  const setOpt = (qi, oi, val) => setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q)));
  const addOpt = (qi) => setQuestions((qs) => qs.map((q, i) => (i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q)));
  const removeOpt = (qi, oi) =>
    setQuestions((qs) => qs.map((q, i) => {
      if (i !== qi || q.options.length <= 2) return q;
      const options = q.options.filter((_, j) => j !== oi);
      const correctIndex = q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex;
      return { ...q, options, correctIndex };
    }));

  const save = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Ievadi testa nosaukumu');
    if (!subjectId) return setError('Izvēlies priekšmetu');
    const cleaned = questions
      .map((q) => ({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()) }))
      .filter((q) => q.question);
    if (!cleaned.length) return setError('Pievieno vismaz vienu jautājumu');
    for (const [i, q] of cleaned.entries()) {
      if (q.options.filter(Boolean).length < 2) return setError(`${i + 1}. jautājumam vajag vismaz 2 atbilžu variantus`);
      if (!q.options[q.correctIndex]) return setError(`${i + 1}. jautājumam pareizā atbilde ir tukša`);
    }
    // izmetam tukšos variantus, pārrēķinot pareizās atbildes indeksu
    const final = cleaned.map((q) => {
      const correct = q.options[q.correctIndex];
      const options = q.options.filter(Boolean);
      return { ...q, options, correctIndex: options.indexOf(correct), explanation: q.explanation.trim() };
    });
    onSave({ id: initial?.id || uid(), title: title.trim(), subjectId, questions: final, createdAt: initial?.createdAt || new Date().toISOString() });
  };

  return (
    <Card title={initial ? '✎ Labot testu' : '➕ Jauns tests'} subtitle="Uzraksti jautājumus un atzīmē pareizo atbildi (aplītis)">
      <form onSubmit={save} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls} htmlFor="q-title">Testa nosaukums</label><input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Piem., Trigonometrija — atkārtojums" className={inputCls} /></div>
          <div><label className={labelCls} htmlFor="q-subj">Priekšmets</label><SubjectSelect id="q-subj" value={subjectId} onChange={setSubjectId} /></div>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{qi + 1}. jautājums</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer">Dzēst jautājumu</button>
              )}
            </div>
            <textarea rows={2} value={q.question} onChange={(e) => setQ(qi, { question: e.target.value })} placeholder="Jautājuma teksts" className={`${inputCls} resize-y`} aria-label={`${qi + 1}. jautājuma teksts`} />
            <div className="space-y-2">
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi} onChange={() => setQ(qi, { correctIndex: oi })} className="w-4 h-4 shrink-0 accent-[rgb(var(--acc))] cursor-pointer" style={{ minHeight: 0 }} aria-label={`Pareizā atbilde ${String.fromCharCode(65 + oi)}`} />
                  <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + oi)}</span>
                  <input value={o} onChange={(e) => setOpt(qi, oi, e.target.value)} placeholder={`Variants ${String.fromCharCode(65 + oi)}`} className={`${inputCls} ${q.correctIndex === oi ? 'border-emerald-500' : ''}`} />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOpt(qi, oi)} className="text-xs text-slate-400 hover:text-rose-600 px-1 cursor-pointer" aria-label="Noņemt variantu">✕</button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && <button type="button" onClick={() => addOpt(qi)} className="text-xs font-semibold text-accent hover:underline cursor-pointer">+ variants</button>}
            </div>
            <input value={q.explanation} onChange={(e) => setQ(qi, { explanation: e.target.value })} placeholder="Skaidrojums pēc atbildes (nav obligāti)" className={inputCls} aria-label="Skaidrojums" />
          </div>
        ))}

        <button type="button" onClick={() => setQuestions((qs) => [...qs, newQuestion()])} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer">
          + Pievienot jautājumu
        </button>

        {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onCancel}>Atcelt</Button>
          <Button type="submit">Saglabāt testu ({questions.filter((q) => q.question.trim()).length})</Button>
        </div>
      </form>
    </Card>
  );
}
