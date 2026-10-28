import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { todayStr } from './helpers';

// Klienta stāvoklis: kurš ir pieslēdzies + visi viņa dati.
// Dati glabājas PostgreSQL (src/server/db.js). Pārlūkā glabājam tikai sesijas žetonu.
const AppContext = createContext(null);
const TOKEN_KEY = 'sp-session';

const readSession = () => {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null'); } catch (e) { return null; }
};
const writeSession = (s) => {
  try { s ? localStorage.setItem(TOKEN_KEY, JSON.stringify(s)) : localStorage.removeItem(TOKEN_KEY); } catch (e) {}
};

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    keepalive: method === 'PUT',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || 'Servera kļūda');
    err.status = res.status;
    err.code = json.code;
    if (typeof json.remaining === 'number') err.remaining = json.remaining;
    throw err;
  }
  return json;
}

export function AppProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | guest | ready
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState(''); // piem. "serveris restartēts"
  const tokenRef = useRef(null);
  const saveTimer = useRef(null);
  const pending = useRef(null);

  const signOutLocal = useCallback((msg = '') => {
    tokenRef.current = null;
    writeSession(null);
    setUser(null);
    setData(null);
    setNotice(msg);
    setStatus('guest');
  }, []);

  // Sākumā: pārbaudām, vai saglabātā sesija vēl der šim servera palaišanas reizei
  useEffect(() => {
    const s = readSession();
    if (!s?.token) { setStatus('guest'); return; }
    call('/api/me', { token: s.token })
      .then((r) => {
        tokenRef.current = s.token;
        setUser(r.user);
        setData(r.data);
        setStatus('ready');
      })
      .catch((e) => {
        signOutLocal(e.status === 401 ? 'Sesija beigusies. Lūdzu, pieslēdzies vēlreiz.' : '');
      });
  }, [signOutLocal]);

  const flush = useCallback(() => {
    clearTimeout(saveTimer.current);
    if (!pending.current || !tokenRef.current) return;
    const body = { data: pending.current };
    pending.current = null;
    call('/api/me/data', { method: 'PUT', body, token: tokenRef.current }).catch((e) => {
      if (e.status === 401) signOutLocal('Sesija beigusies. Lūdzu, pieslēdzies vēlreiz.');
    });
  }, [signOutLocal]);

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('beforeunload', onHide);
    return () => window.removeEventListener('beforeunload', onHide);
  }, [flush]);

  // update((d) => ({ ...d, tasks: [...] })) — maina datus un saglabā serverī
  const update = useCallback((fn, { activity = true } = {}) => {
    setData((prev) => {
      if (!prev) return prev;
      let next = fn(prev);
      if (activity) {
        const t = todayStr();
        if (!next.activity.includes(t)) next = { ...next, activity: [...next.activity, t].slice(-120) };
      }
      pending.current = next;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flush, 350);
      return next;
    });
  }, [flush]);

  const startSession = (r) => {
    tokenRef.current = r.token;
    writeSession({ token: r.token, bootId: r.bootId });
    setUser(r.user);
    setData(r.data);
    setNotice('');
    setStatus('ready');
  };

  const register = async (payload) => startSession(await call('/api/auth/register', { method: 'POST', body: payload }));
  const login = async (email, password) => startSession(await call('/api/auth/login', { method: 'POST', body: { email, password } }));

  const logout = async () => {
    flush();
    try { await call('/api/auth/logout', { method: 'POST', token: tokenRef.current }); } catch (e) {}
    signOutLocal('');
  };

  const saveProfile = async (profile) => {
    const r = await call('/api/me', { method: 'PATCH', body: { profile }, token: tokenRef.current });
    setUser(r.user);
  };

  const deleteAccount = async () => {
    await call('/api/me', { method: 'DELETE', token: tokenRef.current });
    signOutLocal('Konts dzēsts.');
  };

  // AI piekrišana (datu nosūtīšana uz DeepSeek): true -> piekrīt, false -> atsauc
  const setAiConsent = async (given) => {
    const r = await call('/api/me/ai-consent', { method: given ? 'POST' : 'DELETE', token: tokenRef.current });
    setUser((u) => (u ? { ...u, aiConsentAt: r.aiConsentAt } : u));
  };

  // Lejupielādē visus lietotāja datus JSON failā
  const exportData = async () => {
    flush();
    const r = await call('/api/me/export', { token: tokenRef.current });
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-pilot-dati-${r.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const api = (path, opts = {}) => call(path, { ...opts, token: tokenRef.current });

  return (
    <AppContext.Provider value={{ status, user, data, notice, update, register, login, logout, saveProfile, deleteAccount, setAiConsent, exportData, api }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
