import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeSwitcher from './ThemeSwitcher';
import FocusPill from './FocusPill';
import Button from './Button';
import Icon from './Icon';
import Brand from './Brand';
import { flatMenu, useIsActive } from './Sidebar';
import { useApp } from '../lib/AppContext';
import { gradeLabel } from '../lib/helpers';
import AiUsageBar from './AiUsageBar';

// Apakšējā josla: 5 galvenās sadaļas + "Vairāk" (visa pārējā izvēlne, kā datora sānjoslā)
const tabs = ['/dashboard', '/planner', '/parbaudes', '/exams', '/exams?mode=ai'];
const short = { '/dashboard': 'Panelis', '/planner': 'Plānotājs', '/parbaudes': 'Darbi', '/exams': 'Eksāmeni', '/exams?mode=ai': 'AI čats' };
// "Valsts eksāmeni" jau ir cilne "Eksāmeni"
const skipInMore = ['/exams?mode=official'];

// app=true: lietotnes lapas (ar sānjoslu). app=false: sākumlapa un pieteikšanās — logo tajā pašā vietā.
export default function Navbar({ app = true }) {
  const { user, logout } = useApp();
  const router = useRouter();
  const { pathname } = router;
  const isActive = useIsActive();
  const p = user?.profile;
  const name = p ? `${p.firstName} ${p.lastName}`.trim() : '';
  const initials = (name || 'SP').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();

  // "Vairāk": viss, kas datorā ir sānjoslā, bet nav apakšējās joslas cilnēs (Fokuss, Istabas, Testa režīms, Progress, Profils, Premium, Admin)
  const [more, setMore] = useState(false);
  useEffect(() => { setMore(false); }, [router.asPath]);
  useEffect(() => {
    if (!more) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMore(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [more]);
  const moreItems = flatMenu.filter((i) => !tabs.includes(i.href) && !skipInMore.includes(i.href) && (i.href !== '/admin' || user?.role === 'admin'));
  const moreActive = moreItems.some((i) => isActive(i.href));

  return (
    <>
    <header className="sticky top-0 z-40 glass border-b border-slate-200">
      <div className="h-16 flex items-stretch">
        <div className={`flex items-center px-4 md:px-6 ${app ? 'desktop:w-64 desktop:shrink-0 desktop:border-r desktop:border-slate-200' : ''}`}>
          <Brand href={app ? '/dashboard' : '/'} />
        </div>
        <div className="flex-1 min-w-0 px-4 md:px-8 flex items-center justify-end gap-3">
          <FocusPill />
          <ThemeSwitcher />
          {user && pathname === '/' && <Button variant="secondary" onClick={() => router.push('/dashboard')} className="hidden sm:flex text-xs py-2 px-3">Mans panelis</Button>}
          {!user && pathname !== '/login' && pathname !== '/register' && <Button variant="secondary" onClick={() => router.push('/login')} className="text-xs py-2 px-3">Pieslēgties</Button>}
          {user && (
            <Link href="/profile" className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity" title="Profils">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-semibold">{initials}</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-[11px] text-slate-400">{gradeLabel(p)}{p?.school ? ` · ${p.school}` : ''}</p>
              </div>
            </Link>
          )}
          {user && <Button variant="secondary" onClick={logout} className="text-xs py-2 px-3">Iziet</Button>}
        </div>
      </div>
    </header>
    {/* Mobilā apakšējā tab josla. Ārpus <header>, jo header ir ar backdrop-filter (glass), kas fiksētu elementu "pieliek" headerim un josla nonāktu augšā */}
      <nav className={`${app ? 'hidden mobile:grid' : 'hidden'} fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-200 grid grid-cols-6 px-1 pt-2`} style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {flatMenu.filter((i) => tabs.includes(i.href)).map((item) => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${isActive(item.href) ? 'text-accent' : 'text-slate-400'}`}>
            <span className={`w-11 h-7 flex items-center justify-center rounded-full ${isActive(item.href) ? 'bg-indigo-50' : ''}`}><Icon name={item.icon} className="w-5 h-5" /></span>
            {short[item.href]}
          </Link>
        ))}
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} aria-haspopup="dialog" className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 cursor-pointer ${more || moreActive ? 'text-accent' : 'text-slate-400'}`}>
          <span className={`w-11 h-7 flex items-center justify-center rounded-full ${more || moreActive ? 'bg-indigo-50' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </span>
          Vairāk
        </button>
      </nav>
      {app && more && (
        <div className="mobile:block hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Visas sadaļas">
          <button type="button" aria-label="Aizvērt" onClick={() => setMore(false)} className="absolute inset-0 w-full h-full bg-black/50 cursor-default" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white px-4 pt-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-semibold shrink-0">{initials}</div>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-semibold text-slate-800 truncate">{name || 'Study Pilot'}</p>
                  {p && <p className="text-xs text-slate-500 truncate">{gradeLabel(p)}{p.school ? ` · ${p.school}` : ''}</p>}
                </div>
              </div>
              <button type="button" onClick={() => setMore(false)} aria-label="Aizvērt" className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-800 cursor-pointer text-lg">✕</button>
            </div>
            <nav className="grid grid-cols-1 gap-1">
              {moreItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium ${isActive(item.href) ? 'sidebar-item-active' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <Icon name={item.icon} className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <AiUsageBar className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>
      )}
    </>
  );
}
