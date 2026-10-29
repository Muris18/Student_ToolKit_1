import React from 'react';
import Link from 'next/link';

// Vienots logotips + nosaukums: vienāds izmērs un stils visās lapās
export default function Brand({ href = '/dashboard', className = '' }) {
  return (
    <Link href={href} className={`flex items-center gap-3 shrink-0 ${className}`} aria-label="Study Pilot">
      <span className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-semibold text-sm leading-none">SP</span>
      <span className="font-display font-semibold text-slate-900 text-xl leading-none whitespace-nowrap">Study Pilot</span>
    </Link>
  );
}
