import React from 'react';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import Button from './Button';
import { menuItems, useIsActive } from './Sidebar';

const tabs = ['/dashboard', '/planner', '/exams', '/exams?mode=quiz', '/progress'];
const short = { '/dashboard': 'Panelis', '/planner': 'Radars', '/exams': 'Eksāmeni', '/exams?mode=quiz': 'Tests', '/progress': 'Progress' };

export default function Navbar({ user, onLogout }) {
  const isActive = useIsActive();
  const initials = (user?.name || 'SP').split(' ').map((p) => p[0]).slice(0, 2).join('');
  const logout = onLogout || (() => (window.location.href = '/'));

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-100">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold shadow-glow group-hover:rotate-6 transition-transform">SP</div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight hidden sm:block">Study Pilot</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {user && (
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{initials}</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.className}</p>
              </div>
            </div>
          )}
          <Button variant="secondary" onClick={logout} className="text-xs py-2 px-3">Iziet</Button>
        </div>
      </div>
      {/* iPhone apakšējā tab josla */}
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
