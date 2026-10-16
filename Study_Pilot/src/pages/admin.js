import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { useApp } from '../lib/AppContext';
import { fmtDate, relDay } from '../lib/helpers';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import CountUp from '../components/CountUp';

export default function AdminPage() {
  return (
    <AppShell>
      <Admin />
    </AppShell>
  );
}

function Admin() {
  const { api } = useApp();
  // Īstie dati no servera atmiņas (visi šajā palaišanas reizē reģistrētie)
  const [overview, setOverview] = useState(null);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    const load = () => api('/api/admin/overview').then(setOverview).catch((e) => setLoadError(e.message));
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const students = overview?.users || [];
  const stats = overview?.stats || { users: 0, activeToday: 0, quizzes: 0, chat: 0 };

  // Modālā loga stāvoklis jauna materiāla augšupielādei
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Matemātika');

  const handleUpload = (e) => {
    e.preventDefault();
    alert(`Materiāls "${materialTitle}" pievienots ${selectedSubject} RAG datubāzei!`);
    setMaterialTitle('');
    setIsUploadModalOpen(false);
  };

  return (
    <>
          {/* Augšējais virsraksts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">⚙️ Sistēmas Administrēšana</h1>
              <p className="text-sm text-slate-500 mt-1">
                Lietotāji, kas reģistrējušies kopš servera palaišanas{overview ? ` (${fmtDate(overview.startedAt.slice(0, 10))}, ${new Date(overview.startedAt).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })})` : ''}.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
              + Augšupielādēt eksāmena materiālu
            </Button>
          </div>

          {/* Sistēmas rādītāju kopsavilkums */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Reģistrētie lietotāji</p>
              <CountUp as="p" to={stats.users} className="text-2xl font-bold text-slate-800 mt-1" />
              <span className="text-xs text-emerald-700 font-medium mt-2 inline-block">● {stats.activeToday} aktīvi šodien</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Pildīti testi</p>
              <CountUp as="p" to={stats.quizzes} className="text-2xl font-bold text-slate-800 mt-1" />
              <span className="text-xs text-indigo-600 font-medium mt-2 inline-block">Visi lietotāji kopā</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Čata ziņas</p>
              <CountUp as="p" to={stats.chat} className="text-2xl font-bold text-slate-800 mt-1" />
              <span className="text-xs text-violet-600 font-medium mt-2 inline-block">Kopš servera palaišanas</span>
            </div>
          </div>

          {/* Skolēnu un aktivāšu pārvaldības tabula */}
          <Card title="👥 Lietotāju aktivitātes pārskats" subtitle="Atjaunojas ik pēc 10 sekundēm">
            {loadError && <p className="text-sm text-rose-600 mb-3">{loadError}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Vārds, Uzvārds</th>
                    <th className="py-3 px-4">Klase / kurss</th>
                    <th className="py-3 px-4">Priekšmeti</th>
                    <th className="py-3 px-4">Izpildīti darbi</th>
                    <th className="py-3 px-4">Testi</th>
                    <th className="py-3 px-4">Pēdējā aktivitāte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{student.name}{student.school && <span className="block text-xs font-normal text-slate-400">{student.school}</span>}</td>
                      <td className="py-3.5 px-4 text-slate-500">{student.grade}. {student.level}</td>
                      <td className="py-3.5 px-4 text-slate-700">{student.subjects}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{student.done}</td>
                      <td className="py-3.5 px-4 text-slate-700">{student.quizzes}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{relDay(student.lastActive.slice(0, 10))}, {new Date(student.lastActive).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

      {/* Uznirstošais logs jaunu eksāmena materiālu/PDF augšupielādei AI RAG bāzei */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        title="Pievienot materiālu AI datubāzei (RAG)"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Materiāla nosaukums
            </label>
            <input 
              type="text" 
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="Piem., 2025. gada 12. klases matemātikas eksāmens" 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-indigo-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mācību priekšmets
            </label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-indigo-600 transition-colors"
            >
              <option value="Matemātika">Matemātika</option>
              <option value="Latviešu valoda">Latviešu valoda</option>
              <option value="Angļu valoda">Angļu valoda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Fails (PDF vai Uzdevumu fails)
            </label>
            <input 
              type="file" 
              accept=".pdf,.docx,.json"
              required
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Atcelt
            </Button>
            <Button variant="primary" type="submit">
              Sākt apstrādi & Saglabāt
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}