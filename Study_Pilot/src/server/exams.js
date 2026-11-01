// Valsts eksāmenu materiāli: saraksts skolēniem, uzdevumi bez atbildēm, atbildes pārbaude, imports.
import { query } from './db';

const { validate, normalizeTask } = require('../../scripts/import-exams');
export { validate, normalizeTask };

// "A) teksts\nB) teksts" -> [{ key: 'A', text: 'teksts' }, ...]
export function parseOptions(options) {
  return String(options || '')
    .split('\n')
    .map((l) => l.match(/^\s*([A-ZĀČĒĢĪĶĻŅŠŪŽ0-9]+)\)\s*(.*)$/))
    .filter(Boolean)
    .map((m) => ({ key: m[1], text: m[2] }));
}

export async function listDocs(grade) {
  const { rows } = await query(
    `SELECT d.id, d.subject, d.grade, d.year, d.session, d.title, d.source_url,
            count(t.id)::int AS tasks
     FROM exam_documents d LEFT JOIN exam_tasks t ON t.doc_id = d.id
     WHERE ($1::int IS NULL OR d.grade = $1)
     GROUP BY d.id ORDER BY d.grade, d.subject, d.year DESC, d.session`,
    [grade || null]
  );
  return rows;
}

// Uzdevumi skolēnam: bez pareizās atbildes un risinājuma
export async function docWithTasks(id) {
  const doc = (await query('SELECT id, subject, grade, year, session, title, source_url FROM exam_documents WHERE id = $1', [id])).rows[0];
  if (!doc) return null;
  const { rows } = await query(
    `SELECT id, number, section, topic, kind, options, context, figure, text, points, (answer <> '') AS has_answer
     FROM exam_tasks WHERE doc_id = $1`,
    [id]
  );
  // Dabiskā secība: 1.1, 1.2, ..., 1.10, 2.1
  const key = (n) => String(n).split(/[^0-9]+/).filter(Boolean).map((x) => x.padStart(4, '0')).join('.');
  rows.sort((a, b) => key(a.number).localeCompare(key(b.number)) || String(a.number).localeCompare(String(b.number)));
  return { ...doc, tasks: rows.map((t) => ({ ...t, options: parseOptions(t.options) })) };
}

const norm = (s) => String(s || '').trim().toUpperCase().replace(/[\s.)]/g, '');

// Testa uzdevuma pārbaude. Atvērtos uzdevumus pārbauda AI skolotājs.
export async function checkAnswer(taskId, answer) {
  const t = (await query('SELECT id, kind, answer, solution FROM exam_tasks WHERE id = $1', [taskId])).rows[0];
  if (!t) return null;
  if (t.kind !== 'choice' || !t.answer) return { kind: t.kind, checkable: false };
  // Pareizā atbilde var būt "B" vai "B) teksts" vai vairāki burti "A, C"
  const correctKeys = t.answer.split(/[,;]/).map((x) => norm(x.split(')')[0])).filter(Boolean).sort().join(',');
  const givenKeys = String(answer || '').split(/[,;]/).map(norm).filter(Boolean).sort().join(',');
  const correct = Boolean(givenKeys) && givenKeys === correctKeys;
  return { kind: 'choice', checkable: true, correct, solution: correct ? t.solution : '' };
}

// Eksāmena saglabāšana (tas pats formāts kā exams/*.json; atkārtota augšupielāde atjaunina)
export async function saveDoc(pool, d) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const doc = await client.query(
      `INSERT INTO exam_documents (subject, grade, year, session, title, source_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (subject, grade, year, session)
       DO UPDATE SET title = EXCLUDED.title, source_url = EXCLUDED.source_url
       RETURNING id`,
      [d.subject.trim().toLowerCase(), Number(d.grade), d.year, (d.session || '').trim(),
       d.title || `${d.subject} ${d.grade}. klase ${d.year}`, d.source_url || '']
    );
    const docId = doc.rows[0].id;
    for (const raw of d.tasks) {
      const t = normalizeTask(raw, d);
      await client.query(
        `INSERT INTO exam_tasks (doc_id, number, section, topic, kind, options, context, figure, text, points, answer, solution)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (doc_id, number)
         DO UPDATE SET section = EXCLUDED.section, topic = EXCLUDED.topic, kind = EXCLUDED.kind,
                       options = EXCLUDED.options, context = EXCLUDED.context, figure = EXCLUDED.figure,
                       text = EXCLUDED.text, points = EXCLUDED.points, answer = EXCLUDED.answer,
                       solution = EXCLUDED.solution`,
        [docId, t.number, t.section, t.topic, t.kind, t.options, t.context, t.figure, t.text, t.points, t.answer, t.solution]
      );
    }
    await client.query('COMMIT');
    return docId;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
