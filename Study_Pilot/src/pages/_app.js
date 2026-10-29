import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { applyDevice } from '../lib/device';
import { AppProvider } from '../lib/AppContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Lapas bez kopīgā rāmja (navigācijas)
const NO_CHROME = ['/', '/login', '/register'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(() => {
    applyDevice();
    window.addEventListener('resize', applyDevice);
    window.addEventListener('orientationchange', applyDevice);
    return () => {
      window.removeEventListener('resize', applyDevice);
      window.removeEventListener('orientationchange', applyDevice);
    };
  }, []);

  const page = <Component {...pageProps} />;
  return (
    <AppProvider>
      {NO_CHROME.includes(router.pathname) ? page : (
        <div className="min-h-screen bg-page flex flex-col">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 min-w-0">{page}</div>
          </div>
        </div>
      )}
    </AppProvider>
  );
}
