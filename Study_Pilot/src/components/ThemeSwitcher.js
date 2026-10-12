import React, { useEffect, useState } from 'react';

export const THEMES = [
  { id: 'noir', label: 'Melns + sarkans', a: '#0b0b0d', b: '#e5192f' },
  { id: 'graphite', label: 'Tumši pelēks + violets', a: '#2b2b32', b: '#8b5cf6' },
  { id: 'snow-red', label: 'Balts + sarkans', a: '#ffffff', b: '#e61e37' },
  { id: 'snow-purple', label: 'Balts + violets', a: '#ffffff', b: '#7c3aed' },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('noir');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'noir');
  }, []);

  const apply = (id) => {
    setTheme(id);
    const r = document.documentElement;
    r.classList.add('theme-anim');
    setTimeout(() => r.classList.remove('theme-anim'), 700);
    document.documentElement.dataset.theme = id;
    try { localStorage.setItem('sp-theme', id); } catch (e) {}
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200" role="group" aria-label="Tēmas">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={t.label}
          aria-pressed={theme === t.id}
          onClick={() => apply(t.id)}
          style={{ background: `linear-gradient(135deg, ${t.a} 50%, ${t.b} 50%)` }}
          className={`w-6 h-6 rounded-full border border-slate-300 cursor-pointer transition-all hover:scale-110 ${
            theme === t.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-slate-100 scale-110' : ''
          }`}
        />
      ))}
    </div>
  );
}
