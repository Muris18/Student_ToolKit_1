import React from 'react';
import Link from 'next/link';

export default function ServerError() {
  return (
    <main className="np flex-1 flex flex-col items-center justify-center text-center py-24">
      <span className="np-kicker">500</span>
      <h1 className="np-h2">Kaut kas nogāja greizi.</h1>
      <p className="np-sub">Mēs par to jau zinām. Pamēģini pēc brīža vēlreiz.</p>
      <div className="np-cta"><Link href="/" className="np-btn np-btn-gold">Uz sākumlapu</Link></div>
    </main>
  );
}
