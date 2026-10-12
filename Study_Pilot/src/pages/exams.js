import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExamSelector from '../features/exams/ExamSelector';
import ExamTaskList from '../features/exams/ExamTaskList';
import QuizMode from '../features/exams/QuizMode';
import AiTutorChat from '../features/exams/AiTutorChat';

export default function ExamsPage() {
  const currentUser = { name: "Markuss Bērziņš", className: "12. klase" };

  // Stāvokļi: kurā režīmā atrodas skolēns (select, tasks, quiz, ai)
  const [activeMode, setActiveMode] = useState('select');
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);

  // Režīma maiņa no augšējās navigācijas vai pogām
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={currentUser} onLogout={() => alert('Izrakstās no sistēmas...')} />
      
      <div className="flex flex-1">
        <Sidebar currentPath="/exams" />
        
        <main className="flex-1 p-8 overflow-y-auto space-y-6 max-w-5xl">
          
          {/* Navigācijas tabs starp dažādiem eksāmenu režīmiem */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div>
              <h1 className="text-xl font-bold text-slate-800">📚 Eksāmenu sagatavošanās</h1>
              <p className="text-xs text-slate-500 mt-0.5">Mācies ar oficiālajiem materiāliem un AI palīgu</p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('select')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'select' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Materiālu izvēle
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('tasks')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'tasks' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Uzdevumu saraksts
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('quiz')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'quiz' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚡ Tests
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('ai')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMode === 'ai' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🤖 AI Skolotājs
              </button>
            </div>
          </div>

          {/* Dinamiskā satura maiņa atkarībā no izvēlētā režīma */}
          {activeMode === 'select' && (
            <ExamSelector 
              onSelectExam={(filter) => {
                setSelectedExamDetails(filter);
                setActiveMode('tasks'); // Kad izvēlēts, automātiski pāriet uz uzdevumu sarakstu
              }} 
            />
          )}

          {activeMode === 'tasks' && (
            <ExamTaskList 
              subjectTitle={selectedExamDetails ? `${selectedExamDetails.subject} (${selectedExamDetails.grade}. klase - ${selectedExamDetails.year}. gads)` : "Matemātika (12. klase)"}
              onOpenAiHelp={(task) => {
                setActiveMode('ai');
              }}
            />
          )}

          {activeMode === 'quiz' && (
            <QuizMode 
              subjectTitle={selectedExamDetails ? `${selectedExamDetails.subject} (${selectedExamDetails.grade}. klase)` : "Matemātika (12. klase)"}
              onFinishQuiz={(score) => alert(`Tests pabeigts! Tavs rezultāts: ${score} punkti`)}
            />
          )}

          {activeMode === 'ai' && (
            <AiTutorChat />
          )}

        </main>
      </div>
    </div>
  );
}