import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useApp } from '../lib/AppContext';

// Kopīgais izkārtojums visām lapām, kurām vajag pieslēgtu lietotāju
export default function AppShell({ children, className = 'max-w-6xl' }) {
  const { status } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [status, router]);

  if (status !== 'ready') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" /> Ielādē…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 p-4 sm:p-8 space-y-6 w-full min-w-0 mx-auto ${className}`}>{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon = '✨', title, text, children }) {
  return (
    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      {text && <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">{text}</p>}
      {children && <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors';
export const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5';
