import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { inputCls, labelCls } from '../components/AppShell';
import { useApp } from '../lib/AppContext';

export default function LoginPage() {
  const { status, login, notice, config } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = typeof router.query.next === 'string' && router.query.next.startsWith('/') ? router.query.next : '/dashboard';

  useEffect(() => {
    if (status === 'ready') router.replace(next);
  }, [status, next, router]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Pieslēgties"
      subtitle="Laipni lūgts atpakaļ! Ievadi savu e-pastu un paroli."
      footer={<>Vēl nav konta? <Link href={`/register${router.query.next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-accent hover:underline">Reģistrēties</Link></>}
    >
      {notice && <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">{notice}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="email">E-pasts</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls} htmlFor="password">Parole</label>
            {config.email
              ? <Link href="/forgot" className="text-xs font-semibold text-accent hover:underline mb-1.5">Aizmirsi paroli?</Link>
              : <a href="mailto:jautajumi@studypilot.lv?subject=Aizmirsu%20paroli" className="text-xs text-slate-400 hover:text-accent mb-1.5">Aizmirsi paroli?</a>}
          </div>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full py-3">{busy ? 'Pieslēdzas…' : 'Pieslēgties'}</Button>
      </form>
    </AuthLayout>
  );
}
