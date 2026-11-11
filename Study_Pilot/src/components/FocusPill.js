import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFocus } from '../lib/FocusContext';

// Mazs fokusa taimeris augšējā joslā visās lapās (kamēr taimeris iet, ir apturēts vai pabeigts). Klusi: bez skaņas,
// uznirstošajiem logiem vai pārlūka paziņojumiem. Lapā /focus tas nav redzams, jo tur ir lielais pulkstenis.
const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export default function FocusPill() {
  const { pathname } = useRouter();
  const f = useFocus();
  if (!f || pathname === '/focus') return null;
  const paused = !f.running && !f.done && f.remaining > 0 && f.remaining < f.duration * 60;
  if (!f.running && !f.done && !paused) return null;

  const base = 'sp-focus-pill sp-mono inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-bold tabular-nums whitespace-nowrap transition-colors';

  if (f.done) {
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200 !pr-1.5`}>
        <Link href="/focus" className="hover:underline" title="Fokusa sesija pabeigta">✓ Fokuss</Link>
        <button type="button" onClick={f.reset} aria-label="Aizvērt fokusa taimeri" className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-emerald-100 cursor-pointer">×</button>
      </span>
    );
  }
  return (
    <Link
      href="/focus"
      title={paused ? 'Fokusa taimeris apturēts. Atvērt' : 'Fokusa taimeris. Atvērt'}
      aria-label={`Fokusa taimeris ${paused ? 'apturēts' : 'darbojas'}, atlikušas ${Math.ceil(f.remaining / 60)} min`}
      className={`${base} ${paused ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300'}`}
    >
      <span aria-hidden="true">{paused ? '⏸' : '⏱'}</span>{mmss(f.remaining)}
    </Link>
  );
}
