import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ExamSelector({ onSelectExam }) {
  const [selectedGrade, setSelectedGrade] = useState('12');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedYear, setSelectedYear] = useState('2025');

  const grades = [
    { id: '9', name: '9. klase (Pamatskolas eksāmeni)' },
    { id: '12', name: '12. klase (Vidusskolas eksāmeni)' }
  ];

  const subjects = {
    '9': [
      { id: 'math', name: 'Matemātika' },
      { id: 'latvian', name: 'Latviešu valoda' },
      { id: 'english', name: 'Angļu valoda' }
    ],
    '12': [
      { id: 'math', name: 'Matemātika (Optimālais / Augstākais līmenis)' },
      { id: 'latvian', name: 'Latviešu valoda' },
      { id: 'english', name: 'Angļu valoda' }
    ]
  };

  const years = ['2026', '2025', '2024', '2023', '2022'];

  const handleApplySelection = () => {
    if (onSelectExam) {
      onSelectExam({ grade: selectedGrade, subject: selectedSubject, year: selectedYear });
    }
  };

  return (
    <Card 
      title="📚 Eksāmenu un priekšmetu izvēle" 
      subtitle="Izvēlies klasi, priekšmetu un gadu, lai sāktu risināt uzdevumus"
    >
      <div className="space-y-6">
        
        {/* Klases izvēle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            1. Izvēlies klasi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grades.map((grade) => (
              <button
                key={grade.id}
                type="button"
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setSelectedSubject(subjects[grade.id][0].id); // Nomainot klasi, iestata pirmo pieejamo priekšmetu
                }}
                className={`p-3.5 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer ${
                  selectedGrade === grade.id
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {grade.name}
              </button>
            ))}
          </div>
        </div>

        {/* Priekšmeta izvēle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            2. Izvēlies mācību priekšmetu
          </label>
          <div className="grid grid-cols-1 gap-2">
            {subjects[selectedGrade].map((subj) => (
              <button
                key={subj.id}
                type="button"
                onClick={() => setSelectedSubject(subj.id)}
                className={`p-3 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer ${
                  selectedSubject === subj.id
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {subj.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gada izvēle */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            3. Eksāmena gads / sesija
          </label>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  selectedYear === year
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Apstiprinājuma poga */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <Button variant="primary" onClick={handleApplySelection}>
            Apstiprināt un ielādēt materiālus
          </Button>
        </div>

      </div>
    </Card>
  );
}