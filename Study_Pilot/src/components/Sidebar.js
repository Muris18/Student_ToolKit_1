import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import { gradeLabel } from '../lib/helpers';
import Icon from './Icon';

export const menuItems = [
  { name: 'Vadības panelis', href: '/dashboard', icon: 'dashboard' },
  { name: 'Fokusa režīms', href: '/focus', icon: 'bolt' },
  { name: 'Plānotājs un termiņi', href: '/planner', icon: 'calendar' },
  { name: 'Pārbaudes darbi', href: '/parbaudes', icon: 'doc' },
  {
    name: 'Eksāmenu sagatavošanās', href: '/exams', icon: 'book',
    children: [
      { name: 'Valsts eksāmeni', href: '/exams?mode=official', icon: 'doc' },
      { name: 'Testa režīms', href: '/exams?mode=quiz', icon: 'bolt' },
      { name: 'AI mācību palīgs', href: '/exams?mode=ai', icon: 'chat' },
    ],
  },
  { name: 'Progress', href: '/progress', icon: 'chart' },
  { name: 'Profils un priekšmeti', href: '/profile', icon: 'user' },
  { name: 'Premium', href: '/premium', icon: 'star' },
  { name: 'Administrēšana', href: '/admin', icon: 'settings' },
];

// Visi punkti vienā sarakstā (arī apakšsadaļas) — mobilajai joslai
export const flatMenu = menuItems.flatMap((i) => [i, ...(i.children || [])]);

export function useIsActive() {
  const { pathname, query } = useRouter();
  return (href) => {
    const [path, qs] = href.split('?');
    const mode = qs ? qs.split('=')[1] : null;
    if (path !== pathname) return false;
    if (path !== '/exams') return true;
    const cur = ['quiz', 'ai', 'official'].includes(query.mode) ? query.mode : null;
    return cur === mode;
  };
}

export default function Sidebar() {
  const isActive = useIsActive();
  const { user, data } = useApp();
  // Administrēšanas saite redzama tikai adminam (servera pusē to aizsargā requireAdmin)
  const items = menuItems.filter((i) => i.href !== '/admin' || user?.role === 'admin');
  // Apakšsadaļu grupas var sakļaut; izvēle tiek atcerēta šajā pārlūkā
  const [closed, setClosed] = useState({});
  useEffect(() => {
    try { setClosed(JSON.parse(localStorage.getItem('sp-nav-closed') || '{}') || {}); } catch (e) {}
  }, []);
  const toggle = (href) => setClosed((c) => {
    const next = { ...c, [href]: !c[href] };
    try { localStorage.setItem('sp-nav-closed', JSON.stringify(next)); } catch (e) {}
    return next;
  });
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden desktop:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="px-6 pt-6 pb-2">
        <span className="sp-mono text-[10.5px] font-semibold text-slate-400">Izvēlne</span>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <div key={item.href}>
            <div className="relative">
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full font-medium text-sm transition-colors duration-150 ${item.children ? 'pr-10' : ''} ${
                  isActive(item.href) ? 'sidebar-item-active' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                <span className="nav-label">{item.name}</span>
              </Link>
              {item.children && (
                <button
                  type="button"
                  onClick={() => toggle(item.href)}
                  aria-expanded={!closed[item.href]}
                  aria-label={closed[item.href] ? `Rādīt ${item.name} apakšsadaļas` : `Paslēpt ${item.name} apakšsadaļas`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={`w-4 h-4 transition-transform duration-150 ${closed[item.href] ? '-rotate-90' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            {item.children && !closed[item.href] && (
              <div className="ml-6 mt-1 mb-1 pl-3 border-l border-slate-200 space-y-0.5">
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-full font-medium text-[13px] transition-colors duration-150 ${
                      isActive(c.href) ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon name={c.icon} className="w-4 h-4 shrink-0" />
                    <span className="nav-label">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      {user && (
        <Link href="/profile" className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
          <p className="text-xs font-semibold text-slate-800">{gradeLabel(user.profile)}{user.profile.school ? ` · ${user.profile.school}` : ''}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {data?.subjects.length ? `${data.subjects.length} priekšmeti` : 'Pievieno savus priekšmetus →'}
          </p>
        </Link>
      )}
    </aside>
  );
}
