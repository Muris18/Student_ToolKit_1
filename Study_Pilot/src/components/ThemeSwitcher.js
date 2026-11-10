import React, { useEffect, useState } from 'react';

// Divas tēmas: Nakts (noklusētā) un Gaišs. Uzrakstu vietā ikonas; nosaukums ir aria-label un title (rāda, uzvedot ar peli).
const Moon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const THEMES = [
  { id: 'night', label: 'Nakts tēma', Icon: Moon },
  { id: 'paper', label: 'Gaišā tēma', Icon: Sun },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('night');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'paper' ? 'paper' : 'night');
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
    <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-slate-100 border border-slate-200" role="group" aria-label="Tēma">
      {THEMES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={theme === id}
          aria-label={label}
          title={label}
          onClick={() => apply(id)}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors ${
            theme === id ? 'bg-white text-accent shadow-xs' : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
