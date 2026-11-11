import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useApp } from './AppContext';
import { secondsLeft } from './designHelpers';

// Fokusa taimeris visai lietotnei: turpina skaitīt, kad lietotājs pāriet uz citu lapu vai pārlādē lapu.
// Stāvoklis glabājas pārlūkā (localStorage 'sp-focus') kā beigu laiks, tāpēc laiks pareizs arī pēc aizvēršanas.
// Nav skaņas, uznirstošo logu un pārlūka paziņojumu: pabeigts taimeris tikai klusi parādās augšējā joslā.

const KEY = 'sp-focus';
const FocusContext = createContext(null);
export const FOCUS_DURATIONS = [15, 25, 45];

const fresh = (duration = 25) => ({ duration, pausedLeft: duration * 60, deadline: null, taskId: '', done: false });

function load(userId) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || s.userId !== userId || !FOCUS_DURATIONS.includes(s.duration)) return null;
    return {
      duration: s.duration,
      pausedLeft: Number.isFinite(s.pausedLeft) ? Math.min(Math.max(0, s.pausedLeft), s.duration * 60) : s.duration * 60,
      deadline: Number.isFinite(s.deadline) ? s.deadline : null,
      taskId: typeof s.taskId === 'string' ? s.taskId : '',
      done: Boolean(s.done),
    };
  } catch (e) {
    return null;
  }
}

export function FocusProvider({ children }) {
  const { user, data, update } = useApp();
  const [st, setSt] = useState(fresh());
  const [loadedFor, setLoadedFor] = useState(null); // lietotāja id, kuram stāvoklis ielādēts
  const [, tick] = useReducer((x) => x + 1, 0);
  const updateRef = useRef(update);
  updateRef.current = update;
  const userId = user?.id || null;
  const ready = Boolean(userId && data);

  // Ielādē saglabāto stāvokli (kad lietotājs un dati gatavi). Ja laiks beidzies, kamēr lapa bija aizvērta, to ieskaita.
  useEffect(() => {
    if (!userId) { setSt(fresh()); setLoadedFor(null); return; }
    if (!ready || loadedFor === userId) return;
    const saved = load(userId);
    if (saved && saved.deadline && saved.deadline <= Date.now()) {
      setSt({ ...saved, deadline: null, pausedLeft: 0, done: true });
      updateRef.current((d) => ({ ...d })); // ieskaita mācību aktivitātē
    } else if (saved) {
      setSt(saved);
    }
    setLoadedFor(userId);
  }, [userId, ready, loadedFor]);

  // Saglabā pārlūkā
  useEffect(() => {
    if (!userId || loadedFor !== userId) return;
    try { localStorage.setItem(KEY, JSON.stringify({ userId, ...st })); } catch (e) {}
  }, [st, userId, loadedFor]);

  // Skaita, kamēr taimeris iet; pabeidzot klusi ieskaita aktivitāti (tikai vienreiz)
  useEffect(() => {
    if (!st.deadline) return undefined;
    const id = setInterval(() => {
      if (secondsLeft(st.deadline) > 0) { tick(); return; }
      clearInterval(id);
      setSt((s) => (s.deadline === st.deadline ? { ...s, deadline: null, pausedLeft: 0, done: true } : s));
      updateRef.current((d) => ({ ...d }));
    }, 500);
    return () => clearInterval(id);
  }, [st.deadline]);

  const running = Boolean(st.deadline);
  const remaining = running ? secondsLeft(st.deadline) : st.pausedLeft;

  const start = useCallback(() => setSt((s) => {
    const left = s.pausedLeft > 0 ? s.pausedLeft : s.duration * 60;
    return { ...s, deadline: Date.now() + left * 1000, pausedLeft: left, done: false };
  }), []);
  const pause = useCallback(() => setSt((s) => (s.deadline ? { ...s, pausedLeft: secondsLeft(s.deadline), deadline: null } : s)), []);
  const reset = useCallback(() => setSt((s) => ({ ...s, deadline: null, pausedLeft: s.duration * 60, done: false })), []);
  const setDuration = useCallback((m) => setSt((s) => (s.deadline || !FOCUS_DURATIONS.includes(m) ? s : { ...s, duration: m, pausedLeft: m * 60, done: false })), []);
  const setTaskId = useCallback((id) => setSt((s) => ({ ...s, taskId: id || '' })), []);

  return (
    <FocusContext.Provider value={{ duration: st.duration, remaining, running, done: st.done, taskId: st.taskId, start, pause, reset, setDuration, setTaskId }}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => useContext(FocusContext);
