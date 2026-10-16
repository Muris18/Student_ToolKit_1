import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import SubjectSelect from '../../components/SubjectSelect';
import { inputCls, labelCls } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { TASK_TYPES } from '../../lib/helpers';

// Pievieno vai labo plānotāja termiņu. `editTask` = esošs ieraksts labošanai.
export default function AddTaskModal({ isOpen, onClose, onAddTask, onSaveTask, defaultDate = '', editTask = null }) {
  const { data } = useApp();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [type, setType] = useState('Eksāmens');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (editTask) {
      setTitle(editTask.title); setSubjectId(editTask.subjectId); setDueDate(editTask.dueDate);
      setPriority(editTask.priority); setType(editTask.type);
    } else {
      setTitle(''); setDueDate(defaultDate || ''); setPriority('normal'); setType('Eksāmens');
      setSubjectId((cur) => (data.subjects.some((s) => s.id === cur) ? cur : data.subjects[0]?.id || ''));
    }
  }, [isOpen, defaultDate, editTask]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    if (!subjectId) return setError('Izvēlies vai pievieno priekšmetu');
    const fields = { title: title.trim(), subjectId, dueDate, priority, type };
    if (editTask) onSaveTask && onSaveTask({ ...editTask, ...fields });
    else onAddTask && onAddTask(fields);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTask ? 'Labot termiņu' : 'Pievienot termiņu vai eksāmenu'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="t-title">Nosaukums / Tēma</label>
          <input id="t-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Piem., Matemātikas eksāmens, eseja…" required className={inputCls} />
        </div>

        <div>
          <label className={labelCls} htmlFor="t-subj">Mācību priekšmets</label>
          <SubjectSelect id="t-subj" value={subjectId} onChange={setSubjectId} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="t-date">Termiņš / Datums</label>
            <input id="t-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="t-type">Veids</label>
            <select id="t-type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <span className={labelCls}>Prioritāte</span>
          <div className="flex gap-3">
            {[{ id: 'high', label: 'Steidzami' }, { id: 'normal', label: 'Normāla' }, { id: 'low', label: 'Zema' }].map((p) => (
              <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${priority === p.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>Atcelt</Button>
          <Button variant="primary" type="submit">{editTask ? 'Saglabāt' : 'Pievienot plānotājam'}</Button>
        </div>
      </form>
    </Modal>
  );
}
