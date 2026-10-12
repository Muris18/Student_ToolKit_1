import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ExamTaskList({ subjectTitle = "Matemātika (12. klase)", onOpenAiHelp }) {
  // Pagaidu dati eksāmena uzdevumiem
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      number: '1. uzdevums', 
      title: 'Kvadrātvienādojuma sakņu noteikšana un grafika zīmēšana', 
      points: '4 punkti', 
      difficulty: 'Vidēja', 
      completed: true 
    },
    { 
      id: 2, 
      number: '2. uzdevums', 
      title: 'Trigonometrisko funkciju vienkāršošana un identitāšu pierādīšana', 
      points: '6 punkti', 
      difficulty: 'Sarežģīta', 
      completed: false 
    },
    { 
      id: 3, 
      number: '3. uzdevums', 
      title: 'Atvasinājuma pielietojums un funkcijas ekstrēmi', 
      points: '5 punkti', 
      difficulty: 'Sarežģīta', 
      completed: false 
    },
  ]);

  // Funkcija, lai atzīmētu uzdevumu kā izpildītu / neizpildītu
  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card 
      title={`📝 Uzdevumu saraksts: ${subjectTitle}`} 
      subtitle="Oficiālie valsts pārbaudes darba uzdevumi un risinājumi"
    >
      <div className="space-y-4">
        
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              task.completed 
                ? 'bg-emerald-50/40 border-emerald-100' 
                : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  {task.number}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{task.points}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className={`text-xs font-medium ${
                  task.difficulty === 'Sarežģīta' ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  {task.difficulty}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm md:text-base">{task.title}</h4>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button 
                variant="secondary" 
                onClick={() => onOpenAiHelp && onOpenAiHelp(task)}
                className="text-xs py-1.5 px-3"
              >
                🤖 Prasīt AI skaidrojumu
              </Button>

              <button
                type="button"
                onClick={() => toggleTaskCompletion(task.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  task.completed 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {task.completed ? '✓ Izpildīts' : 'Atzīmēt kā izpildītu'}
              </button>
            </div>
          </div>
        ))}

      </div>
    </Card>
  );
}