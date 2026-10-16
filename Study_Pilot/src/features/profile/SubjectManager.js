import React, { useState } from 'react';
import Button from '../../components/Button';
import { inputCls } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { uid, SUBJECT_COLORS, suggestedSubjects } from '../../lib/helpers';

// Lietotāja priekšmetu saraksts: pievienot / pārdēvēt / dzēst
export default function SubjectManager({ compact = false }) {
  const { user, data, update } = useApp();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');

  const has = (n) => data.subjects.some((s) => s.name.toLowerCase() === n.trim().toLowerCase());

  const add = (n) => {
    const clean = n.trim();
    if (!clean || has(clean)) return;
    update((d) => ({ ...d, subjects: [...d.subjects, { id: uid(), name: clean, color: SUBJECT_COLORS[d.subjects.length % SUBJECT_COLORS.length] }] }));
  };

  const remove = (id) => {
    const s = data.subjects.find((x) => x.id === id);
    const linked = data.tasks.filter((t) => t.subjectId === id).length + data.exercises.filter((x) => x.subjectId === id).length + data.quizzes.filter((q) => q.subjectId === id).length;
    if (linked && !window.confirm(`"${s.name}" ir piesaistīti ${linked} ieraksti. Dzēst priekšmetu un visus tā ierakstus?`)) return;
    update((d) => ({
      ...d,
      subjects: d.subjects.filter((x) => x.id !== id),
      tasks: d.tasks.filter((t) => t.subjectId !== id),
      exercises: d.exercises.filter((x) => x.subjectId !== id),
      quizzes: d.quizzes.filter((q) => q.subjectId !== id),
      quizResults: d.quizResults.filter((r) => r.subjectId !== id),
    }));
  };

  const saveEdit = () => {
    const clean = editName.trim();
    if (clean) update((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === editing ? { ...s, name: clean } : s)) }));
    setEditing(null);
  };

  const recolor = (id) =>
    update((d) => ({
      ...d,
      subjects: d.subjects.map((s) => (s.id === id ? { ...s, color: SUBJECT_COLORS[(SUBJECT_COLORS.indexOf(s.color) + 1) % SUBJECT_COLORS.length] } : s)),
    }), { activity: false });

  const suggestions = suggestedSubjects(user.profile).filter((s) => !has(s));

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); add(name); setName(''); }}
        className="flex gap-2"
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priekšmeta nosaukums" className={inputCls} aria-label="Jauns priekšmets" />
        <Button type="submit" disabled={!name.trim() || has(name)}>Pievienot</Button>
      </form>

      {suggestions.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ātri pievienot</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-slate-300 text-slate-600 hover:border-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {data.subjects.length > 0 && (
        <ul className={`grid gap-2 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {data.subjects.map((s) => (
            <li key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70">
              <button type="button" onClick={() => recolor(s.id)} title="Mainīt krāsu" aria-label="Mainīt krāsu" className="w-4 h-4 rounded-full shrink-0 cursor-pointer ring-2 ring-white/10" style={{ background: s.color }} />
              {editing === s.id ? (
                <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }} className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-sm" />
              ) : (
                <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{s.name}</span>
              )}
              {!compact && (
                <button type="button" onClick={() => { setEditing(s.id); setEditName(s.name); }} className="text-xs text-slate-400 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer">Pārdēvēt</button>
              )}
              <button type="button" onClick={() => remove(s.id)} aria-label={`Dzēst ${s.name}`} className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
