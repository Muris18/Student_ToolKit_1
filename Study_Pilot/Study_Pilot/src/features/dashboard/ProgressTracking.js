import React from 'react';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState } from '../../components/AppShell';
import { useApp } from '../../lib/AppContext';
import { subjectName } from '../../lib/helpers';

// Vājās vietas: jautājumi, kuros testos visbiežāk kļūdās
export default function ProgressTracking() {
  const { data } = useApp();
  const router = useRouter();

  const rows = [];
  for (const quiz of data.quizzes) {
    const results = data.quizResults.filter((r) => r.quizId === quiz.id);
    if (!results.length) continue;
    for (const q of quiz.questions) {
      const wrong = results.filter((r) => (r.wrong || []).includes(q.id)).length;
      if (!wrong) continue;
      rows.push({ id: q.id, subjectId: quiz.subjectId, quiz: quiz.title, question: q.question, rate: Math.round((wrong / results.length) * 100), attempts: results.length });
    }
  }
  rows.sort((a, b) => b.rate - a.rate || b.attempts - a.attempts);
  const top = rows.slice(0, 8);

  return (
    <Card title="⚠️ Vājās vietas" subtitle="Testu jautājumi, kuros visbiežāk pieļautas kļūdas">
      {top.length === 0 ? (
        <EmptyState
          icon="🎯"
          title={data.quizResults.length ? 'Kļūdu nav — tā turpināt!' : 'Vēl nav datu'}
          text={data.quizResults.length ? 'Visos pildītajos testos atbildes bija pareizas.' : 'Izpildi kādu testu, un šeit redzēsi tēmas, kuras vērts atkārtot.'}
        >
          {!data.quizResults.length && <Button onClick={() => router.push('/exams?mode=quiz')} className="text-xs py-2">Uz testiem</Button>}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {top.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{subjectName(data, item.subjectId)} · {item.quiz}</span>
                <h4 className="font-semibold text-slate-800 text-sm md:text-base">{item.question}</h4>
                <p className="text-xs text-slate-500">Kļūdas: <span className="font-semibold text-rose-700">{item.rate}%</span> no {item.attempts} mēģinājumiem</p>
              </div>
              <Button variant="secondary" onClick={() => router.push(`/exams?mode=ai&subject=${item.subjectId}`)} className="text-xs py-2 px-3 whitespace-nowrap">🤖 Jautāt čatā</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
