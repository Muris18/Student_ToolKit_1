import React, { useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

export default function AddTaskModal({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matemātika');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal'); // high, normal, low
  const [type, setType] = useState('Eksāmens');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    // Izveidojam jauno uzdevuma objektu
    const newTask = {
      id: Date.now(),
      title,
      subject,
      dueDate,
      priority,
      type,
      status: 'pending'
    };

    if (onAddTask) {
      onAddTask(newTask);
    }

    // Notīrām laukus un aizveram modālo logu
    setTitle('');
    setDueDate('');
    setPriority('normal');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Pievienot jaunu termiņu vai eksāmenu"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Uzdevuma nosaukums */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Nosaukums / Tēma
          </label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Piem., Matemātikas eksāmens vai eseja..." 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors"
          />
        </div>

        {/* Mācību priekšmets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Mācību priekšmets
          </label>
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
          >
            <option value="Matemātika">Matemātika</option>
            <option value="Latviešu valoda">Latviešu valoda</option>
            <option value="Angļu valoda">Angļu valoda</option>
            <option value="Fizika / Ķīmija">Fizika / Ķīmija</option>
            <option value="Vēsture">Vēsture</option>
          </select>
        </div>

        {/* Datums un tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Termiņš / Datums
            </label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Veids
            </label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
            >
              <option value="Eksāmens">Eksāmens</option>
              <option value="Pārbaudes darbs">Pārbaudes darbs</option>
              <option value="Mājasdarbs">Mājasdarbs</option>
              <option value="Konsultācija">Konsultācija</option>
            </select>
          </div>
        </div>

        {/* Prioritāte */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Prioritāte
          </label>
          <div className="flex gap-3">
            {[
              { id: 'high', label: 'Steidzami', color: 'rose' },
              { id: 'normal', label: 'Normāla', color: 'amber' },
              { id: 'low', label: 'Zema', color: 'indigo' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  priority === p.id 
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Apakšējās pogas */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Atcelt
          </Button>
          <Button variant="primary" type="submit">
            Pievienot plānotājam
          </Button>
        </div>

      </form>
    </Modal>
  );
}