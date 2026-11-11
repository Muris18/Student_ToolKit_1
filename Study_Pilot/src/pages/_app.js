import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import 'katex/dist/katex.min.css';
import '../styles/globals.css';
import Head from 'next/head';
import { Instrument_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { applyDevice } from '../lib/device';
import { AppProvider } from '../lib/AppContext';
import { FocusProvider } from '../lib/FocusContext';
import Navbar from '../components/Navbar';
import CompletionFeedback from '../components/CompletionFeedback';
import Sidebar from '../components/Sidebar';

// Fonti tiek lejupielādēti build laikā un piegādāti no šī servera (pārlūks Google neaicina)
const sans = Instrument_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({ subsets: ['latin', 'latin-ext'], weight: ['500', '600'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], weight: ['500', '700', '800'], variable: '--font-mono', display: 'swap' });

// Lapas bez kopīgā rāmja (navigācijas)
const NO_CHROME = ['/', '/par', '/login', '/register', '/privacy', '/terms', '/focus', '/forgot', '/reset', '/verify', '/404', '/500'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    document.documentElement.classList.add(sans.variable, display.variable, mono.variable);
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
      <FocusProvider>
      <Head><title>Study Pilot — AI skolotājs eksāmeniem</title></Head>
      <CompletionFeedback />
      <div className={`min-h-screen flex flex-col ${sans.variable} ${display.variable} ${mono.variable}`} style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}>
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
      </FocusProvider>
    </AppProvider>
  );
}
