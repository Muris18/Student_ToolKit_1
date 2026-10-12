import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ProgressPage() {
  const currentUser = { name: "Markuss Bērziņš", className: "12. klase" };

  // Parauga dati progresa analīzei pa priekšmetiem
  const [subjectProgress] = useState([
    { id: 1, subject: 'Matemātika', progress: 78, tasksCompleted: 120, totalTasks: 150, status: 'Lieliski' },
    { id: 2, subject: 'Latviešu valoda', progress: 65, tasksCompleted: 85, totalTasks: 130, status: 'Vidēji' },
    { id: 3, subject: 'Angļu valoda', progress: 90, tasksCompleted: 110, totalTasks: 120, status: 'Izcili' },
  ]);

  // Vājās vietas / tēmas, kurām nepieciešams atkārtojums
  const [weakTopics] = useState([
    { id: 1, subject: 'Matemātika', topic: 'Trigonometriskās identitātes un vienādojumi', errorRate: '35%' },
    { id: 2, subject: 'Latviešu valoda', topic: 'Saliktu pakārtotu teikumu pieturzīmes', errorRate: '28%' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={currentUser} onLogout={() => alert('Izrakstās no sistēmas...')} />
      
      <div className="flex flex-1">
        <Sidebar currentPath="/progress" />

        <main className="flex-1 p-8 overflow-y-auto space-y-6 max-w-5xl">
          
          {/* Lapas virsraksts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">📊 Progresa un kļūdu analīze</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sekojiet līdzi savām sekmēm un identificējiet tēmas, kuras nepieciešams atkārtot pirms eksāmena.
              </p>
            </div>
          </div>

          {/* Galvenie statistikas rādītāji */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Kopējais izpildīto uzdevumu skaits</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">315</p>
              <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">↑ Par 15% vairāk nekā pagājušonedēļ</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Vidējais pareizo atbilžu īpatsvars</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">77%</p>
              <span className="text-xs text-indigo-600 font-medium mt-2 inline-block">Atbilst optimālajam līmenim</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Aktivitāte šonedēļ</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">5 dienas</p>
              <span className="text-xs text-violet-600 font-medium mt-2 inline-block">Lieliska disciplīna!</span>
            </div>
          </div>

          {/* Progresa sadalījums pa priekšmetiem */}
          <Card title="📚 Progresa sadalījums pa priekšmetiem" subtitle="Apgūtās tēmas un izpildītie uzdevumi">
            <div className="space-y-5">
              {subjectProgress.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-800">{item.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{item.tasksCompleted} / {item.totalTasks} uzdevumi</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {item.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Progresa josla */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Vājo vietu / kļūdu analīze */}
          <Card title="⚠️ Vājās vietas un ieteiktie atkārtojumi" subtitle="Tēmas, kurās visbiežāk pieļautas kļūdas">
            <div className="space-y-3">
              {weakTopics.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{item.subject}</span>
                    <h4 className="font-semibold text-slate-800 text-sm md:text-base">{item.topic}</h4>
                    <p className="text-xs text-slate-500">Kļūdu īpatsvars šajos uzdevumos: <span className="font-semibold text-rose-600">{item.errorRate}</span></p>
                  </div>

                  <Button 
                    variant="primary" 
                    onClick={() => window.location.href = '/exams?mode=ai'}
                    className="text-xs py-2 px-3 whitespace-nowrap"
                  >
                    🤖 Prasīt AI skaidrojumu
                  </Button>
                </div>
              ))}
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
}