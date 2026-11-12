import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppShell, { PageHeader, inputCls } from '../components/AppShell';
import Card from '../components/Card';
import Button from '../components/Button';
import { useApp } from '../lib/AppContext';
import { fmtDate } from '../lib/helpers';

const TABS = [
  { id: 'overview', label: 'Pārskats' },
  { id: 'users', label: 'Lietotāji' },
  { id: 'exams', label: 'Eksāmeni' },
];

const when = (iso) => (iso ? `${fmtDate(iso.slice(0, 10))} ${new Date(iso).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })}` : '—');
const num = (n) => Number(n || 0).toLocaleString('lv-LV');

function Stat({ label, value, note }) {
  return (
    <div className="pilot-card bg-white p-5 rounded-2xl border border-slate-200">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
    </div>
  );
}

function Overview() {
  const { api } = useApp();
  const [o, setO] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = () => api('/api/admin/overview').then(setO).catch((e) => setError(e.message));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [api]);
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!o) return <p className="text-sm text-slate-400">Ielādē…</p>;
  const max = Math.max(1, ...o.ai.daily.map((d) => d.n));
  const checks = [
    ['AI skolotājs (DEEPSEEK_API_KEY)', o.ai.keySet],
    ['E-pasts (EMAIL_API_KEY)', o.features.email],
    ['Maksājumi (STRIPE_SECRET_KEY + STRIPE_PRICE_ID)', o.features.payments],
    ['Stripe webhook (STRIPE_WEBHOOK_SECRET)', o.features.webhook],
  ];
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Lietotāji" value={num(o.users.users)} note={`+${o.users.new_week} šonedēļ`} />
        <Stat label="Aktīvi" value={num(o.users.active_today)} note={`${o.users.active_week} pēdējās 7 dienās`} />
        <Stat label="Premium" value={num(o.users.premium)} note={`${o.users.paying} maksā caur Stripe`} />
        <Stat label="AI jautājumi šodien" value={o.ai.globalLimit ? `${num(o.ai.todayRiga)} / ${num(o.ai.globalLimit)}` : num(o.ai.todayRiga)} note={`${o.ai.globalLimit ? 'kopējais dienas limits' : 'bez kopējā limita'} · ${num(o.ai.month)} 30 dienās`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="AI lietojums" subtitle="Jautājumi dienā, pēdējās 14 dienas">
          {o.ai.daily.length === 0 ? <p className="text-sm text-slate-400">Vēl nav AI jautājumu.</p> : (
            <div className="flex items-end gap-1.5 h-32" role="img" aria-label="AI jautājumi pa dienām">
              {o.ai.daily.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${d.day}: ${d.n}`}>
                  <div className="w-full rounded-t bg-accent" style={{ height: `${(d.n / max) * 100}%`, minHeight: 2 }} />
                  <span className="text-[9px] text-slate-400">{d.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-4">
            Tokeni 30 dienās: {num(o.ai.tokensIn)} ievade + {num(o.ai.tokensOut)} izvade.{' '}
            {o.ai.costMonth != null ? <>Aptuvenās izmaksas: <strong>${o.ai.costMonth.toFixed(2)}</strong>.</> : 'Izmaksu aprēķinam .env ieraksti AI_PRICE_IN un AI_PRICE_OUT (USD par 1 milj. tokenu).'}
          </p>
        </Card>
        <Card title="Sistēmas stāvoklis" subtitle={`Serveris palaists ${when(o.startedAt)}`}>
          <ul className="space-y-2.5 text-sm">
            {checks.map(([label, ok]) => (
              <li key={label} className="flex items-center justify-between gap-3">
                <span className="text-slate-600">{label}</span>
                <span className={`font-semibold ${ok ? 'text-emerald-700' : 'text-slate-400'}`}>{ok ? '● Ieslēgts' : '○ Nav'}</span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Eksāmenu datubāze</span>
              <span className="font-semibold text-slate-800">{o.exams.docs} eksāmeni · {o.exams.tasks} uzdevumi</span>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function Users() {
  const { api, user: me } = useApp();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(() => api('/api/admin/users').then((r) => setUsers(r.users)).catch((e) => setError(e.message)), [api]);
  useEffect(() => { load(); }, [load]);
  const [tempPw, setTempPw] = useState(null); // { email, password } — rāda vienu reizi, nekur netiek saglabāta

  const act = async (body, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError('');
    setTempPw(null);
    try {
      const r = await api('/api/admin/users', { method: body.delete ? 'DELETE' : 'PATCH', body });
      if (r?.tempPassword) setTempPw({ email: (users || []).find((x) => x.id === body.id)?.email || '', password: r.tempPassword });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (users || []).filter((u) => !s || `${u.email} ${u.name} ${u.school || ''}`.toLowerCase().includes(s));
  }, [users, q]);

  return (
    <Card title="Lietotāji" subtitle={users ? `${list.length} no ${users.length}` : 'Ielādē…'} action={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Meklēt e-pastu, vārdu, skolu…" className={`${inputCls} sm:w-72`} aria-label="Meklēt" />}>
      {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
      {tempPw && (
        <div role="status" className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-slate-800">
          <p className="font-semibold">Pagaidu parole lietotājam {tempPw.email}</p>
          <p className="font-mono text-lg tracking-wide my-2 select-all">{tempPw.password}</p>
          <p className="text-xs text-slate-600">Parole tiek rādīta tikai vienu reizi un nekur netiek saglabāta. Nodod to lietotājam droši un lūdz to nomainīt profilā. Visas viņa sesijas ir izbeigtas.</p>
          <button type="button" onClick={() => setTempPw(null)} className="mt-2 text-xs font-semibold underline cursor-pointer">Aizvērt</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="py-2.5 pr-4">Lietotājs</th>
              <th className="py-2.5 pr-4">Klase</th>
              <th className="py-2.5 pr-4">Plāns</th>
              <th className="py-2.5 pr-4">AI (šodien / 30 d.)</th>
              <th className="py-2.5 pr-4">Pēdējā aktivitāte</th>
              <th className="py-2.5">Darbības</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((u) => (
              <tr key={u.id} className={u.blocked ? 'opacity-60' : ''}>
                <td className="py-3 pr-4">
                  <p className="font-semibold text-slate-900">{u.name || '—'}{u.role === 'admin' && <span className="ml-2 text-[10px] font-bold text-accent">ADMIN</span>}{u.blocked && <span className="ml-2 text-[10px] font-bold text-rose-700">BLOĶĒTS</span>}</p>
                  <p className="text-xs text-slate-500">{u.email}{!u.verified && ' · nav apstiprināts'}</p>
                </td>
                <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">{u.grade}. {u.level}{u.school && <span className="block text-xs text-slate-400">{u.school}</span>}</td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span className={u.plan === 'premium' ? 'font-semibold text-accent' : 'text-slate-600'}>{u.plan === 'premium' ? 'Premium' : 'Bezmaksas'}</span>
                  {u.planSource && <span className="block text-xs text-slate-400">{u.planSource === 'stripe' ? `Stripe · ${u.stripeStatus}` : 'piešķīra admins'}</span>}
                </td>
                <td className="py-3 pr-4 text-slate-600">{u.aiToday} / {u.aiMonth}</td>
                <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">{when(u.lastActive)}</td>
                <td className="py-3">
                  {u.id === me.id ? <span className="text-xs text-slate-400">tu</span> : (
                    <div className="flex flex-wrap gap-1.5">
                      {u.planSource !== 'stripe' && (
                        <Button variant="secondary" className="text-xs py-1 px-2.5" onClick={() => act({ id: u.id, plan: u.plan === 'premium' ? 'free' : 'premium' })}>{u.plan === 'premium' ? 'Noņemt Premium' : 'Dot Premium'}</Button>
                      )}
                      <Button variant="secondary" className="text-xs py-1 px-2.5" onClick={() => act({ id: u.id, blocked: !u.blocked }, u.blocked ? null : `Bloķēt ${u.email}? Lietotājs tiks izrakstīts.`)}>{u.blocked ? 'Atbloķēt' : 'Bloķēt'}</Button>
                      <Button variant="secondary" className="text-xs py-1 px-2.5" onClick={() => act({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' }, u.role === 'admin' ? null : `Padarīt ${u.email} par administratoru?`)}>{u.role === 'admin' ? 'Noņemt admin' : 'Padarīt par admin'}</Button>
                      {u.id !== me?.id && (
                        <Button variant="secondary" className="text-xs py-1 px-2.5" onClick={() => act({ id: u.id, resetPassword: true }, `Atiestatīt paroli lietotājam ${u.email}? Viņa vecā parole vairs nederēs un visas sesijas tiks izbeigtas. Jaunā pagaidu parole tiks parādīta tikai vienu reizi.`)}>Atiestatīt paroli</Button>
                      )}
                      <Button variant="danger" className="text-xs py-1 px-2.5" onClick={() => act({ id: u.id, delete: true }, `Neatgriezeniski dzēst ${u.email} un visus viņa datus?`)}>Dzēst</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const SAMPLE = `{
  "subject": "matemātika", "grade": 12, "year": 2025, "session": "pamatsesija",
  "title": "Matemātika 12. klasei, 2025", "source_url": "https://www.viaa.gov.lv/...",
  "tasks": [
    { "number": "1.1", "kind": "choice", "text": "Atrisini $x^2 = 9$", "options": { "A": "3", "B": "±3" }, "answer": "B" },
    { "number": "2.1", "kind": "open", "text": "Pierādi, ka $\\\\sqrt{2}$ ir iracionāls skaitlis.", "points": 3, "answer": "Vērtēšanas kritēriji…" }
  ]
}`;

function Exams() {
  const { api } = useApp();
  const [docs, setDocs] = useState(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api('/api/admin/exams').then((r) => setDocs(r.docs)).catch((e) => setError(e.message)), [api]);
  useEffect(() => { load(); }, [load]);

  const readFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setText(String(r.result));
    r.readAsText(f, 'utf-8');
  };

  const upload = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    let exam;
    try { exam = JSON.parse(text); } catch (err) { return setError(`Nederīgs JSON: ${err.message}`); }
    setBusy(true);
    try {
      const r = await api('/api/admin/exams', { method: 'POST', body: { exam } });
      setMsg(`Saglabāts: ${r.tasks} uzdevumi.`);
      setText('');
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (d) => {
    if (!window.confirm(`Dzēst „${d.title}” ar visiem ${d.tasks} uzdevumiem?`)) return;
    try { await api('/api/admin/exams', { method: 'DELETE', body: { id: d.id } }); await load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card title="Pievienot eksāmenu" subtitle="JSON fails (formāts kā Study_Pilot/exams/*.json). Atkārtota augšupielāde atjaunina.">
        <form onSubmit={upload} className="space-y-3">
          <input type="file" accept=".json,application/json" onChange={readFile} className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder={SAMPLE} className={`${inputCls} font-mono text-xs`} aria-label="Eksāmena JSON" />
          {error && <p className="text-sm text-rose-600 whitespace-pre-wrap">{error}</p>}
          {msg && <p className="text-sm text-emerald-700" role="status">{msg}</p>}
          <div className="flex justify-end"><Button type="submit" disabled={busy || !text.trim()}>{busy ? 'Saglabā…' : 'Pārbaudīt un saglabāt'}</Button></div>
          <p className="text-xs text-slate-400">Formulas raksti LaTeX: $x^2$. Pareizās atbildes un vērtēšanas kritēriji skolēniem netiek rādīti — tos izmanto tikai pārbaude un AI. Pirms publicēšanas pārliecinies par VIAA lietošanas noteikumiem.</p>
        </form>
      </Card>
      <Card title="Eksāmeni datubāzē" subtitle={docs ? `${docs.length} eksāmeni` : 'Ielādē…'}>
        <ul className="divide-y divide-slate-100">
          {(docs || []).map((d) => (
            <li key={d.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{d.title}</p>
                <p className="text-xs text-slate-500">{d.subject} · {d.grade}. kl. · {d.year}{d.session ? ` · ${d.session}` : ''} · {d.tasks} uzd.</p>
              </div>
              <Button variant="secondary" className="text-xs py-1 px-2.5 shrink-0" onClick={() => remove(d)}>Dzēst</Button>
            </li>
          ))}
          {docs && docs.length === 0 && <li className="py-3 text-sm text-slate-400">Nav neviena eksāmena.</li>}
        </ul>
      </Card>
    </div>
  );
}

function Admin() {
  const { user } = useApp();
  const [tab, setTab] = useState('overview');
  if (user.role !== 'admin') return <Card><p className="text-sm text-slate-500">Šī sadaļa pieejama tikai administratoriem.</p></Card>;
  return (
    <>
      <PageHeader title="Administrēšana" subtitle="Lietotāji, Premium, eksāmenu materiāli un sistēmas stāvoklis">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer ${tab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{t.label}</button>
          ))}
        </div>
      </PageHeader>
      {tab === 'overview' && <Overview />}
      {tab === 'users' && <Users />}
      {tab === 'exams' && <Exams />}
    </>
  );
}

export default function AdminPage() {
  return (
    <AppShell>
      <Admin />
    </AppShell>
  );
}
