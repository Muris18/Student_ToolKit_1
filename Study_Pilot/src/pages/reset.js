import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { inputCls, labelCls } from '../components/AppShell';
import { useApp } from '../lib/AppContext';

// Jaunas paroles izvēle pēc saites no e-pasta (/reset?token=...)
export default function ResetPage() {
  const { api } = useApp();
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== again) return setError('Paroles nesakrīt');
    setBusy(true);
    try {
      await api('/api/auth/reset', { method: 'POST', body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <AuthLayout title="Jauna parole" subtitle="Izvēlies jaunu paroli savam Study Pilot kontam.">
      {done ? (
        <div className="space-y-4">
          <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">Parole nomainīta. Visās citās ierīcēs tu tiki izrakstīts.</div>
          <Link href="/login" className="block text-center font-semibold text-accent hover:underline">Pieslēgties ar jauno paroli →</Link>
        </div>
      ) : !token ? (
        <p className="text-sm text-slate-500">Saite nav pilnīga. Atver to vēlreiz no e-pasta vai <Link href="/forgot" className="text-accent underline">pieprasi jaunu</Link>.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="pw">Jaunā parole</label>
            <input id="pw" type="password" required minLength={8} maxLength={200} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            <p className="text-[11px] text-slate-400 mt-1">Vismaz 8 simboli, ne tikai cipari.</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="pw2">Atkārto paroli</label>
            <input id="pw2" type="password" required autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-sm text-rose-600 font-medium">{error}{/nederīga|beigusies/.test(error) && <> <Link href="/forgot" className="underline">Pieprasīt jaunu saiti</Link></>}</p>}
          <Button type="submit" disabled={busy} className="w-full py-3">{busy ? 'Saglabā…' : 'Saglabāt jauno paroli'}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
