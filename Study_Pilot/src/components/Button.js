import React from 'react';

export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors duration-150 cursor-pointer select-none active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent2',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:brightness-110',
    success: 'bg-emerald-600 text-white hover:brightness-110',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
}
