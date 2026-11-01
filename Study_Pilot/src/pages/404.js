import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="np flex-1 flex flex-col items-center justify-center text-center py-24">
      <span className="np-kicker">404</span>
      <h1 className="np-h2">Šī lapa nav atrasta.</h1>
      <p className="np-sub">Varbūt saite ir novecojusi. Dodamies atpakaļ uz drošu vietu.</p>
      <div className="np-cta"><Link href="/" className="np-btn np-btn-gold">Uz sākumlapu</Link></div>
    </main>
  );
}
