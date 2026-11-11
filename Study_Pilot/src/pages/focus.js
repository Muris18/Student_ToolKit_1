import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import Button from '../components/Button';
import { useApp } from '../lib/AppContext';
import { useFocus, FOCUS_DURATIONS } from '../lib/FocusContext';

// Fokusa telpa. Taimeris dzīvo kopīgā stāvoklī (lib/FocusContext), tāpēc tas turpina darboties, aizejot uz citu lapu.
function FocusRoom() {
  const { data, update } = useApp();
  const f = useFocus();
  const [message, setMessage] = useState('');
  const tasks = data.tasks.filter((t) => t.status !== 'completed');
  const task = tasks.find((t) => t.id === f.taskId);
  const { duration, remaining, running } = f;
  const full = duration * 60;

  const reset = () => { f.reset(); setMessage(''); };
  const toggle = () => {
    if (running) { f.pause(); setMessage('Taimeris apturēts. Turpini, kad esi gatavs.'); }
    else { f.start(); setMessage('Fokusa laiks sākts. Taimeris turpinās arī tad, ja aizej uz citu lapu.'); }
  };
  const complete = () => {
    if (!task) return;
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, status: 'completed', doneAt: new Date().toISOString() } : t)) }));
    f.setTaskId('');
    f.reset();
    setMessage('Uzdevums pabeigts. Malacis!');
  };
  const shown = f.done ? 'Fokusa sesija pabeigta. Laiks nelielai atelpai!' : message;

  return (
    <section className="pilot-focus-room" aria-labelledby="focus-title">
      <Link href="/dashboard" className="pilot-focus-back">← Atpakaļ uz manu telpu</Link>
      <span className="pilot-eyebrow">VIETA VIENAM UZDEVUMAM</span>
      <h1 id="focus-title">Mazāk trokšņa.<br />Vairāk fokusa.</h1>
      <p>Telefons malā. Domas šeit.</p>
      <label htmlFor="focus-task">Šobrīd strādāju pie</label>
      <select id="focus-task" value={task ? f.taskId : ''} disabled={running} onChange={(e) => f.setTaskId(e.target.value)}>
        <option value="">Brīva mācību sesija</option>
        {tasks.map((t) => <option value={t.id} key={t.id}>{t.title}</option>)}
      </select>
      <div className="pilot-focus-durations" aria-label="Sesijas ilgums">
        {FOCUS_DURATIONS.map((m) => (
          <button type="button" key={m} disabled={running} aria-pressed={duration === m} onClick={() => { f.setDuration(m); setMessage(''); }}>{m} min</button>
        ))}
      </div>
      <div className="pilot-focus-clock" style={{ '--focus-angle': `${(1 - remaining / full) * 360}deg` }} role="img" aria-label={`Atlikušas ${Math.floor(remaining / 60)} minūtes un ${remaining % 60} sekundes`}>
        <div>
          <strong>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</strong>
          <span>{running ? 'TAVS FOKUSA LAIKS' : remaining === 0 ? 'PAVEIKTS!' : 'TAVĀ RITMĀ'}</span>
        </div>
      </div>
      <div className="pilot-focus-actions">
        <Button onClick={toggle}>{running ? 'Pauze' : remaining < full && remaining > 0 ? 'Turpināt' : 'Sākt fokusu'}</Button>
        <Button variant="secondary" onClick={reset}>Atiestatīt</Button>
      </div>
      {task && <Button variant="ghost" onClick={complete}>✓ Atzīmēt uzdevumu kā pabeigtu</Button>}
      <p className="pilot-focus-message" role="status" aria-live="polite">{shown || 'Pabeigta fokusa sesija tiks ieskaitīta tavā mācību aktivitātē.'}</p>
    </section>
  );
}

export default function FocusPage() { return <AppShell><FocusRoom /></AppShell>; }
