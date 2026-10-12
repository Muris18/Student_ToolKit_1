import React from 'react';
import Button from '../components/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Augšējā josla */}
      <header className="max-w-6xl mx-auto w-full p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            SP
          </div>
          <span className="font-bold text-slate-800 text-lg">Study Pilot</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
            Pieslēgties
          </Button>
          <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
            Sākt bez maksas
          </Button>
        </div>
      </header>

      {/* Galvenā pieteikuma daļa (Hero) */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
          🚀 Latvijas 9. un 12. klašu valsts eksāmenu sagatavošanās platforma
        </span>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Sagatavojies eksāmeniem gudri, izmantojot <span className="text-indigo-600">AI un RAG tehnoloģijas</span>
        </h1>
        
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Study Pilot palīdz apgūt mācību vielu, risināt oficiālos valsts pārbaudes darbus, plānot laiku ar termiņu radaru un uzdot jautājumus viedajam AI skolotājam.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button variant="primary" onClick={() => window.location.href = '/dashboard'} className="w-full sm:w-auto px-6 py-3">
            Atvērt vadības paneli ➔
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/admin'} className="w-full sm:w-auto px-6 py-3">
            Sistēmas administrēšana
          </Button>
        </div>

        {/* Galvenās iespējas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-2xl">🤖</span>
            <h3 className="font-semibold text-slate-800">AI Mācību palīgs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Skaidrojumi soli pa solim, kas balstīti uz oficiālajiem eksāmenu standartiem.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-2xl">⏳</span>
            <h3 className="font-semibold text-slate-800">Termiņu radars</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Seko līdzi atlikušajām dienām līdz eksāmeniem un plāno darbus kalendārā.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-semibold text-slate-800">Progresa analīze</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Identificē stiprās un vājās puses katrā mācību priekšmetā.</p>
          </div>
        </div>
      </main>

      {/* Kājenes daļa */}
      <footer className="max-w-6xl mx-auto w-full p-6 text-center text-xs text-slate-400 border-t border-slate-100">
        &copy; 2026 Study Pilot. Visas tiesības aizsargātas. Izveidots Latvijas skolēniem.
      </footer>
    </div>
  );
}