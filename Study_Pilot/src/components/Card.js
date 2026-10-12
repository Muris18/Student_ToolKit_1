import React from 'react';

export default function Card({ 
  children, 
  title, 
  subtitle, 
  action, 
  className = '' 
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all hover:shadow-md ${className}`}>
      {/* Kartītes virsraksta un papildu darbības (action) sadaļa, ja tādas ir */}
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Kartītes galvenais saturs */}
      <div>
        {children}
      </div>
    </div>
  );
}