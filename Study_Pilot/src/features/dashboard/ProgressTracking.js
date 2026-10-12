import React from 'react';
import Card from '../../components/Card';

export default function ProgressTracking() {
  // Parauga dati par tēmu apguvi un kļūdu analīzi
  const topicStats = [
    { topic: 'Kvadrātvienādojumi un funkcijas', subject: 'Matemātika', accuracy: '85%', status: 'Stiprā puse' },
    { topic: 'Trigonometrija', subject: 'Matemātika', accuracy: '45%', status: 'Nepieciešams treniņš' },
    { topic: 'Sintakse un pieturzīmes', subject: 'Latviešu valoda', accuracy: '70%', status: 'Vidēji' },
    { topic: 'Lasīkomprēhensija', subject: 'Angļu valoda', accuracy: '90%', status: 'Lieliski' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Galvenā statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Atrisinātie uzdevumi kopā</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">142</p>
          <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">+12 šonedēļ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Vidējā precizitāte</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">74%</p>
          <span className="text-xs text-indigo-600 font-medium mt-2 inline-block">Stabils progress</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-400 font-medium">Mācību stundas kopā</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">18.5 st.</p>
          <span className="text-xs text-violet-600 font-medium mt-2 inline-block">Šajā mēnesī</span>
        </div>
      </div>

      {/* Detalizēts tēmu novērtējums */}
      <Card 
        title="🎯 Tēmu analīze un vājās vietas" 
        subtitle="Balstoties uz taviem iesniegtajiem uzdevumiem un AI testiem"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tēma</th>
                <th className="py-3 px-4">Priekšmets</th>
                <th className="py-3 px-4">Precizitāte</th>
                <th className="py-3 px-4">Statuss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {topicStats.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-800">{row.topic}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.subject}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{row.accuracy}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                      row.status === 'Lieliski' || row.status === 'Stiprā puse' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : row.status === 'Vidēji'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}