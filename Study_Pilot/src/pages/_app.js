import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import 'katex/dist/katex.min.css';
import '../styles/globals.css';
import Head from 'next/head';
import { Instrument_Sans, Fraunces } from 'next/font/google';
import { applyDevice } from '../lib/device';
import { AppProvider } from '../lib/AppContext';
import Navbar from '../components/Navbar';
import CompletionFeedback from '../components/CompletionFeedback';
import Sidebar from '../components/Sidebar';

// Fonti tiek lejupielādēti build laikā un piegādāti no šī servera (pārlūks Google neaicina)
const sans = Instrument_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({ subsets: ['latin', 'latin-ext'], weight: ['500', '600'], variable: '--font-display', display: 'swap' });

// Lapas bez kopīgā rāmja (navigācijas)
const NO_CHROME = ['/', '/login', '/register', '/privacy', '/terms', '/focus', '/forgot', '/reset', '/verify', '/404', '/500'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    document.documentElement.classList.add(sans.variable, display.variable);
    applyDevice();
    window.addEventListener('resize', applyDevice);
    window.addEventListener('orientationchange', applyDevice);
    return () => {
      window.removeEventListener('resize', applyDevice);
      window.removeEventListener('orientationchange', applyDevice);
    };
  }, []);

  const chrome = !NO_CHROME.includes(router.pathname);
  return (
    <AppProvider>
      <Head><title>Study Pilot — AI skolotājs eksāmeniem</title></Head>
      <CompletionFeedback />
      <div className={`min-h-screen flex flex-col ${sans.variable} ${display.variable}`} style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>
        <Navbar app={chrome} />
        {chrome ? (
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 min-w-0"><Component {...pageProps} /></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col"><Component {...pageProps} /></div>
        )}
      </div>
    </AppProvider>
  );
}
