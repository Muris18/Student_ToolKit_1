import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { markdownToHtml, hasPlaceholders } from '../lib/markdown';

// Privātuma politika. Teksts: content/privacy.md (to pašu failu rāda arī GitHub).
// Lapa tiek ģenerēta build laikā; pēc teksta maiņas vajag jaunu build (serverī: docker compose up -d --build).
export async function getStaticProps() {
  const md = fs.readFileSync(path.join(process.cwd(), 'content', 'privacy.md'), 'utf8');
  return { props: { html: markdownToHtml(md), draft: hasPlaceholders(md) } };
}

export default function PrivacyPage({ html, draft }) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <header className="max-w-6xl mx-auto w-full p-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold shadow-glow">SP</div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">Study Pilot</span>
        </Link>
        <ThemeSwitcher />
      </header>
      <main className="flex-1 px-4 pb-16">
        <article className="max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-soft p-6 sm:p-10">
          {draft && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              Melnraksts — daļa informācijas vēl tiek precizēta.
            </div>
          )}
          <div className="policy" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
      <footer className="max-w-6xl mx-auto w-full p-6 text-xs text-slate-400 text-center">
        <Link href="/" className="hover:text-accent transition-colors">← Uz sākumlapu</Link>
      </footer>
    </div>
  );
}
