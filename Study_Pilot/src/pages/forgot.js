import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { inputCls, labelCls } from '../components/AppShell';
import { useApp } from '../lib/AppContext';

// "Aizmirsu paroli": nosūta saiti uz e-pastu (ja e-pasta sūtīšana ir ieslēgta)
export default function ForgotPage() {
  const { api, config } = useApp();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await api('/api/auth/forgot', { method: 'POST', body: { email } });
      setMsg(r.message);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <AuthLayout
      title="Aizmirsi paroli?"
      subtitle="Ievadi savu e-pastu, un mēs atsūtīsim saiti jaunas paroles izvēlei."
      footer={<Link href="/login" className="font-semibold text-accent hover:underline">← Atpakaļ uz pieslēgšanos</Link>}
    >
      {!config.email && (
        <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          Paroles atjaunošana pa e-pastu vēl nav ieslēgta. Raksti uz{' '}
          <a className="underline font-semibold" href="mailto:jautajumi@studypilot.lv">jautajumi@studypilot.lv</a> no sava konta e-pasta.
        </div>
      )}
      {msg ? (
        <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{msg}</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="email">E-pasts</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
          <Button type="submit" disabled={busy || !config.email} className="w-full py-3">{busy ? 'Sūta…' : 'Nosūtīt saiti'}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
