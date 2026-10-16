import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SubjectSelect from '../../components/SubjectSelect';
import { EmptyState, inputCls, labelCls } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { uid, subjectName, subjectColor } from '../../lib/helpers';

const DIFFICULTIES = ['Viegla', 'Vidēja', 'Sarežģīta'];
const diffColor = { Viegla: 'text-emerald-700', Vidēja: 'text-amber-700', Sarežģīta: 'text-rose-700' };
const blank = { title: '', source: '', points: '', difficulty: 'Vidēja', notes: '' };

// Eksāmenu uzdevumi, ko lietotājs pats pievieno (piem., no VISC/VIAA iepriekšējo gadu darbiem)
export default function ExamTaskList({ subjectId, onChangeSubject, onOpenAiHelp }) {
  const { data, update } = useApp();
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [formSubject, setFormSubject] = useState(subjectId || '');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const list = data.exercises
    .filter((x) => !subjectId || x.subjectId === subjectId)
    .filter((x) => (filter === 'open' ? !x.completed : filter === 'done' ? x.completed : true));
  const all = data.exercises.filter((x) => !subjectId || x.subjectId === subjectId);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e) => {
    e.preventDefault();
    const sid = subjectId || formSubject;
    if (!form.title.trim() || !sid) return;
    update((d) => ({
      ...d,
      exercises: [...d.exercises, { id: uid(), subjectId: sid, ...form, title: form.title.trim(), completed: false, createdAt: new Date().toISOString(), doneAt: null }],
    }));
    setForm((f) => ({ ...blank, source: f.source, difficulty: f.difficulty }));
  };

  const toggle = (id) =>
    update((d) => ({ ...d, exercises: d.exercises.map((x) => (x.id === id ? { ...x, completed: !x.completed, doneAt: x.completed ? null : new Date().toISOString() } : x)) }));
  const remove = (id) => update((d) => ({ ...d, exercises: d.exercises.filter((x) => x.id !== id) }));

  const title = subjectId ? subjectName(data, subjectId) : 'visi priekšmeti';

  return (
    <Card
      title={`📝 Uzdevumi: ${title}`}
      subtitle="Pievieno uzdevumus no iepriekšējo gadu eksāmeniem vai savām piezīmēm"
      action={<Button onClick={() => setOpen((o) => !o)} className="text-xs py-1.5 px-3">{open ? 'Aizvērt' : '+ Uzdevums'}</Button>}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="sm:w-64"><SubjectSelect value={subjectId || ''} onChange={onChangeSubject} allowAll /></div>
          <div className="flex gap-2">
            {[['all', `Visi (${all.length})`], ['open', 'Neizpildīti'], ['done', 'Izpildīti']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFilter(id)} className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${filter === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>
            ))}
          </div>
        </div>

        {open && (
          <form onSubmit={add} className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3 animate-pop">
            {!subjectId && (
              <div><label className={labelCls} htmlFor="x-subj">Priekšmets</label><SubjectSelect id="x-subj" value={formSubject} onChange={setFormSubject} /></div>
            )}
            <div><label className={labelCls} htmlFor="x-title">Uzdevums</label><input id="x-title" required value={form.title} onChange={set('title')} placeholder="Īss apraksts vai uzdevuma teksts" className={inputCls} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className={labelCls} htmlFor="x-src">Avots / gads</label><input id="x-src" value={form.source} onChange={set('source')} placeholder="2024, 1. daļa, 3. uzd." className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="x-pts">Punkti</label><input id="x-pts" type="number" min="0" value={form.points} onChange={set('points')} className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="x-diff">Grūtība</label><select id="x-diff" value={form.difficulty} onChange={set('difficulty')} className={inputCls}>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></div>
            </div>
            <div><label className={labelCls} htmlFor="x-notes">Piezīmes / risinājums <span className="normal-case font-medium">(nav obligāti)</span></label><textarea id="x-notes" rows={3} value={form.notes} onChange={set('notes')} className={`${inputCls} resize-y`} /></div>
            <div className="flex justify-end"><Button type="submit">Pievienot uzdevumu</Button></div>
          </form>
        )}

        {list.length === 0 ? (
          all.length === 0 ? (
            <EmptyState icon="📝" title="Nav uzdevumu" text="Pievieno uzdevumus, ko gribi atrisināt pirms eksāmena — tad vari tos atzīmēt kā izpildītus un sekot progresam.">
              {!open && <Button onClick={() => setOpen(true)} className="text-xs py-2">+ Pirmais uzdevums</Button>}
            </EmptyState>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Šajā filtrā nav uzdevumu.</p>
          )
        ) : (
          <ul className="space-y-3">
            {list.map((task, i) => (
              <li key={task.id} className={`p-4 rounded-2xl border transition-all ${task.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <button type="button" onClick={() => setExpanded(expanded === task.id ? null : task.id)} className="space-y-1 text-left min-w-0 cursor-pointer">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold px-2.5 py-0.5 rounded-md text-white" style={{ background: subjectColor(data, task.subjectId) }}>{i + 1}.</span>
                      {!subjectId && <span className="font-semibold text-slate-500">{subjectName(data, task.subjectId)}</span>}
                      {task.source && <span className="text-slate-500">{task.source}</span>}
                      {task.points !== '' && <span className="text-slate-500">· {task.points} p.</span>}
                      <span className={`font-medium ${diffColor[task.difficulty] || ''}`}>· {task.difficulty}</span>
                    </div>
                    <h4 className={`font-semibold text-sm md:text-base ${task.completed ? 'text-slate-500' : 'text-slate-800'}`}>{task.title}</h4>
                  </button>
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                    <Button variant="secondary" onClick={() => onOpenAiHelp && onOpenAiHelp(task)} className="text-xs py-1.5 px-3">🤖 Uz čatu</Button>
                    <button type="button" onClick={() => toggle(task.id)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${task.completed ? 'bg-emerald-600 text-white hover:brightness-110' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                      {task.completed ? '✓ Izpildīts' : 'Atzīmēt kā izpildītu'}
                    </button>
                    <button type="button" onClick={() => remove(task.id)} aria-label="Dzēst" className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 cursor-pointer">✕</button>
                  </div>
                </div>
                {expanded === task.id && task.notes && (
                  <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 whitespace-pre-wrap">{task.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
