import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useApp } from '../../lib/AppContext';
import { normalizeCode, mmss, dalibnieki } from '../../lib/rooms';
import { useRoom, useTick } from './useRoom';
import { useSaveMistakes } from './useSaveMistakes';
import { SetPicker, PlayRound, ReviewPanel } from './RoomRounds';

const STATE_LABEL = { lobby: 'Gaida sākumu', running: 'Notiek kārta', review: 'Pārskats' };

// /rooms/<kods>: ja neesi dalībnieks vai istaba aizvērta, rāda pievienošanos
export default function RoomView({ code }) {
  const [epoch, setEpoch] = useState(0);
  return <RoomInner key={epoch} code={code} onJoined={() => setEpoch((n) => n + 1)} />;
}

function RoomInner({ code, onJoined }) {
  const { state, error, act, now } = useRoom(code);
  useSaveMistakes(state);

  if (error && (error.status === 404 || error.status === 401)) return <JoinPrompt code={code} onJoined={onJoined} />;
  if (!state) {
    return error
      ? <p role="alert" className="text-sm text-rose-600">{error.message}</p>
      : <div className="flex items-center gap-3 text-sm text-slate-400 py-10"><span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" /> Ielādē istabu…</div>;
  }
  return <Room state={state} act={act} now={now} netError={error?.message} />;
}

