import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function QuizMode({ subjectTitle = "Matemātika", onFinishQuiz }) {
  // Pagaidu jautājumu dati testam
  const questions = [
    {
      id: 1,
      question: "Kāda ir kvadrātvienādojuma x² - 5x + 6 = 0 sakņu summa?",
      options: ["5", "-5", "6", "-6"],
      correctIndex: 0,
      explanation: "Saskaņā ar Vijeta teorēmu, sakņu summa ir vienāda ar koeficientu pie x ar pretējo zīmi, tātad 5."
    },
    {
      id: 2,
      question: "Kāds ir atvasinājums funkcijai f(x) = 3x² + 2x - 1?",
      options: ["6x + 2", "3x + 2", "6x - 1", "x² + 2"],
      correctIndex: 0,
      explanation: "Izmantojot pakāpes funkcijas atvasināšanas likumu: (3x²)' = 6x un (2x)' = 2, iegūstam 6x + 2."
    },
    {
      id: 3,
      question: "Kurš no dotajiem leņķiem ir vienāds ar sin(30°)?",
      options: ["cos(60°)", "sin(60°)", "tan(30°)", "cos(30°)"],
      correctIndex: 0,
      explanation: "Saskaņā ar trigonometriskajām identitātēm, sin(30°) ir vienāds ar cos(60°) (abu vērtība ir 0.5)."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Atbildes iesniegšana un pārbaude
  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;

    setIsAnswerSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  // Pāreja uz nākamo jautājumu
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      if (onFinishQuiz) onFinishQuiz(score + (selectedOption === currentQuestion.correctIndex ? 1 : 0));
    }
  };

  if (isCompleted) {
    return (
      <Card title="⚡ Tests pabeigts!" subtitle={`Priekšmets: ${subjectTitle}`}>
        <div className="text-center py-8 space-y-4">
          <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-600 text-indigo-600 flex items-center justify-center text-2xl font-bold mx-auto shadow-sm">
            {score}/{questions.length}
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Lielisks darbs!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Tu esi veiksmīgi atrisinājis testa jautājumus. Turpini trenēties, lai uzlabotu savas sekmes valsts eksāmenos!
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Sākt no jauna
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={`⚡ Testa režīms: ${subjectTitle}`} 
      subtitle={`Jautājums ${currentIndex + 1} no ${questions.length}`}
    >
      <div className="space-y-6">
        
        {/* Progresa josla */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Jautājuma teksts */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-base md:text-lg">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Atbilžu varianti */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let optionStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";

            if (isAnswerSubmitted) {
              if (index === currentQuestion.correctIndex) {
                optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium";
              } else if (index === selectedOption) {
                optionStyle = "bg-rose-50 border-rose-500 text-rose-800";
              } else {
                optionStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
              }
            } else if (selectedOption === index) {
              optionStyle = "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs";
            }

            return (
              <button
                key={index}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => setSelectedOption(index)}
                className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
              >
                <span>{option}</span>
                <span className="text-xs font-bold text-slate-400">
                  {String.fromCharCode(65 + index)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skaidrojums pēc atbildes iesniegšanas */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-sm space-y-1">
            <p className="font-semibold text-indigo-900">AI skaidrojums:</p>
            <p className="text-indigo-700 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Apakšējās pogas */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">Izvēlies pareizo atbildi un nospied pogu</span>
          
          {!isAnswerSubmitted ? (
            <Button 
              variant="primary" 
              onClick={handleAnswerSubmit} 
              disabled={selectedOption === null}
            >
              Apstiprināt atbildi
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNextQuestion}>
              {currentIndex + 1 < questions.length ? 'Nākamais jautājums' : 'Skatīt rezultātus'}
            </Button>
          )}
        </div>

      </div>
    </Card>
  );
}