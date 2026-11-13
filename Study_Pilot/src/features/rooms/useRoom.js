import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../lib/AppContext';

// Istabas stāvoklis ar aptauju (polling): ik pēc 3 s, fonā 15 s, pie 429 15 s, pie 401/404 pārtrauc.
// Izmanto: features/rooms/RoomView.js.
export function useRoom(code) {
  const { api } = useApp();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null); // { status, message } — 404/401 pārtrauc aptauju
  const offset = useRef(0); // servera laika nobīde pret šīs ierīces pulksteni
  const seq = useRef(0);
  const applied = useRef(0);
  const timer = useRef(null);
  const stopped = useRef(false);
  const slow = useRef(false);

  const load = useCallback(async () => {
    const my = ++seq.current;
    try {
      const r = await api(`/api/rooms/${code}`);
      if (my < applied.current) return; // vecāka atbilde, kas atnāca vēlāk par jaunāku
      applied.current = my;
      offset.current = r.now - Date.now();
      slow.current = false;
      setState(r);
      setError(null);
    } catch (e) {
      if (e.status === 404 || e.status === 401) { stopped.current = true; setError({ status: e.status, message: e.message }); }
      else if (e.status === 429) slow.current = true;
      else setError({ status: e.status || 0, message: e.message });
    }
  }, [api, code]);

  useEffect(() => {
    if (!code) return undefined;
    stopped.current = false;
    let alive = true;
    const loop = async () => {
      await load();
      if (!alive || stopped.current) return;
      const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      timer.current = setTimeout(loop, hidden || slow.current ? 15000 : 3000);
    };
    loop();
    const onVisible = () => { if (document.visibilityState === 'visible' && !stopped.current) { clearTimeout(timer.current); loop(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive = false; clearTimeout(timer.current); document.removeEventListener('visibilitychange', onVisible); };
  }, [code, load]);

  // Darbība serverī + tūlītēja atsvaidzināšana
  const act = useCallback(async (path, method, body) => {
    try {
      return await api(`/api/rooms/${code}${path}`, { method, body });
    } finally {
      load();
    }
  }, [api, code, load]);

  const now = useCallback(() => Date.now() + offset.current, []);
  return { state, error, refresh: load, act, now };
}

// Atjaunojas katru sekundi (taimera attēlošanai)
export function useTick(active = true) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => set((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}
