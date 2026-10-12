import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CountUp from '../../components/CountUp';

export default function DashboardMain({ user }) {
  // Pagaidu dati demonstrācijai
  const studentName = user?.name || "Skolēns";
  const studentGrade = user?.className || "12. klase";

  return (
    <div className="space-y-6">
      
      {/* Sveiciena baneris */}
      <div className="bg-gradient-to-r from-accent to-accent2 rounded-3xl p-5 sm:p-8 text-white shadow-lg shadow-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="bg-black/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {studentGrade} Eksāmenu sezona
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">
            Sveicināts atpakaļ, {studentName}! 👋
          </h2>
          <p className="text-white/80 mt-1 max-w-xl text-sm md:text-base">
            Tev ir atlikušas dažas nedēļas līdz valsts eksāmeniem. Turpini sekot līdzi plānotājam un izmanto AI mācību palīgu neskaidrībām!
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.location.href = '/exams'}>
            Sākt risināt
          </Button>
        </div>
      </div>

      {/* Galvenais režģis (Grid) ar logrīkiem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tuvāko termiņu bloks */}
        <Card 
          title="⏳ Tuvākie termiņi" 
          subtitle="Nākamās 7 dienas"
          className="md:col-span-2"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Matemātikas valsts pārbaudes darbs</p>
                <p className="text-xs text-slate-400">Pēc 3 dienām • Matemātika</p>
              </div>
              <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg">Steidzami</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Latviešu valodas eseju sagatavošana</p>
                <p className="text-xs text-slate-400">Pēc 5 dienām • Latviešu valoda</p>
              </div>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">Plānā</span>
            </div>
          </div>
        </Card>

        {/* Progresa kopsavilkuma bloks */}
        <Card 
          title="📊 Tavs progress" 
          subtitle="Apgūtās tēmas"
        >
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-600 flex items-center justify-center text-xl font-bold text-slate-800 shadow-inner">
              <CountUp to={64} suffix="%" />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">Kopējais gatavības līmenis eksāmeniem</p>
          </div>
        </Card>

      </div>

    </div>
  );
}