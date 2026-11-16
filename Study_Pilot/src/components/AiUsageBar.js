import React from 'react';
import { useApp } from '../lib/AppContext';

// Josla: cik procentu no šodienas AI tokenu limita jau izmantots (atjaunojas katru dienu plkst. 00:00 pēc Rīgas laika).
// Dati nāk no GET /api/ai/usage (AppContext.aiUsage) un atjaunojas pēc katra AI izsaukuma.
// Izmanto: components/Sidebar.js, features/exams/AiTutorChat.js. compact: tikai josla un procenti, bez paskaidrojuma.
function timeLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (!(ms > 0)) return '';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h ? `${h} h ${m} min` : `${m} min`;
}

export default function AiUsageBar({ compact = false, className = '' }) {
  const { aiUsage } = useApp();
  if (!aiUsage) return null;
  const p = aiUsage.percent;
  const color = p >= 90 ? 'bg-rose-500' : p >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  const left = timeLeft(aiUsage.resetsAt);
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between text-[11px] font-semibold text-slate-600">
        <span>AI limits šodien</span>
        <span className="sp-mono">{p}% izmantots</span>
      </div>
      <div
        role="progressbar" aria-label="Šodien izmantotie AI tokeni" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}
        aria-valuetext={`${p}% no dienas AI limita izmantots`}
        className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden"
      >
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${p}%` }} />
      </div>
      {!compact && (
        <p className="mt-1 text-[10.5px] leading-snug text-slate-500">
          {p >= 100 ? 'Limits izmantots' : `Atlicis ${100 - p}%`} · atjaunojas plkst. 00:00{left ? ` (pēc ${left})` : ''}
        </p>
      )}
    </div>
  );
}
