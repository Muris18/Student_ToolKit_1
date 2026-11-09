import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import { gradeLabel } from '../lib/helpers';
import Icon from './Icon';

export const menuItems = [
  { name: 'Vadības panelis', href: '/dashboard', icon: 'dashboard' },
  { name: 'Fokusa režīms', href: '/focus', icon: 'bolt' },
  { name: 'Plānotājs un termiņi', href: '/planner', icon: 'calendar' },
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
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden desktop:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="px-6 pt-6 pb-2">
        <span className="text-xs font-semibold text-slate-400">Izvēlne</span>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150 ${
                isActive(item.href) ? 'sidebar-item-active' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
              <span className="nav-label">{item.name}</span>
            </Link>
            {item.children && (
              <div className="ml-6 mt-1 mb-1 pl-3 border-l border-slate-200 space-y-0.5">
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[13px] transition-colors duration-150 ${
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
