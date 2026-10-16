import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { uid, SUBJECT_COLORS } from '../lib/helpers';
import { inputCls } from './AppShell';

// Priekšmeta izvēle no lietotāja saraksta + iespēja uzreiz pievienot jaunu
export default function SubjectSelect({ value, onChange, id, allowAll = false }) {
  const { data, update } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const add = () => {
    const clean = name.trim();
    if (!clean) return setAdding(false);
    const existing = data.subjects.find((s) => s.name.toLowerCase() === clean.toLowerCase());
    if (existing) { onChange(existing.id); setAdding(false); setName(''); return; }
    const s = { id: uid(), name: clean, color: SUBJECT_COLORS[data.subjects.length % SUBJECT_COLORS.length] };
    update((d) => ({ ...d, subjects: [...d.subjects, s] }));
    onChange(s.id);
    setName('');
    setAdding(false);
  };

  if (adding || (!allowAll && data.subjects.length === 0)) {
    return (
      <div className="flex gap-2">
        <input
          id={id}
          autoFocus={adding}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } if (e.key === 'Escape') setAdding(false); }}
          placeholder="Jauna priekšmeta nosaukums"
          className={inputCls}
        />
        <button type="button" onClick={add} className="px-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer whitespace-nowrap">Pievienot</button>
      </div>
    );
  }

  return (
    <select
      id={id}
      value={value || ''}
      onChange={(e) => (e.target.value === '__new' ? setAdding(true) : onChange(e.target.value))}
      className={inputCls}
    >
      {allowAll ? <option value="">Visi priekšmeti</option> : !value && <option value="" disabled>Izvēlies priekšmetu…</option>}
      {data.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      <option value="__new">+ Jauns priekšmets…</option>
    </select>
  );
}
