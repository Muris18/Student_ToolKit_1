import React from 'react';
import Link from 'next/link'; // Ja izmanto Next.js lapu maršrutēšanu

export default function Sidebar({ currentPath }) {
  // Saraksts ar galvenajām izvēlnes sadaļām
  const menuItems = [
    { name: 'Vadības panelis', href: '/dashboard', icon: '📊' },
    { name: 'Termiņu radars', href: '/planner', icon: '⏳' },
    { name: 'Eksāmenu sagatavošanās', href: '/exams', icon: '📚' },
    { name: 'Testa režīms (Quiz)', href: '/exams?mode=quiz', icon: '⚡' },
    { name: 'AI Mācību palīgs', href: '/exams?mode=ai', icon: '🤖' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 hidden md:flex">
      
      {/* Augšējā daļa - Logo vai zīmols */}
      <div className="p-6 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigācija</span>
      </div>

      {/* Navigācijas saites */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Apakšējā daļa - Informācija vai palīdzība */}
      <div className="p-4 m-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/50">
        <p className="text-xs font-semibold text-indigo-900">12. & 9. klases eksāmeni</p>
        <p className="text-[11px] text-indigo-600 mt-0.5">Oficiālie materiāli & RAG palīgs</p>
      </div>

    </aside>
  );
}