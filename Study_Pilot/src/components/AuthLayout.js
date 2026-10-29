import React from 'react';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import Brand from './Brand';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <header className="w-full h-16 px-4 md:px-6 flex items-center justify-between gap-4 border-b border-slate-200 bg-white">
        <Brand href="/" />
        <ThemeSwitcher />
      </header>
      <div className="flex-1 flex items-start sm:items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-soft p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 pt-5 border-t border-slate-100 text-sm text-slate-500 text-center">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
