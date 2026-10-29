import React from 'react';
import Link from 'next/link';

// Kopīgs izkārtojums juridiskajiem tekstiem (/privacy, /terms). Teksts nāk no content/*.md.
export default function LegalPage({ html, draft }) {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 px-4 py-10">
        <article className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-10">
          {draft && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              Melnraksts — daļa informācijas vēl tiek precizēta.
            </div>
          )}
          <div className="policy" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
      <footer className="max-w-6xl mx-auto w-full p-6 text-xs text-slate-400 flex flex-wrap justify-center gap-4">
        <Link href="/" className="hover:text-accent transition-colors">← Uz sākumlapu</Link>
        <Link href="/privacy" className="hover:text-accent transition-colors">Privātuma politika</Link>
        <Link href="/terms" className="hover:text-accent transition-colors">Lietošanas noteikumi</Link>
      </footer>
    </div>
  );
}
