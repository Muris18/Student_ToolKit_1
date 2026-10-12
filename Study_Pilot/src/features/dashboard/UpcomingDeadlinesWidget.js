import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function UpcomingDeadlinesWidget({ deadlines = [], onViewAll }) {
  // Noklusētie paraugdati, ja dati vēl nav saņemti no Supabase vai plānotāja
  const defaultDeadlines = [
    { 
      id: 1, 
      title: 'Matemātikas valsts pārbaudes darbs', 
      subject: 'Matemātika', 
      date: 'Pēc 3 dienām', 
      priority: 'urgent', // urgent, normal, low
      type: 'Eksāmens' 
    },
    { 
      id: 2, 
      title: 'Latviešu valodas eseju sagatavošana', 
      subject: 'Latviešu valoda', 
      date: 'Pēc 5 dienām', 
      priority: 'normal', 
      type: 'Mājasdarbs' 
    },
    { 
      id: 3, 
      title: 'Angļu valodas klausīšanās tests', 
      subject: 'Angļu valoda', 
      date: 'Pēc 8 dienām', 
      priority: 'low', 
      type: 'Pārbaudes darbs' 
    },
  ];

  const displayDeadlines = deadlines.length > 0 ? deadlines : defaultDeadlines;

  // Stili atkarībā no prioritātes
  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-600 border-rose-100',
    normal: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const priorityLabels = {
    urgent: 'Steidzami',
    normal: 'Plānā',
    low: 'Gaidāms',
  };

  return (
    <Card 
      title="⏳ Tuvākie termiņi" 
      subtitle="Nākamās dienas un eksāmeni"
      action={
        onViewAll && (
          <Button variant="secondary" onClick={onViewAll} className="text-xs py-1.5 px-3">
            Visi termiņi
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {displayDeadlines.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{item.subject}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{item.type}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-500">{item.date}</p>
            </div>

            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${priorityStyles[item.priority] || priorityStyles.normal}`}>
              {priorityLabels[item.priority] || 'Aktīvs'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}