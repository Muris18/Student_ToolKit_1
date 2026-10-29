import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../lib/AppContext';

// Kopīgais izkārtojums visām lapām, kurām vajag pieslēgtu lietotāju
// Pārbauda pieteikšanos un ieliek lapas saturu. Navbar un Sidebar ir _app.js, tāpēc starp lapām nemirgo.
export default function AppShell({ children }) {
  const { status } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [status, router]);

  return (
    <main className="p-4 sm:p-8 space-y-6 w-full min-w-0 max-w-6xl mx-auto">
      {status === 'ready' ? children : (
        <div className="flex items-center gap-3 text-sm text-slate-400 py-10">
          <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" /> Ielādē…
        </div>
      )}
      {status === 'ready' && (
        <footer className="pt-6 flex justify-center gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-accent transition-colors">Privātuma politika</Link>
          <Link href="/terms" className="hover:text-accent transition-colors">Lietošanas noteikumi</Link>
        </footer>
      )}
    </main>
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
