import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function DeadlineRadar({ deadlines = [], onViewPlanner }) {
  // Parauga dati terminu radaram, ja nav padoti citi dati
  const defaultRadarItems = [
    { 
      id: 1, 
      title: 'Matemātikas valsts eksāmens (12. klase)', 
      daysLeft: 3, 
      date: '2026-06-05', 
      urgency: 'critical', // critical, warning, safe
      subject: 'Matemātika' 
    },
    { 
      id: 2, 
      title: 'Latviešu valodas eksāmens (rakstu daļa)', 
      daysLeft: 10, 
      date: '2026-06-12', 
      urgency: 'warning', 
      subject: 'Latviešu valoda' 
    },
    { 
      id: 3, 
      title: 'Angļu valodas eksāmens (klausīšanās/mutvārdu)', 
      daysLeft: 17, 
      date: '2026-06-19', 
      urgency: 'safe', 
      subject: 'Angļu valoda' 
    },
  ];

  const items = deadlines.length > 0 ? deadlines : defaultRadarItems;

  // Stili un krāsas atkarībā no steidzamības
  const urgencyConfig = {
    critical: {
      badge: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse',
      bar: 'bg-rose-600',
      label: 'Kritiski tuvu!'
    },
    warning: {
      badge: 'bg-amber-50 text-amber-600 border-amber-200',
      bar: 'bg-amber-500',
      label: 'Drīz klāt'
    },
    safe: {
      badge: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      bar: 'bg-indigo-600',
      label: 'Ir laiks sagatavoties'
    }
  };

  return (
    <Card 
      title="📡 Termiņu radars" 
      subtitle="Laika atskaite līdz taviem valsts eksāmeniem"
      action={
        onViewPlanner && (
          <Button variant="secondary" onClick={onViewPlanner} className="text-xs py-1.5 px-3">
            Atvērt pilnu plānotāju
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {items.map((item) => {
          const config = urgencyConfig[item.urgency] || urgencyConfig.safe;
          
          return (
            <div 
              key={item.id} 
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.subject}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Datums: {item.date}</span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm md:text-base">{item.title}</h4>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-800 block leading-tight">{item.daysLeft} dienas</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">atlikušas</span>
                </div>

                <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${config.badge}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}