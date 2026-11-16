// AI vērtējums atvērtajiem uzdevumiem: ielādē uzdevumus un kritērijus no DB (skolēns tos nesūta, tāpēc nevar viltot), izsauc DeepSeek.
// Izmanto: src/pages/api/exams/ai-grade.js. Tīrā loģika: src/lib/aiGrade.js.
import { query } from './db';
import { askDeepSeek } from './ai';
import { buildGradeMessages, parseGrades, GRADE_BATCH } from '../lib/aiGrade';

// answers: { [taskId]: "skolēna atbilde" }. Vērtē tikai atvērtos uzdevumus šajā eksāmenā, kuriem ir atbilde un kritēriji.
// Atgriež { tasks, skipped } (tasks gatavi uzvednei) vai null, ja eksāmens nav atrasts.
export async function loadGradable(docId, answers) {
  const ids = Object.keys(answers).map(Number).filter(Number.isInteger).slice(0, GRADE_BATCH * 8);
  if (!ids.length) return { tasks: [], skipped: [] };
  const { rows } = await query(
    `SELECT t.id, t.number, t.topic, t.context, t.figure, t.text, t.points, t.answer, t.solution
     FROM exam_tasks t WHERE t.doc_id = $1 AND t.kind <> 'choice' AND t.id = ANY($2::int[])`,
    [docId, ids]
  );
  const tasks = [];
  const skipped = [];
  for (const t of rows) {
    const student = String(answers[t.id] || '').trim();
    const criteria = [t.answer, t.solution !== t.answer ? t.solution : ''].filter(Boolean).join('\n');
    if (!student || !criteria) { skipped.push(t.id); continue; }
    tasks.push({
      id: t.id, number: t.number, topic: t.topic, context: t.context, figure: t.figure, text: t.text,
      points: Number(t.points) > 0 ? Number(t.points) : 1, criteria, studentAnswer: student,
    });
  }
  return { tasks, skipped };
}

// Viens DeepSeek izsaukums līdz GRADE_BATCH uzdevumiem. Atgriež { results, usage, model, missing }.
export async function gradeBatch(tasks) {
  const { reply, usage, model } = await askDeepSeek(buildGradeMessages(tasks), { maxTokens: 2500, temperature: 0.1, json: true });
  const results = parseGrades(reply, tasks);
  const missing = tasks.filter((t) => !results[t.id]).map((t) => t.id);
  return { results, usage, model, missing };
}
