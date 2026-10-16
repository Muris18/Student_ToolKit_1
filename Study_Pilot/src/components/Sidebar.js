import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';
import { gradeLabel } from '../lib/helpers';

export const menuItems = [
  { name: 'Vadības panelis', href: '/dashboard', icon: '📊' },
  { name: 'Plānotājs un termiņi', href: '/planner', icon: '⏳' },
  { name: 'Eksāmenu sagatavošanās', href: '/exams', icon: '📚' },
  { name: 'Testa režīms', href: '/exams?mode=quiz', icon: '⚡' },
  { name: 'AI Mācību palīgs', href: '/exams?mode=ai', icon: '🤖' },
  { name: 'Progress', href: '/progress', icon: '📈' },
  { name: 'Profils un priekšmeti', href: '/profile', icon: '👤' },
  { name: 'Administrēšana', href: '/admin', icon: '⚙️' },
];

export function useIsActive() {
  const { pathname, query } = useRouter();
  return (href) => {
    const [path, qs] = href.split('?');
    const mode = qs ? qs.split('=')[1] : null;
    if (path !== pathname) return false;
    if (path !== '/exams') return true;
    const cur = query.mode === 'quiz' || query.mode === 'ai' ? query.mode : null;
    return cur === mode;
  };
}

export default function Sidebar() {
  const isActive = useIsActive();
  const { user, data } = useApp();
  return (
    <aside className="w-64 shrink-0 bg-white/60 backdrop-blur border-r border-slate-100 hidden desktop:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="px-6 pt-6 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Navigācija</span>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
              isActive(item.href) ? 'sidebar-item-active' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      {user && (
        <Link href="/profile" className="p-4 m-4 rounded-2xl bg-indigo-50 border border-indigo-100 hover:border-indigo-300 transition-colors">
          <p className="text-xs font-bold text-indigo-700">{gradeLabel(user.profile)}{user.profile.school ? ` · ${user.profile.school}` : ''}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {data?.subjects.length ? `${data.subjects.length} priekšmeti` : 'Pievieno savus priekšmetus →'}
          </p>
        </Link>
      )}
    </aside>
  );
}
