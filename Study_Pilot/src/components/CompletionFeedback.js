import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../lib/AppContext';
export default function CompletionFeedback() {
  const { data, user } = useApp();
  const previous = useRef(null), timer = useRef(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!data || !user) { previous.current = null; setNotice(null); clearTimeout(timer.current); return; }
    const items = [...data.tasks.map(t => ({ key: `task:${t.id}`, done: t.status === 'completed', title: t.title })), ...data.exercises.map(t => ({ key: `exercise:${t.id}`, done: !!t.completed, title: t.title }))];
    const old = previous.current;
    previous.current = { user: user.id, items: new Map(items.map(t => [t.key, t.done])) };
    if (!old || old.user !== user.id) return;
    const completed = items.find(t => t.done && old.items.get(t.key) === false);
    if (completed) { setNotice({ title: completed.title, key: Date.now() }); clearTimeout(timer.current); timer.current = setTimeout(() => setNotice(null), 3600); }
  }, [data, user]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div className="pilot-completion-host" role="status" aria-live="polite" aria-atomic="true">{notice && <div key={notice.key} className="pilot-completion"><span className="pilot-done-check" aria-hidden="true">✓</span><div><strong>Gatavs! Viens solis tuvāk.</strong><p>{notice.title}</p></div><button type="button" aria-label="Aizvērt paziņojumu" onClick={() => setNotice(null)}>×</button></div>}</div>;
}
