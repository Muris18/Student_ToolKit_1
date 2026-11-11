import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Landing from '../components/Landing';
import { useApp } from '../lib/AppContext';

// Sākumlapa. Apmeklētājiem bez konta tā ir reklāmas lapa; pieslēgtam lietotājam uzreiz atveras panelis.
// Servera HTML vienmēr satur sākumlapu (meklētājprogrammām un koplietotām saitēm); pieslēgtam lietotājam to līdz pārvirzīšanai
// paslēpj CSS pēc data-auth (iestata _document.js, ja pārlūkā ir sesija), lai nebūtu "zibsņa".
// Info lapa pieslēgtiem lietotājiem: /par.
export default function Home() {
  const { status } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (status === 'ready') router.replace('/dashboard');
    // Sesija nederīga vai nav -> parāda sākumlapu (data-auth tika iestatīts tikai pēc pārlūkā atrastas sesijas)
    if (status === 'guest') document.documentElement.removeAttribute('data-auth');
  }, [status, router]);
  return <Landing home />;
}
