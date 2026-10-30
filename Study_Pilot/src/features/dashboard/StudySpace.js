import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '../../components/Card';
import { useApp } from '../../lib/AppContext';
import { subjectStats, toDateStr, fmtDate } from '../../lib/helpers';
import { weekDays } from '../../lib/designHelpers';
export default function StudySpace() {
  const { data } = useApp();
  const [today, setToday] = useState(null);
  useEffect(() => { const refresh = () => setToday(new Date()); refresh(); const id = setInterval(refresh, 60000); return () => clearInterval(id); }, []);
  const days = today ? weekDays(today) : [];
  const todayKey = today && toDateStr(today);
  const active = new Set(data.activity);
  const count = days.filter(d => toDateStr(d) <= todayKey && active.has(toDateStr(d))).length;
  return <div className="space-y-6"><Card title="Tavs nedēļas ritms" subtitle={today ? `${count} no 7 dienām ar mācību aktivitāti` : 'Šīs nedēļas aktivitāte'} action={<Link href="/focus" className="pilot-focus-link">◷ Sākt fokusu →</Link>}><div className="pilot-week">{days.map((date, i) => { const key = toDateStr(date), done = key <= todayKey && active.has(key); return <div key={key} className={`pilot-day ${done ? 'is-active' : ''} ${key === todayKey ? 'is-today' : ''}`} aria-label={`${fmtDate(key)}: ${done ? 'mācījies' : key > todayKey ? 'vēl priekšā' : 'nav aktivitātes'}`} aria-current={key === todayKey ? 'date' : undefined}><span>{['P','O','T','C','Pk','S','Sv'][i]}</span><strong>{done ? '✓' : date.getDate()}</strong><small>{key === todayKey ? 'Šodien' : done ? 'Paveikts' : '—'}</small></div>; })}</div></Card>
  <section aria-labelledby="pilot-subject-heading"><div className="pilot-section-heading"><h2 id="pilot-subject-heading">Tavi priekšmeti</h2><Link href="/profile" className="text-sm text-accent">Pārvaldīt →</Link></div>{data.subjects.length ? <div className="pilot-subject-grid">{subjectStats(data).map(s => { const next = data.tasks.filter(t => t.subjectId === s.id && t.status !== 'completed').sort((a,b) => a.dueDate.localeCompare(b.dueDate))[0]; return <article className="pilot-subject-card" key={s.id}><div className="pilot-subject-icon" aria-hidden="true">{s.name.slice(0,2).toUpperCase()}</div><h3>{s.name}</h3><p>{next ? `${next.title} · ${fmtDate(next.dueDate)}` : 'Nav aktīvu termiņu'}</p><div className="pilot-subject-progress" role="progressbar" aria-label={`${s.name}: izpildītie darbi`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.progress}><span style={{width:`${s.progress}%`}} /></div><small>{s.completed} / {s.total} darbi pabeigti</small><Link href={{pathname:'/exams',query:{mode:'tasks',subject:s.id}}}>Turpināt <span aria-hidden="true">↗</span></Link></article>; })}</div> : <div className="pilot-subject-empty"><p>Pievieno pirmo priekšmetu — šeit būs tavs progress un tuvākie termiņi.</p><Link href="/profile">Pievienot priekšmetu →</Link></div>}</section></div>;
}
