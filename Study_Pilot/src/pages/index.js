import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Landing from '../components/Landing';
import { useApp } from '../lib/AppContext';
import { landingDemoHtml } from '../lib/landingDemo';

// Sākumlapa. Apmeklētājiem bez konta tā ir reklāmas lapa; pieslēgtam lietotājam uzreiz atveras panelis.
// Servera HTML vienmēr satur sākumlapu (meklētājprogrammām un koplietotām saitēm); pieslēgtam lietotājam to līdz pārvirzīšanai
// paslēpj CSS pēc data-auth (iestata _document.js, ja pārlūkā ir sesija), lai nebūtu "zibsņa".
// Info lapa pieslēgtiem lietotājiem: /par.
// Priekšskatījuma formulas tiek pārvērstas HTML būvēšanas laikā (KaTeX paliek serverī)
export async function getStaticProps() {
  return { props: { demo: landingDemoHtml() } };
}

export default function Home({ demo }) {
  const { status } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (status === 'ready') router.replace('/dashboard');
    // Sesija nederīga vai nav -> parāda sākumlapu (data-auth tika iestatīts tikai pēc pārlūkā atrastas sesijas)
    if (status === 'guest') document.documentElement.removeAttribute('data-auth');
  }, [status, router]);
  return <Landing home demo={demo} />;
}
