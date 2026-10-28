import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { inputCls, labelCls } from '../components/AppShell';
import { useApp } from '../lib/AppContext';

export default function RegisterPage() {
  const { status, register, notice } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', level: 'klase', grade: 12, school: '', program: '' });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') ? router.query.next : '/dashboard';

  useEffect(() => {
    if (status === 'ready') router.replace(next);
  }, [status, next, router]);

  const setLevel = (level) => setForm((f) => ({ ...f, level, grade: level === 'klase' ? 12 : 1 }));
  const gradeOptions = form.level === 'klase' ? Array.from({ length: 12 }, (_, i) => i + 1) : [1, 2, 3, 4, 5, 6];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { email, password, ...profile } = form;
      await register({ email, password, profile, ageConfirmed, acceptTerms });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Izveidot kontu"
      subtitle="Pastāsti par sevi — klasi vai kursu. Priekšmetus pievienosi pēc tam."
      footer={<>Jau ir konts? <Link href="/login" className="font-semibold text-accent hover:underline">Pieslēgties</Link></>}
    >
      {notice && <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">{notice}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="fn">Vārds</label>
            <input id="fn" required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="ln">Uzvārds</label>
            <input id="ln" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} className={inputCls} />
          </div>
        </div>

        <div>
          <span className={labelCls}>Es mācos</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'klase', label: '🏫 Skolā (klase)' },
              { id: 'kurss', label: '🎓 Tehnikumā / augstskolā (kurss)' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setLevel(o.id)}
                className={`p-3 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
                  form.level === o.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="grade">{form.level === 'klase' ? 'Klase' : 'Kurss'}</label>
            <select id="grade" value={form.grade} onChange={set('grade')} className={inputCls}>
              {gradeOptions.map((n) => <option key={n} value={n}>{n}. {form.level === 'klase' ? 'klase' : 'kurss'}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="school">{form.level === 'klase' ? 'Skola' : 'Mācību iestāde'} <span className="normal-case font-medium">(nav obligāti)</span></label>
            <input id="school" value={form.school} onChange={set('school')} className={inputCls} />
          </div>
        </div>

        {form.level === 'kurss' && (
          <div>
            <label className={labelCls} htmlFor="program">Programma / specialitāte <span className="normal-case font-medium">(nav obligāti)</span></label>
            <input id="program" value={form.program} onChange={set('program')} className={inputCls} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="email">E-pasts</label>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="pw">Parole</label>
            <input id="pw" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} className={inputCls} />
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" required checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600" />
            <span>Man ir vismaz 13 gadi</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" required checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600" />
            <span>
              Piekrītu{' '}
              <Link href="/terms" target="_blank" className="font-semibold text-accent hover:underline">lietošanas noteikumiem</Link>
              {' '}un esmu izlasījis{' '}
              <Link href="/privacy" target="_blank" className="font-semibold text-accent hover:underline">privātuma politiku</Link>
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        <Button type="submit" disabled={busy || !ageConfirmed || !acceptTerms} className="w-full py-3">{busy ? 'Veido kontu…' : 'Reģistrēties'}</Button>
      </form>
    </AuthLayout>
  );
}
