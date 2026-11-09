import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AppShell, { PageHeader } from '../components/AppShell';
import Card from '../components/Card';
import Button from '../components/Button';
import { useApp } from '../lib/AppContext';
import { premiumFeatures, FREE_LIMITS, isPremium } from '../lib/plans';
import { fmtDate } from '../lib/helpers';

function Premium() {
  const { user, config, api, refreshUser } = useApp();
  const router = useRouter();
  const [adult, setAdult] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const status = router.query.status;

  // Pēc atgriešanās no Stripe: webhook var pienākt pēc dažām sekundēm, tāpēc pārbaudām vairākas reizes
  useEffect(() => {
    if (status !== 'success') return undefined;
    let n = 0;
    const t = setInterval(async () => {
      n += 1;
      const u = await refreshUser().catch(() => null);
      if (u?.plan === 'premium' || n > 10) clearInterval(t);
    }, 2000);
    return () => clearInterval(t);
  }, [status, refreshUser]);

  const buy = async () => {
    setError('');
    setBusy(true);
    try {
      const r = await api('/api/billing/checkout', { method: 'POST', body: { adult, waiver } });
      window.location.href = r.url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const portal = async () => {
    setError('');
    try {
      const r = await api('/api/billing/portal', { method: 'POST' });
      window.location.href = r.url;
    } catch (e) {
      setError(e.message);
    }
  };

  const premium = isPremium(user);

  return (
    <>
      <PageHeader title="Premium" subtitle="Vairāk AI jautājumu un testu pēc kļūdām, neierobežoti savi uzdevumi." />

      {status === 'success' && !premium && (
        <div role="status" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">Paldies! Maksājums saņemts — Premium aktivizējas dažu sekunžu laikā.</div>
      )}
      {status === 'cancel' && (
        <div role="status" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm">Maksājums netika pabeigts. Nauda netika noņemta.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title={premium ? 'Tev ir Premium ✦' : 'Premium'} subtitle={config.premiumPrice || 'Cenu redzēsi maksājuma lapā pirms apmaksas'}>
          <ul className="space-y-2.5 text-sm text-slate-600">
            {premiumFeatures(config).map((f) => <li key={f} className="flex gap-2"><span className="text-accent font-bold">✓</span>{f}</li>)}
          </ul>

          {premium ? (
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              {user.planSource === 'admin' && <p>Premium tev piešķīra administrators.</p>}
              {user.planSource === 'stripe' && user.premiumUntil && <p>Nākamais maksājums vai beigu datums: <strong>{fmtDate(user.premiumUntil.slice(0, 10))}</strong>.</p>}
              {user.hasBilling && <Button variant="secondary" onClick={portal}>Pārvaldīt abonementu un rēķinus</Button>}
            </div>
          ) : !config.payments ? (
            <p className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">Maksājumi vēl nav ieslēgti. Drīzumā!</p>
          ) : (
            <div className="mt-6 space-y-3">
              <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600" />
                <span>Man ir vismaz 18 gadi, vai mans vecāks / likumiskais pārstāvis piekrīt šim pirkumam.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0 accent-indigo-600" />
                <span>
                  Vēlos, lai Premium sāk darboties uzreiz, un saprotu, ka tādēļ zaudēju 14 dienu atteikuma tiesības par jau sākto periodu.
                  Abonementu varu atcelt jebkurā brīdī (<Link href="/terms" target="_blank" className="text-accent underline">noteikumi</Link>).
                </span>
              </label>
              {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
              <Button onClick={buy} disabled={busy || !adult || !waiver} className="w-full py-3">{busy ? 'Atver maksājumu lapu…' : 'Turpināt uz drošu maksājumu'}</Button>
              <p className="text-[11px] text-slate-400 text-center">Maksājumu apstrādā Stripe. Kartes dati Study Pilot serverī netiek glabāti.</p>
            </div>
          )}
          {premium && error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </Card>

        <Card title="Bezmaksas plāns" subtitle="Vienmēr bez maksas">
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-slate-400">•</span>{config.aiLimitFree} AI skolotāja jautājumi dienā</li>
            <li className="flex gap-2"><span className="text-slate-400">•</span>Valsts eksāmenu uzdevumi ar atbilžu pārbaudi</li>
            <li className="flex gap-2"><span className="text-slate-400">•</span>Plānotājs, termiņu radars, fokusa režīms un progress</li>
            <li className="flex gap-2"><span className="text-slate-400">•</span>Līdz {FREE_LIMITS.exercises} saviem uzdevumiem</li>
          </ul>
          <p className="text-xs text-slate-400 mt-5">Ja Premium beidzas, tavi testi un uzdevumi paliek — vienkārši nevarēsi pievienot jaunus virs bezmaksas limita.</p>
        </Card>
      </div>
    </>
  );
}

export default function PremiumPage() {
  return (
    <AppShell>
      <Premium />
    </AppShell>
  );
}
