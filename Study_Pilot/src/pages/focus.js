import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import Button from '../components/Button';
import { useApp } from '../lib/AppContext';
import { secondsLeft } from '../lib/designHelpers';
function FocusRoom() {
  const { data, update } = useApp();
  const [duration, setDuration] = useState(25), [remaining, setRemaining] = useState(1500), [deadline, setDeadline] = useState(null), [selected, setSelected] = useState(''), [message, setMessage] = useState('');
  const latest = useRef({ data, update }); latest.current = { data, update };
  const tasks = data.tasks.filter(t => t.status !== 'completed');
  const task = tasks.find(t => t.id === selected);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const left = secondsLeft(deadline); setRemaining(left);
      if (left === 0) { setDeadline(null); setMessage('Fokusa sesija pabeigta. Laiks nelielai atelpai!'); latest.current.update(d => ({...d})); }
    };
    tick(); const id = setInterval(tick, 250); return () => clearInterval(id);
  }, [deadline]);
  const reset = () => { setDeadline(null); setRemaining(duration * 60); setMessage(''); };
  const toggle = () => {
    if (deadline) { setRemaining(secondsLeft(deadline)); setDeadline(null); setMessage('Taimeris apturēts. Turpini, kad esi gatavs.'); }
    else { const left = remaining || duration * 60; setRemaining(left); setDeadline(Date.now() + left * 1000); setMessage('Fokusa laiks sākts. Viens uzdevums, viens solis.'); }
  };
  const complete = () => {
    if (!task) return;
    update(d => ({...d,tasks:d.tasks.map(t => t.id === task.id ? {...t,status:'completed',doneAt:new Date().toISOString()} : t)}));
    setSelected(''); reset(); setMessage('Uzdevums pabeigts. Malacis!');
  };
  return <section className="pilot-focus-room" aria-labelledby="focus-title"><Link href="/dashboard" className="pilot-focus-back">← Atpakaļ uz manu telpu</Link><span className="pilot-eyebrow">VIETA VIENAM UZDEVUMAM</span><h1 id="focus-title">Mazāk trokšņa.<br />Vairāk fokusa.</h1><p>Telefons malā. Domas šeit.</p><label htmlFor="focus-task">Šobrīd strādāju pie</label><select id="focus-task" value={task ? selected : ''} disabled={!!deadline} onChange={e => setSelected(e.target.value)}><option value="">Brīva mācību sesija</option>{tasks.map(t => <option value={t.id} key={t.id}>{t.title}</option>)}</select><div className="pilot-focus-durations" aria-label="Sesijas ilgums">{[15,25,45].map(m => <button type="button" key={m} disabled={!!deadline} aria-pressed={duration===m} onClick={() => { setDuration(m); setRemaining(m*60); setMessage(''); }}>{m} min</button>)}</div><div className="pilot-focus-clock" style={{'--focus-angle':`${(1-remaining/(duration*60))*360}deg`}} role="img" aria-label={`Atlikušas ${Math.floor(remaining/60)} minūtes un ${remaining%60} sekundes`}><div><strong>{String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}</strong><span>{deadline ? 'TAVS FOKUSA LAIKS' : remaining === 0 ? 'PAVEIKTS!' : 'TAVĀ RITMĀ'}</span></div></div><div className="pilot-focus-actions"><Button onClick={toggle}>{deadline ? 'Pauze' : remaining < duration*60 && remaining > 0 ? 'Turpināt' : 'Sākt fokusu'}</Button><Button variant="secondary" onClick={reset}>Atiestatīt</Button></div>{task && <Button variant="ghost" onClick={complete}>✓ Atzīmēt uzdevumu kā pabeigtu</Button>}<p className="pilot-focus-message" role="status" aria-live="polite">{message || 'Pabeigta fokusa sesija tiks ieskaitīta tavā mācību aktivitātē.'}</p></section>;
}
export default function FocusPage() { return <AppShell><FocusRoom /></AppShell>; }
