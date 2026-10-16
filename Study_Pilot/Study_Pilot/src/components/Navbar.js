import React from 'react';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import Button from './Button';
import { menuItems, useIsActive } from './Sidebar';
import { useApp } from '../lib/AppContext';
import { gradeLabel } from '../lib/helpers';

const tabs = ['/dashboard', '/planner', '/exams', '/exams?mode=ai', '/progress'];
const short = { '/dashboard': 'Panelis', '/planner': 'Plānotājs', '/exams': 'Eksāmeni', '/exams?mode=ai': 'AI čats', '/progress': 'Progress' };

export default function Navbar() {
  const { user, logout } = useApp();
  const isActive = useIsActive();
  const p = user?.profile;
  const name = p ? `${p.firstName} ${p.lastName}`.trim() : '';
  const initials = (name || 'SP').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-100">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold shadow-glow group-hover:rotate-6 transition-transform">SP</div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight hidden sm:block">Study Pilot</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {user && (
            <Link href="/profile" className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity" title="Profils">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{initials}</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{name}</p>
                <p className="text-[11px] text-slate-400">{gradeLabel(p)}{p?.school ? ` · ${p.school}` : ''}</p>
              </div>
            </Link>
          )}
          <Button variant="secondary" onClick={logout} className="text-xs py-2 px-3">Iziet</Button>
        </div>
      </div>
      {/* Mobilā apakšējā tab josla */}
      <nav className="hidden mobile:grid fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-100 grid grid-cols-5 px-2 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {menuItems.filter((i) => tabs.includes(i.href)).map((item) => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${isActive(item.href) ? 'text-accent' : 'text-slate-400'}`}>
            <span className={`text-xl w-11 h-7 flex items-center justify-center rounded-full transition-all ${isActive(item.href) ? 'bg-indigo-100' : ''}`}>{item.icon}</span>
            {short[item.href]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
