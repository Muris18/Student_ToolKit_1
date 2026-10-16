import React from 'react';

export default function Card({ children, title, subtitle, action, className = '' }) {
  return (
    <div className={`card-fx bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-soft p-6 transition-all duration-300 hover:border-indigo-300 hover:-translate-y-0.5 ${className}`}>
      {(title || action) && (
        <div className="relative z-[1] flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
