import React, { useEffect, useState } from 'react';

export const THEMES = [
  { id: 'paper', label: 'Gaišs' },
  { id: 'ink', label: 'Tumšs' },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('paper');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'paper');
  }, []);

  const apply = (id) => {
    setTheme(id);
    const r = document.documentElement;
    r.classList.add('theme-anim');
    setTimeout(() => r.classList.remove('theme-anim'), 400);
    r.dataset.theme = id;
    try { localStorage.setItem('sp-theme', id); } catch (e) {}
  };

  return (
    <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200" role="group" aria-label="Tēma">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={theme === t.id}
          onClick={() => apply(t.id)}
          className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            theme === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
