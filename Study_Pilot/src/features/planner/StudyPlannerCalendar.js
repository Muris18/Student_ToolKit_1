import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function StudyPlannerCalendar({ events = [], onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Parauga dati kalendāra notikumiem (eksāmeni, konsultācijas, mācību laiki)
  const defaultEvents = [
    { date: '2026-06-05', title: 'Matemātikas eksāmens', type: 'exam', subject: 'Matemātika' },
    { date: '2026-06-08', title: 'Latviešu valodas konsultācija', type: 'session', subject: 'Latviešu valoda' },
    { date: '2026-06-12', title: 'Latviešu valodas eksāmens', type: 'exam', subject: 'Latviešu valoda' },
    { date: '2026-06-19', title: 'Angļu valodas eksāmens', type: 'exam', subject: 'Angļu valoda' },
  ];

  const allEvents = events.length > 0 ? events : defaultEvents;

  // Kalendāra dienu aprēķins
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
    'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Pielāgo, lai pirmdiena ir 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Formatē datumu kā YYYY-MM-DD salīdzināšanai
  const formatDateString = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <Card 
      title="📅 Mācību kalendārs" 
      subtitle="Eksāmenu grafiks un plānotās mācību sesijas"
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={prevMonth} className="text-xs px-2.5 py-1">
            ◄
          </Button>
          <span className="text-sm font-semibold text-slate-800 min-w-[110px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button variant="secondary" onClick={nextMonth} className="text-xs px-2.5 py-1">
            ►
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        
        {/* Nedēļas dienu virsraksti */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider">
          <div>P</div>
          <div>O</div>
          <div>T</div>
          <div>C</div>
          <div>P</div>
          <div>S</div>
          <div>S</div>
        </div>

        {/* Kalendāra dienu tīkls */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Tukšās dienas pirms mēneša sākuma */}
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="h-20 bg-slate-50/30 rounded-xl border border-transparent" />
          ))}

          {/* Mēneša dienas */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1;
            const dateStr = formatDateString(dayNumber);
            const dayEvents = allEvents.filter(e => e.date === dateStr);

            return (
              <div 
                key={dayNumber}
                onClick={() => onSelectDate && onSelectDate(dateStr)}
                className="h-20 p-1.5 bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <span className="text-xs font-semibold text-slate-700">{dayNumber}</span>
                
                {/* Notikumu marķieri dienas šūnā */}
                <div className="space-y-1 overflow-y-auto">
                  {dayEvents.map((evt, i) => (
                    <div 
                      key={i} 
                      className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                        evt.type === 'exam' 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kalendāra apzīmējumi (Legend) */}
        <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-200 inline-block" />
            <span>Valsts eksāmens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-200 inline-block" />
            <span>Mācību / Konsultācijas sesija</span>
          </div>
        </div>

      </div>
    </Card>
  );
}