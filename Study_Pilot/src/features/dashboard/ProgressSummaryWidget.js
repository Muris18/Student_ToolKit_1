import React from 'react';
import Card from '../../components/Card';

export default function ProgressSummaryWidget({ subjects = [] }) {
  // Noklusētie paraugdati, ja dati no Supabase vēl nav saņemti
  const defaultSubjects = [
    { id: 'math', name: 'Matemātika', progress: 75, completed: 45, total: 60, color: 'bg-indigo-600' },
    { id: 'latvian', name: 'Latviešu valoda', progress: 60, completed: 30, total: 50, color: 'bg-violet-600' },
    { id: 'english', name: 'Angļu valoda', progress: 40, completed: 20, total: 50, color: 'bg-emerald-500' },
  ];

  const displaySubjects = subjects.length > 0 ? subjects : defaultSubjects;

  // Aprēķina kopējo vidējo progresu
  const totalCompleted = displaySubjects.reduce((acc, curr) => acc + curr.completed, 0);
  const totalTasks = displaySubjects.reduce((acc, curr) => acc + curr.total, 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <Card 
      title="📊 Mācību progress" 
      subtitle="Kopējais gatavības līmenis"
    >
      <div className="space-y-6">
        
        {/* Galvenais progresa radītājs */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
            {overallProgress}%
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Kopējā izpilde</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Atrisināti <span className="font-medium text-slate-700">{totalCompleted}</span> no <span className="font-medium text-slate-700">{totalTasks}</span> uzdevumiem
            </p>
          </div>
        </div>

        {/* Progresa joslas katram priekšmetam */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Priekšmeti</p>
          
          {displaySubjects.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{item.name}</span>
                <span className="text-slate-500 font-medium">{item.progress}% ({item.completed}/{item.total})</span>
              </div>
              
              {/* Progresa josla (Progress bar) */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-indigo-600'}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </Card>
  );
}