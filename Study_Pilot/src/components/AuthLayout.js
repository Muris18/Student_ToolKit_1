import React from 'react';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <header className="max-w-6xl mx-auto w-full p-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold shadow-glow">SP</div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">Study Pilot</span>
        </Link>
        <ThemeSwitcher />
      </header>
      <div className="flex-1 flex items-start sm:items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-soft p-6 sm:p-8 animate-pop">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 pt-5 border-t border-slate-100 text-sm text-slate-500 text-center">{footer}</div>}
          <p className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privātuma politika</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Lietošanas noteikumi</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
