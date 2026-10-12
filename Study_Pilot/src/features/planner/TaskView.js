import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function TaskView({ onAddNewTask }) {
  // Pagaidu uzdevumu saraksts
  const [taskList, setTaskList] = useState([
    { id: 1, title: 'Izpildīt 2023. gada matemātikas eksāmena 1. daļu', date: 'Šodien', completed: false, tag: 'Matemātika' },
    { id: 2, title: 'Izlasīt latviešu valodas domraksta kritērijus', date: 'Rīt', completed: true, tag: 'Latviešu valoda' },
    { id: 3, title: 'Atkārtot angļu valodas laikus', date: '15. maijs', completed: false, tag: 'Angļu valoda' },
  ]);

  // Uzdevuma statusa maiņa (izpildīts / neizpildīts)
  const toggleTask = (id) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <Card 
      title="📋 Plānotie uzdevumi" 
      subtitle="Tavi tuvākie mācību darbi un atgādinājumi"
    >
      <div className="space-y-4">
        {/* Poga jauna uzdevuma pievienošanai */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-medium">
            Kopā: {taskList.length} uzdevumi
          </span>
          <Button variant="primary" onClick={onAddNewTask} className="text-xs py-1.5 px-3">
            + Pievienot uzdevumu
          </Button>
        </div>

        {/* Uzdevumu saraksts */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {taskList.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-100 shadow-2xs hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // Apstrādā tēva div klikšķis
                  className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <p className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <span className="text-[10px] text-slate-400">{task.date}</span>
                </div>
              </div>

              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md whitespace-nowrap">
                {task.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}