function JoinPrompt({ code, onJoined }) {
  const { api } = useApp();
  const valid = normalizeCode(code);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const join = async () => {
    setBusy(true);
    setError('');
    try { await api('/api/rooms/join', { method: 'POST', body: { code: valid } }); onJoined(); } catch (e) { setError(e.message); setBusy(false); }
  };
  return (
    <Card title={valid ? 'Pievienoties istabai' : 'Istaba nav atrasta'} subtitle={valid ? `Kods ${valid}` : undefined}>
      <div className="space-y-4 text-sm text-slate-600">
        <p>{valid ? 'Tu vēl neesi šīs istabas dalībnieks, vai arī istaba ir aizvērta.' : 'Kods nav derīgs.'}</p>
        {error && <p role="alert" className="text-rose-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          {valid && <Button onClick={join} disabled={busy}>{busy ? 'Pievienojos…' : 'Pievienoties'}</Button>}
          <Link href="/rooms" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50">Uz istabu sarakstu</Link>
        </div>
      </div>
    </Card>
  );
}

function Room({ state, act, now, netError }) {
  const router = useRouter();
  const { room, members } = state;
  const isHost = state.me.isHost;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/rooms/${room.code}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { setError('Neizdevās nokopēt. Nokopē saiti no adreses joslas.'); }
  };
  const leave = async () => {
    if (!window.confirm(isHost && members.length > 1 ? 'Iziet no istabas? Istaba pāries nākamajam dalībniekam.' : 'Iziet no istabas?')) return;
    try { await act('', 'DELETE'); router.push('/rooms'); } catch (e) { setError(e.message); }
  };
  const close = async () => {
    if (!window.confirm('Aizvērt istabu visiem? Visas atbildes tiks dzēstas.')) return;
    try { await act('/host', 'POST', { type: 'close' }); router.push('/rooms'); } catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs"><Link href="/rooms" className="text-slate-500 hover:text-accent">← Mācību istabas</Link></p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 break-words">{room.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {STATE_LABEL[room.state]} · {room.round}. kārta · {dalibnieki(members.length)}{room.mode === 'single' && room.topic ? ` · ${room.topic}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="sp-mono text-lg font-bold tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800" aria-label={`Istabas kods ${room.code.split('').join(' ')}`}>{room.code}</span>
          <Button variant="secondary" onClick={copy} className="text-xs py-1.5 px-3">{copied ? 'Nokopēts ✓' : 'Kopēt saiti'}</Button>
          <Button variant="ghost" onClick={leave} className="text-xs py-1.5 px-3">Iziet</Button>
          {isHost && <Button variant="danger" onClick={close} className="text-xs py-1.5 px-3">Aizvērt istabu</Button>}
        </div>
      </div>
      {(error || netError) && <p role="alert" className="text-sm text-rose-600 p-3 rounded-xl bg-rose-50 border border-rose-100">{error || `Savienojuma problēma: ${netError}`}</p>}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {room.state === 'lobby' && <SetPicker state={state} act={act} />}
          {room.state === 'running' && <PlayRound state={state} act={act} />}
          {room.state === 'review' && <ReviewPanel state={state} act={act} />}
        </div>
        <div className="space-y-6">
          <TimerPanel state={state} act={act} now={now} />
          <MembersPanel state={state} act={act} />
        </div>
      </div>
    </div>
  );
}

// Kopīgais taimeris: īpašnieks vada, citi redz. Laiks nāk no servera (endsAt), tāpēc visās cilnēs sakrīt.
function TimerPanel({ state, act, now }) {
  const { update } = useApp();
  const { timer } = state.room;
  const isHost = state.me.isHost;
  useTick(Boolean(timer.endsAt));
  const left = timer.endsAt ? Math.max(0, Math.ceil((timer.endsAt - now()) / 1000)) : timer.left;
  const running = Boolean(timer.endsAt) && left > 0;
  const finished = Boolean(timer.endsAt) && left === 0;
  const [error, setError] = useState('');

  // Taimera beigas, kamēr esi istabā, ieskaita mācību aktivitātē (vienreiz katram taimera ciklam)
  const sawRunning = useRef(null);
  const counted = useRef(null);
  useEffect(() => {
    if (running) sawRunning.current = timer.endsAt;
    if (finished && sawRunning.current === timer.endsAt && counted.current !== timer.endsAt) {
      counted.current = timer.endsAt;
      update((d) => ({ ...d }));
    }
  }, [running, finished, timer.endsAt, update]);

  const op = (name, minutes) => act('/host', 'POST', { type: 'timer', op: name, minutes }).then(() => setError('')).catch((e) => setError(e.message));
  const btn = 'text-xs py-1.5 px-3';

  return (
    <Card title="Taimeris" subtitle={finished ? 'Laiks beidzies' : running ? 'Mācāmies' : 'Apturēts'}>
      <p className={`sp-mono text-5xl font-bold text-center py-2 ${finished ? 'text-rose-600' : 'text-slate-900'}`} role="timer" aria-live="off">{mmss(left)}</p>
      {isHost ? (
        <div className="space-y-3 mt-3">
          <div className="flex flex-wrap justify-center gap-2">
            {running
              ? <Button onClick={() => op('pause')} className={btn}>Pauze</Button>
              : <Button onClick={() => op('start')} className={btn}>{finished ? 'Sākt no jauna' : timer.left < timer.total ? 'Turpināt' : 'Sākt'}</Button>}
            <Button variant="secondary" onClick={() => op('reset')} className={btn}>Atiestatīt</Button>
          </div>
          <div className="flex justify-center gap-1" role="group" aria-label="Taimera ilgums">
            {[15, 25, 45].map((m) => (
              <button key={m} type="button" disabled={running} aria-pressed={timer.total === m * 60} onClick={() => op('set', m)} className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${timer.total === m * 60 ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{m} min</button>
            ))}
          </div>
        </div>
      ) : <p className="text-xs text-slate-500 text-center mt-2">Taimeri vada istabas īpašnieks.</p>}
      {error && <p role="alert" className="text-xs text-rose-600 mt-2 text-center">{error}</p>}
    </Card>
  );
}

function MembersPanel({ state, act }) {
  const { members, room } = state;
  const isHost = state.me.isHost;
  const me = members.find((m) => m.isMe);
  const [topic, setTopic] = useState(me?.topic || '');
  const [error, setError] = useState('');
  const total = room.set.total;
  const showProgress = room.state !== 'lobby' && total > 0;
  const review = room.state === 'review';

  const patch = (body) => act('/me', 'PATCH', body).then(() => setError('')).catch((e) => setError(e.message));
  const kick = (m) => { if (window.confirm(`Izmest ${m.name} no istabas? Viņš vairs nevarēs pievienoties.`)) act('/host', 'POST', { type: 'kick', memberId: m.id }).catch((e) => setError(e.message)); };

  return (
    <Card title="Dalībnieki" subtitle={`${members.length} no ${state.config.maxMembers}`}>
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.online ? 'bg-emerald-500' : 'bg-slate-300'}`} title={m.online ? 'Tiešsaistē' : 'Nav tiešsaistē'} role="img" aria-label={m.online ? 'tiešsaistē' : 'nav tiešsaistē'} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{m.name}{m.isMe && ' (tu)'}{m.isHost && <span title="Istabas īpašnieks" className="ml-1">👑</span>}</p>
              <p className="text-xs text-slate-500 truncate">{m.status === 'break' ? 'Pauzē' : 'Mācās'}{m.topic ? ` · ${m.topic}` : ''}</p>
            </div>
            {showProgress && <span className="text-xs font-semibold text-slate-600 shrink-0">{review ? `✓ ${m.correct ?? 0}/${total}` : `${m.answered}/${total}`}</span>}
            {isHost && !m.isMe && <button type="button" onClick={() => kick(m)} className="text-[11px] text-rose-600 hover:underline cursor-pointer shrink-0" aria-label={`Izmest ${m.name}`}>Izmest</button>}
          </li>
        ))}
      </ul>
      {me && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit" role="group" aria-label="Mans statuss">
            {[['studying', 'Mācos'], ['break', 'Pauze']].map(([v, l]) => (
              <button key={v} type="button" aria-pressed={me.status === v} onClick={() => patch({ status: v })} className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${me.status === v ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{l}</button>
            ))}
          </div>
          <label className="block text-xs font-semibold text-slate-500" htmlFor="room-my-topic">Ko šobrīd mācies?</label>
          <input id="room-my-topic" value={topic} maxLength={60} onChange={(e) => setTopic(e.target.value)} onBlur={() => topic !== me.topic && patch({ topic })} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="piem. Logaritmi" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800" />
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        </div>
      )}
    </Card>
  );
}
