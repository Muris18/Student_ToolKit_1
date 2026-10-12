import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import ThemeSwitcher from '../components/ThemeSwitcher';

const features = [
  { icon: '🤖', title: 'AI Mācību palīgs', text: 'Skaidrojumi soli pa solim, kas balstīti uz oficiālajiem eksāmenu standartiem.' },
  { icon: '⏳', title: 'Termiņu radars', text: 'Seko līdzi atlikušajām dienām līdz eksāmeniem un plāno darbus kalendārā.' },
  { icon: '⚡', title: 'Ātrie testi', text: 'Pārbaudi zināšanas ar testiem un uzreiz saņem skaidrojumu katrai atbildei.' },
  { icon: '📊', title: 'Progresa analīze', text: 'Identificē stiprās un vājās puses katrā mācību priekšmetā.' },
];

export default function LandingPage() {
  const go = (href) => () => (window.location.href = href);
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <header className="max-w-6xl mx-auto w-full p-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white flex items-center justify-center font-extrabold shadow-glow">SP</div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">Study Pilot</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Button variant="secondary" onClick={go('/dashboard')} className="hidden sm:flex">Pieslēgties</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center space-y-8 flex-1">
        <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full border border-indigo-100 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Latvijas 9. un 12. klašu valsts eksāmenu sagatavošanās platforma
        </span>
        <h1 className="text-[2.5rem] leading-[1.05] sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05] animate-pop">
          Sagatavojies eksāmeniem <span className="text-gradient">gudri un mierīgi</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Risini oficiālos valsts pārbaudes darbus, plāno laiku ar termiņu radaru un seko savam progresam — viss vienuviet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={go('/dashboard')} className="w-full sm:w-auto px-7 py-3.5 text-base">Atvērt vadības paneli ➔</Button>
          <Button variant="secondary" onClick={go('/exams')} className="w-full sm:w-auto px-7 py-3.5 text-base">Sākt risināt</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-12 text-left">
          {features.map((f) => (
            <div key={f.title} className="group bg-white/90 backdrop-blur p-6 rounded-3xl border border-slate-100 shadow-soft hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="font-bold text-slate-800">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto w-full p-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400 border-t border-slate-100">
        <span>&copy; 2026 Study Pilot. Izveidots Latvijas skolēniem.</span>
        <Link href="/admin" className="hover:text-accent transition-colors">Sistēmas administrēšana</Link>
      </footer>
    </div>
  );
}
