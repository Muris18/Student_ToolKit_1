import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudyPlannerCalendar from '../features/planner/StudyPlannerCalendar';
import TaskView from '../features/planner/TaskView';
import DeadlineRadar from '../features/planner/DeadlineRadar';
import AddTaskModal from '../features/planner/AddTaskModal';

export default function PlannerPage() {
  const currentUser = { name: "Markuss Bērziņš", className: "12. klase" };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Jauna uzdevuma pievienošanas apstrāde
  const handleAddNewTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    alert(`Veiksmīgi pievienots termiņš: "${newTask.title}"!`);
    // Šeit vēlāk varēs integrēt saglabāšanu Supabase datubāzē
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Augšējā navigācijas josla */}
      <Navbar user={currentUser} onLogout={() => alert('Izrakstās no sistēmas...')} />
      
      <div className="flex flex-1">
        {/* Sānu izvēlne */}
        <Sidebar currentPath="/planner" />
        
        {/* Galvenais satura laukums */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
          
          {/* Virsraksta sadaļa */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">📅 Mācību plānotājs un termiņi</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sekojiet līdzi valsts eksāmenu atskaitei, organizējiet savu laiku un plānojiet ikdienas darbus.
              </p>
            </div>
          </div>

          {/* Termiņu radars augšdaļā */}
          <DeadlineRadar onViewPlanner={() => window.scrollTo({ top: 400, behavior: 'smooth' })} />

          {/* Kalendārs un uzdevumu skats divās kolonnās */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudyPlannerCalendar onSelectDate={(date) => alert(`Izvēlēts datums: ${date}`)} />
            <TaskView onAddNewTask={() => setIsModalOpen(true)} />
          </div>

        </main>
      </div>

      {/* Uznirstošais logs jauna uzdevuma pievienošanai */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTask={handleAddNewTask}
      />
    </div>
  );
}