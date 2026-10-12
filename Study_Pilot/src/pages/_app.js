import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import SplashScreen from '../components/SplashScreen';
import { applyDevice } from '../lib/device';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    applyDevice();
    window.addEventListener('resize', applyDevice);
    window.addEventListener('orientationchange', applyDevice);
    const move = (e) => {
      const c = e.target.closest && e.target.closest('.card-fx');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', applyDevice);
      window.removeEventListener('orientationchange', applyDevice);
    };
  }, []);

  return (
    <>
      <SplashScreen />
      <div className="orb orb-a" /><div className="orb orb-b" />
      <div key={router.asPath} className="page-enter"><Component {...pageProps} /></div>
    </>
  );
}
