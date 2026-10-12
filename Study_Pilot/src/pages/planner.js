import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudyPlannerCalendar from '../features/planner/StudyPlannerCalendar';
import TaskView from '../features/planner/TaskView';
import DeadlineRadar from '../features/planner/DeadlineRadar';
import AddTaskModal from '../features/planner/AddTaskModal';
import Button from '../components/Button';

export default function PlannerPage() {
  const currentUser = { name: 'Markuss Bērziņš', className: '12. klase' };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [presetDate, setPresetDate] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAddNewTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setToast(`Pievienots: ${newTask.title}`);
  };

  const openModal = (date = '') => { setPresetDate(date); setIsModalOpen(true); };

  const events = tasks.map((t) => ({ date: t.dueDate, title: t.title, subject: t.subject, type: t.type === 'Eksāmens' ? 'exam' : 'session' }));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Navbar user={currentUser} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 md:p-8 space-y-6 max-w-6xl mx-auto w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">📅 Mācību plānotājs un termiņi</h1>
              <p className="text-sm text-slate-500 mt-1">Sekojiet līdzi eksāmeniem, organizējiet laiku un plānojiet ikdienas darbus.</p>
            </div>
            <Button onClick={() => openModal()}>+ Jauns termiņš</Button>
          </div>

          <DeadlineRadar onViewPlanner={() => document.getElementById('planner-grid')?.scrollIntoView({ behavior: 'smooth' })} />

          <div id="planner-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
            <StudyPlannerCalendar events={events} onSelectDate={(d) => openModal(d)} />
            <TaskView onAddNewTask={() => openModal()} newTasks={tasks} />
          </div>
        </main>
      </div>

      <AddTaskModal isOpen={isModalOpen} defaultDate={presetDate} onClose={() => setIsModalOpen(false)} onAddTask={handleAddNewTask} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold shadow-glow animate-pop">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
