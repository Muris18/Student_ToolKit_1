import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '../components/AuthLayout';
import { useApp } from '../lib/AppContext';

// E-pasta apstiprināšana pēc saites no e-pasta (/verify?token=...)
export default function VerifyPage() {
  const { api, status, refreshUser } = useApp();
  const router = useRouter();
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const sent = useRef(false);

  useEffect(() => {
    if (!router.isReady || sent.current) return;
    const token = typeof router.query.token === 'string' ? router.query.token : '';
    sent.current = true;
    api('/api/auth/verify', { method: 'POST', body: { token } })
      .then(() => setState('ok'))
      .catch((e) => { setError(e.message); setState('error'); });
  }, [router.isReady, router.query.token, api]);

  useEffect(() => {
    if (state === 'ok' && status === 'ready') refreshUser().catch(() => {});
  }, [state, status, refreshUser]);

  return (
    <AuthLayout title="E-pasta apstiprināšana">
      {state === 'loading' && <p className="text-sm text-slate-500">Apstiprina…</p>}
      {state === 'ok' && (
        <div className="space-y-4">
          <div role="status" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">Paldies! Tavs e-pasts ir apstiprināts.</div>
          <Link href={status === 'ready' ? '/dashboard' : '/login'} className="block text-center font-semibold text-accent hover:underline">{status === 'ready' ? 'Uz manu paneli →' : 'Pieslēgties →'}</Link>
        </div>
      )}
      {state === 'error' && (
        <div className="space-y-3">
          <p className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</p>
          <p className="text-sm text-slate-500">Pieslēdzies, un panelī varēsi pieprasīt jaunu apstiprinājuma e-pastu.</p>
        </div>
      )}
    </AuthLayout>
  );
}
