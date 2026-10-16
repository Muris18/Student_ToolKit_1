import React, { useState, useEffect } from 'react';
import AppShell, { PageHeader } from '../components/AppShell';
import StudyPlannerCalendar from '../features/planner/StudyPlannerCalendar';
import TaskView from '../features/planner/TaskView';
import DeadlineRadar from '../features/planner/DeadlineRadar';
import AddTaskModal from '../features/planner/AddTaskModal';
import Button from '../components/Button';
import { useApp } from '../lib/AppContext';
import { uid, isExamType } from '../lib/helpers';

function Planner() {
  const { data, update } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetDate, setPresetDate] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const addTask = (fields) => {
    update((d) => ({ ...d, tasks: [{ id: uid(), ...fields, status: 'pending', createdAt: new Date().toISOString(), doneAt: null }, ...d.tasks] }));
    setToast(`Pievienots: ${fields.title}`);
  };
  const saveTask = (task) => {
    update((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === task.id ? task : t)) }));
    setToast('Saglabāts');
  };

  const openNew = (date = '') => { setEditTask(null); setPresetDate(date); setIsModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setIsModalOpen(true); };

  const events = data.tasks.map((t) => ({ id: t.id, date: t.dueDate, title: t.title, type: isExamType(t.type) ? 'exam' : 'session', done: t.status === 'completed' }));

  return (
    <>
      <PageHeader title="📅 Mācību plānotājs un termiņi" subtitle="Eksāmeni, pārbaudes darbi un ikdienas mācību darbi vienuviet.">
        <Button onClick={() => openNew()}>+ Jauns termiņš</Button>
      </PageHeader>

      <DeadlineRadar onAdd={() => openNew()} onViewPlanner={() => document.getElementById('planner-grid')?.scrollIntoView({ behavior: 'smooth' })} />

      <div id="planner-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
        <StudyPlannerCalendar events={events} onSelectDate={(d) => openNew(d)} onSelectEvent={(e) => openEdit(data.tasks.find((t) => t.id === e.id))} />
        <TaskView onAddNewTask={() => openNew()} onEditTask={openEdit} />
      </div>

      <AddTaskModal isOpen={isModalOpen} defaultDate={presetDate} editTask={editTask} onClose={() => setIsModalOpen(false)} onAddTask={addTask} onSaveTask={saveTask} />

      {toast && (
        <div className="fixed inset-x-0 bottom-24 sm:bottom-6 z-[60] flex justify-center pointer-events-none">
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold shadow-glow animate-pop">✓ {toast}</div>
        </div>
      )}
    </>
  );
}

export default function PlannerPage() {
  return (
    <AppShell>
      <Planner />
    </AppShell>
  );
}
