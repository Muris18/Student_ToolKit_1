import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function TaskView({ onAddNewTask }) {
  // Pagaidu dati plānotāja uzdevumiem un termiņiem
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Matemātikas valsts pārbaudes darba simulācija', 
      subject: 'Matemātika', 
      dueDate: '2026-06-05', 
      status: 'pending', // pending, completed
      priority: 'high' 
    },
    { 
      id: 2, 
      title: 'Latviešu valodas eseju melnraksts', 
      subject: 'Latviešu valoda', 
      dueDate: '2026-06-08', 
      status: 'pending', 
      priority: 'medium' 
    },
    { 
      id: 3, 
      title: 'Angļu valodas vārdu krājuma atkārtošana', 
      subject: 'Angļu valoda', 
      dueDate: '2026-06-01', 
      status: 'completed', 
      priority: 'low' 
    },
  ]);

  const [filter, setFilter] = useState('all'); // all, pending, completed

  // Pārslēgt uzdevuma statusu
  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } 
        : task
    ));
  };

  // Filtrētie uzdevumi
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <Card 
      title="⏳ Termiņu radars un plānotājs" 
      subtitle="Pārvaldi savus eksāmenu datumus un mācību uzdevumus"
      action={
        <Button variant="primary" onClick={onAddNewTask} className="text-xs py-1.5 px-3">
          + Pievienot termiņu
        </Button>
      }
    >
      <div className="space-y-6">
        
        {/* Filtru pogas */}
        <div className="flex gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Visi ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filter === 'pending' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktīvie ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filter === 'completed' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Izpildītie ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {/* Uzdevumu saraksts */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Šajā sadaļā nav uzdevumu.</p>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  task.status === 'completed' 
                    ? 'bg-slate-50/40 border-slate-100 opacity-75' 
                    : 'bg-slate-50/80 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {task.subject}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">Termiņš: {task.dueDate}</span>
                  </div>
                  <h4 className={`font-semibold text-sm md:text-base ${
                    task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}>
                    {task.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    task.status === 'completed' 
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {task.status === 'completed' ? 'Atjaunot' : '✓ Izpildīts'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </Card>
  );
}