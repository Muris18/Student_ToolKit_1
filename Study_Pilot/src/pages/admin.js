import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

export default function AdminPage() {
  const currentUser = { name: "Administrators", className: "Sistēmas vadība" };

  // Parauga dati lietotāju vadībai
  const [students] = useState([
    { id: 1, name: 'Anna Bērziņa', grade: '12. klase', tasksDone: 42, lastActive: 'Šodien' },
    { id: 2, name: 'Markuss Kalniņš', grade: '9. klase', tasksDone: 28, lastActive: 'Vakar' },
    { id: 3, name: 'Elīza Ozola', grade: '12. klase', tasksDone: 55, lastActive: 'Šodien' },
  ]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={currentUser} />
      
      <div className="flex flex-1">
        <Sidebar currentPath="/admin" />

        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          
          {/* Augšējais virsraksts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">⚙️ Sistēmas Administrēšana</h1>
              <p className="text-sm text-slate-500 mt-1">
                Pārvaldi Study Pilot lietotājus, eksāmenu materiālus un RAG sistēmas statusu.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
              + Augšupielādēt eksāmena materiālu
            </Button>
          </div>

          {/* Sistēmas rādītāju kopsavilkums */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">Reģistrētie skolēni</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">1,240</p>
              <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">● 98 aktīvi šodien</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">RAG Dokumentu skaits</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">342 PDF</p>
              <span className="text-xs text-indigo-600 font-medium mt-2 inline-block">Oficiālie eksāmeni (2022-2026)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <p className="text-xs text-slate-400 font-medium">AI Čata pieprasījumi</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">8,920</p>
              <span className="text-xs text-violet-600 font-medium mt-2 inline-block">Šajā mēnesī</span>
            </div>
          </div>

          {/* Skolēnu un aktivāšu pārvaldības tabula */}
          <Card title="👥 Skolēnu aktivitātes pārskats" subtitle="Nesenie platformas lietotāji un progress">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Vārds, Uzvārds</th>
                    <th className="py-3 px-4">Klase</th>
                    <th className="py-3 px-4">Atrisinātie uzdevumi</th>
                    <th className="py-3 px-4">Pēdējā aktivitāte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{student.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{student.grade}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{student.tasksDone}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{student.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </main>
      </div>

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

    </div>
  );
}