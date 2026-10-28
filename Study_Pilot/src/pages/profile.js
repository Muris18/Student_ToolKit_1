import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell, { PageHeader, inputCls, labelCls } from '../components/AppShell';
import Card from '../components/Card';
import Button from '../components/Button';
import SubjectManager from '../features/profile/SubjectManager';
import { useApp } from '../lib/AppContext';
import { emptyClientData } from '../lib/emptyData';

function ProfileForm() {
  const { user, saveProfile } = useApp();
  const [form, setForm] = useState(user.profile);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  useEffect(() => setForm(user.profile), [user.profile]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 2200); return () => clearTimeout(t); }, [msg]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setLevel = (level) => setForm((f) => ({ ...f, level, grade: level === 'klase' ? 12 : 1 }));
  const gradeOptions = form.level === 'klase' ? Array.from({ length: 12 }, (_, i) => i + 1) : [1, 2, 3, 4, 5, 6];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await saveProfile(form); setMsg('Saglabāts'); } catch (err) { setError(err.message); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls} htmlFor="fn">Vārds</label><input id="fn" required value={form.firstName} onChange={set('firstName')} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="ln">Uzvārds</label><input id="ln" value={form.lastName} onChange={set('lastName')} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{ id: 'klase', label: '🏫 Skola (klase)' }, { id: 'kurss', label: '🎓 Kurss' }].map((o) => (
          <button key={o.id} type="button" onClick={() => setLevel(o.id)} className={`p-3 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${form.level === o.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{o.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="grade">{form.level === 'klase' ? 'Klase' : 'Kurss'}</label>
          <select id="grade" value={form.grade} onChange={set('grade')} className={inputCls}>
            {gradeOptions.map((n) => <option key={n} value={n}>{n}. {form.level === 'klase' ? 'klase' : 'kurss'}</option>)}
          </select>
        </div>
        <div><label className={labelCls} htmlFor="school">{form.level === 'klase' ? 'Skola' : 'Mācību iestāde'}</label><input id="school" value={form.school} onChange={set('school')} className={inputCls} /></div>
      </div>
      {form.level === 'kurss' && (
        <div><label className={labelCls} htmlFor="program">Programma / specialitāte</label><input id="program" value={form.program} onChange={set('program')} className={inputCls} /></div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex items-center justify-end gap-3 pt-2">
        {msg && <span className="text-sm text-emerald-600 font-semibold">✓ {msg}</span>}
        <Button type="submit">Saglabāt profilu</Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <AppShell className="max-w-5xl">
      <PageHeader title="👤 Profils un priekšmeti" subtitle="Tava klase vai kurss un priekšmeti, kurus gatavo eksāmeniem." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="Par mani" subtitle="Redzams navigācijā un vadības panelī"><ProfileForm /></Card>
        <Card title="📚 Mani priekšmeti" subtitle="No tiem veidojas plānotājs, uzdevumi, testi un progress"><SubjectManager /></Card>
      </div>
      <DangerZone />
    </AppShell>
  );
}

function DangerZone() {
  const { user, update, deleteAccount, setAiConsent, exportData } = useApp();
  const [error, setError] = useState('');
  const run = (fn) => async () => {
    setError('');
    try { await fn(); } catch (err) { setError(err.message); }
  };
  const consentDate = user.aiConsentAt ? new Date(user.aiConsentAt).toLocaleDateString('lv-LV') : null;
  return (
    <Card title="Dati un privātums" subtitle={<>Kā mēs apstrādājam datus — <Link href="/privacy" className="text-accent hover:underline">privātuma politika</Link></>}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="text-sm text-slate-500">Lejupielādē visus datus, kas par tevi glabājas (konts, profils, mācību dati, čats, AI lietojums), JSON failā.</p>
          <Button variant="secondary" onClick={run(exportData)} className="shrink-0">Lejupielādēt manus datus</Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="text-sm text-slate-500">
            {consentDate
              ? `AI skolotājs: piekriti datu nosūtīšanai uz DeepSeek (ārpus ES) ${consentDate}. Atsaucot piekrišanu, AI skolotājs nebūs pieejams.`
              : 'AI skolotājs: piekrišana datu nosūtīšanai uz DeepSeek nav dota. To vari dot AI čatā eksāmenu sadaļā.'}
          </p>
          {consentDate && (
            <Button variant="secondary" onClick={run(() => window.confirm('Atsaukt piekrišanu? AI skolotājs vairs nebūs pieejams.') && setAiConsent(false))} className="shrink-0">Atsaukt piekrišanu</Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="text-sm text-slate-500">Notīrīt visu (priekšmetus, termiņus, uzdevumus, testus, čatu), paturot kontu — vai dzēst kontu pavisam.</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={() => window.confirm('Notīrīt visus savus datus?') && update(() => emptyClientData(), { activity: false })}>Notīrīt datus</Button>
            <Button variant="danger" onClick={run(() => window.confirm('Dzēst kontu? To nevar atsaukt.') && deleteAccount())}>Dzēst kontu</Button>
          </div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Card>
  );
}
