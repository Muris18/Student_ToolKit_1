import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '../../components/Card';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';

// Tēmu karte: katrai tēmai krāsa pēc pareizo atbilžu īpatsvara un josla, cik no tēmas uzdevumiem izmēģināts.
// Dati: /api/progress/topics (valsts eksāmenu treniņš, testa režīms ar VIAA uzdevumiem, simulācijas).

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const MIN_ATTEMPTS = 3; // mazāk mēģinājumu — vēl par maz, lai spriestu
const level = (t) => (t.pct === null ? 'none' : t.attempted < MIN_ATTEMPTS ? 'few' : t.pct < 50 ? 'weak' : t.pct < 80 ? 'mid' : 'good');
const STYLE = {
  none: { tile: 'border-dashed border-slate-300 bg-transparent', dot: 'bg-slate-300', label: 'Nav mēģināts' },
  few: { tile: 'border-slate-200 bg-slate-50', dot: 'bg-slate-400', label: 'Par maz datu' },
  weak: { tile: 'border-rose-200 bg-rose-50', dot: 'bg-rose-500', label: 'Jāatkārto' },
  mid: { tile: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500', label: 'Gandrīz' },
  good: { tile: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500', label: 'Labi' },
};

export default function TopicMap() {
  const { user, api, data } = useApp();
  const defaultGrade = user.profile.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : 12;
  const [grade, setGrade] = useState(defaultGrade);
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState('');
  const attemptsCount = (data.examAttempts || []).length;

  const [autoSwitched, setAutoSwitched] = useState(false);

  useEffect(() => {
    setSubjects(null);
    setError('');
    api(`/api/progress/topics?grade=${grade}`).then(async (r) => {
      // Pirmajā ielādē: ja savā klasē vēl nav mēģinājumu, bet otrā ir — rāda otru klasi
      if (!autoSwitched && !r.subjects.some((s) => s.attempted > 0)) {
        setAutoSwitched(true);
        const other = grade === 9 ? 12 : 9;
        const o = await api(`/api/progress/topics?grade=${other}`).catch(() => null);
        if (o?.subjects.some((s) => s.attempted > 0)) { setGrade(other); return; }
      }
      setSubjects(r.subjects);
    }).catch((e) => setError(e.message));
  }, [grade, api, attemptsCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const tried = (subjects || []).filter((s) => s.attempted > 0);
  const untried = (subjects || []).filter((s) => s.attempted === 0);
  // Ieteikums: vājākā tēma ar pietiekami daudz mēģinājumiem
  const weakest = tried.flatMap((s) => s.topics.filter((t) => level(t) === 'weak' || level(t) === 'mid').map((t) => ({ ...t, subject: s.subject })))
    .sort((a, b) => a.pct - b.pct)[0];

  return (
    <Card
      title="🗺️ Tēmu karte"
      subtitle="Kuras tēmas jau proti un kuras vēl jāatkārto, pēc valsts eksāmenu uzdevumiem, testiem un simulācijām"
      action={
        <div className="flex gap-1 p-1 rounded-full bg-slate-100" role="group" aria-label="Klase">
          {[9, 12].map((g) => (
            <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${grade === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{g}. klase</button>
          ))}
        </div>
      }
    >
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!subjects && !error && <p className="text-sm text-slate-400">Ielādē…</p>}
      {subjects && tried.length === 0 && (
        <EmptyState icon="🗺️" title="Karte vēl ir tukša" text={`Risini ${grade}. klases valsts eksāmenu uzdevumus vai izmēģini simulāciju. Pēc katras atbildes šeit parādīsies, kuras tēmas proti un kuras jāatkārto.`}>
          <Link href="/exams?mode=official" className="text-sm font-semibold text-accent hover:underline">Uz valsts eksāmeniem →</Link>
        </EmptyState>
      )}
      {tried.length > 0 && (
        <div className="space-y-6">
          {weakest && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-sm text-slate-700">
                <span className="sp-mono text-[10.5px] font-bold text-indigo-700 mr-2">Ieteikums</span>
                Sāc ar <strong className="text-slate-900">{weakest.name}</strong> ({cap(weakest.subject)}): pareizi {weakest.pct}% no {weakest.attempted} uzdevumiem.
              </p>
              <Link href="/exams?mode=quiz" className="text-sm font-semibold text-indigo-700 hover:underline">Trenēt testa režīmā →</Link>
            </div>
          )}

          {tried.map((s) => (
            <section key={s.subject} aria-label={cap(s.subject)}>
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h4 className="font-semibold text-slate-900">{cap(s.subject)}</h4>
                <span className="text-xs text-slate-400">{s.attempted} {s.attempted % 10 === 1 && s.attempted % 100 !== 11 ? 'uzdevums izmēģināts' : 'uzdevumi izmēģināti'}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {s.topics.map((t) => {
                  const lv = level(t);
                  const st = STYLE[lv];
                  const cover = Math.round((t.attempted / t.total) * 100);
                  return (
                    <li key={t.name} className={`p-4 rounded-2xl border ${st.tile}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{cap(t.name)}</p>
                        <span className="text-lg font-bold text-slate-900 tabular-nums shrink-0">{t.pct === null ? '—' : `${t.pct}%`}</span>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <i className={`w-2 h-2 rounded-full ${st.dot}`} aria-hidden="true" />{st.label}
                        {t.attempted > 0 && <span className="text-slate-400">· {t.correct}/{t.attempted} pareizi</span>}
                      </p>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-200/70 overflow-hidden" role="progressbar" aria-label={`${t.name}: izmēģināti ${cover}% uzdevumu`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={cover}>
                        <div className="h-full rounded-full bg-slate-500/60" style={{ width: `${cover}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">Izmēģināti {t.attempted} no {t.total} uzdevumiem</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs text-slate-500" aria-label="Apzīmējumi">
            {['good', 'mid', 'weak', 'few', 'none'].map((k) => (
              <span key={k} className="flex items-center gap-1.5"><i className={`w-2 h-2 rounded-full ${STYLE[k].dot}`} aria-hidden="true" />{STYLE[k].label}{k === 'good' ? ' (80%+)' : k === 'mid' ? ' (50–79%)' : k === 'weak' ? ' (<50%)' : k === 'few' ? ` (<${MIN_ATTEMPTS} uzd.)` : ''}</span>
            ))}
          </div>

          {untried.length > 0 && (
            <p className="text-xs text-slate-400">Vēl nav mēģināts: {untried.map((s) => cap(s.subject)).join(', ')}.</p>
          )}
        </div>
      )}
    </Card>
  );
}

// Eksāmenu simulāciju vēsture progresa lapā
export function SimulationHistory() {
  const { data } = useApp();
  const sims = (data.simulations || []).slice(-6).reverse();
  if (!sims.length) return null;
  const clock = (sec) => `${Math.floor(sec / 60)} min`;
  return (
    <Card title="⏱ Eksāmenu simulācijas" subtitle="Pēdējie rezultāti">
      <ul className="divide-y divide-slate-100">
        {sims.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{s.title}</p>
              <p className="text-xs text-slate-500">{new Date(s.at).toLocaleDateString('lv-LV')} · {clock(s.usedSec)}{s.minutes ? ` no ${s.minutes} min` : ''}</p>
            </div>
            <span className="text-sm text-slate-500 tabular-nums">{s.score}/{s.max} p.</span>
            <span className={`text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-full ${s.percent >= 80 ? 'bg-emerald-50 text-emerald-700' : s.percent >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{s.percent}%</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
