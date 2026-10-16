import React from 'react';

export default function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = {
    primary: 'btn-shine bg-gradient-to-br from-accent to-accent2 text-white shadow-glow hover:brightness-110 hover:-translate-y-0.5',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:-translate-y-0.5',
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
