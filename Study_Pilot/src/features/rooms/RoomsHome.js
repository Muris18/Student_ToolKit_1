import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { PageHeader, EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { normalizeCode, dalibnieki } from '../../lib/rooms';

const STATE_LABEL = { lobby: 'Gaida sākumu', running: 'Notiek kārta', review: 'Pārskats' };

// Mācību istabu sākums: pievienoties ar kodu, izveidot istabu, manas istabas
export default function RoomsHome() {
  const { api } = useApp();
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('single');
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => api('/api/rooms').then(setInfo).catch((e) => setError(e.message)), [api]);
  useEffect(() => { load(); }, [load]);

  const join = async (e) => {
    e.preventDefault();
    setError('');
    // Pieņem arī ielīmētu saiti: ņem pēdējo daļu
    const last = codeInput.trim().split(/[/?#]/).filter(Boolean).pop() || '';
    const code = normalizeCode(last);
    if (!code) { setError('Kods ir 6 simbolus garš (burti un cipari). Pārbaudi un mēģini vēlreiz.'); return; }
    setBusy('join');
    try {
      const r = await api('/api/rooms/join', { method: 'POST', body: { code } });
      router.push(`/rooms/${r.code}`);
    } catch (err) {
      setError(err.message);
      setBusy('');
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setBusy('create');
    try {
      const r = await api('/api/rooms', { method: 'POST', body: { name, mode, topic } });
      router.push(`/rooms/${r.code}`);
    } catch (err) {
      setError(err.message);
      setBusy('');
    }
  };

  const blocked = info && !info.allowed;
  const input = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <>
      <PageHeader title="Mācību istabas" subtitle="Mācies kopā ar draugiem: viens uzdevumu komplekts, kopīgs taimeris un kļūdu pārskats kārtas beigās" />
      {error && <p role="alert" className="text-sm text-rose-600 p-3 rounded-xl bg-rose-50 border border-rose-100">{error}</p>}
      {blocked && (
        <div role="status" className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex flex-wrap items-center justify-between gap-3">
          <span>Mācību istabas ir pieejamas Premium lietotājiem.</span>
          <Link href="/premium" className="font-semibold underline">Uzzināt par Premium</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Pievienoties istabai" subtitle="Ievadi 6 simbolu kodu vai ielīmē saiti">
          <form onSubmit={join} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-500" htmlFor="room-code">Istabas kods</label>
            <input id="room-code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="piem. K7M2PQ" autoComplete="off" className={`${input} sp-mono uppercase tracking-widest`} />
            <Button type="submit" disabled={blocked || busy === 'join' || !codeInput.trim()}>{busy === 'join' ? 'Pievienojos…' : 'Pievienoties'}</Button>
          </form>
        </Card>

        <Card title="Izveidot istabu" subtitle={info ? `Līdz ${info.maxMembers} dalībniekiem` : ''}>
          <form onSubmit={create} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="room-name">Nosaukums</label>
              <input id="room-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="piem. Matemātika 12. klasei" className={input} />
            </div>
            <div role="group" aria-label="Istabas veids" className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit">
              {[['single', 'Viena tēma'], ['mixed', 'Dažādas tēmas']].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={mode === v} onClick={() => setMode(v)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${mode === v ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{l}</button>
              ))}
            </div>
            {mode === 'single' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="room-topic">Tēma</label>
                <input id="room-topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80} placeholder="piem. Logaritmi" className={input} />
              </div>
            ) : (
              <p className="text-xs text-slate-500">Katrs dalībnieks pats norāda, ko šobrīd mācās.</p>
            )}
            <Button type="submit" disabled={blocked || busy === 'create' || name.trim().length < 2}>{busy === 'create' ? 'Veidoju…' : 'Izveidot istabu'}</Button>
          </form>
        </Card>
      </div>

      <Card title="Manas istabas" subtitle="Istabas bez aktivitātes 24 stundas tiek dzēstas">
        {!info && !error && <p className="text-sm text-slate-400">Ielādē…</p>}
        {info && info.rooms.length === 0 && <EmptyState icon="👥" title="Tu vēl neesi nevienā istabā" text="Izveido istabu vai pievienojies ar draugu kodu." />}
        {info && info.rooms.length > 0 && (
          <ul className="space-y-2">
            {info.rooms.map((r) => (
              <li key={r.code} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800">{r.name}{r.isHost && <span className="ml-2 text-[11px] font-medium text-slate-500">(tu vadi)</span>}</p>
                  <p className="text-xs text-slate-500">{r.mode === 'single' && r.topic ? `${r.topic} · ` : ''}{dalibnieki(r.members)} · {STATE_LABEL[r.state]} · kods <span className="sp-mono">{r.code}</span></p>
                </div>
                <Link href={`/rooms/${r.code}`} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50">Atvērt</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
