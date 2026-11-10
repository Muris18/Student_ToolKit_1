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
  rows.sort((a, b) => taskOrder(a.number).localeCompare(taskOrder(b.number)) || String(a.number).localeCompare(String(b.number)));
  return { ...doc, tasks: rows.map((t) => ({ ...t, options: parseOptions(t.options) })) };
}

// Dabiskā secība: 1.1, 1.2, ..., 1.10, 2.1, tad II.1, II.2, III.1, IV.1 (daļas romiešu cipariem),
// beigās rakstīšanas uzdevumi bez daļas numura (W, W-A, W1).
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
export function taskOrder(number) {
  const n = String(number).trim();
  const m = n.match(/^(IV|V|I{1,3})(?=$|[.\s-])[.\s-]*(.*)$/);
  const part = m ? ROMAN[m[1]] : /^\d/.test(n) ? 1 : 9;
  const rest = m ? m[2] : n;
  const digits = rest.split(/[^0-9]+/).filter(Boolean).map((x) => x.padStart(4, '0')).join('.');
  return `${part}|${digits}`;
}

const norm = (s) => String(s || '').trim().toUpperCase().replace(/[\s.)]/g, '');

// Pareizā atbilde var būt "B", "B) teksts", "B – teksts" vai vairāki burti "A, C".
// Ņem katras daļas sākuma burtu/ciparu un patur tikai tos, kas ir starp atbilžu variantiem.
export function answerKeys(answer, keys) {
  const valid = new Set(keys.map(norm));
  const out = String(answer || '').split(/[,;]/)
    .map((x) => norm((x.trim().match(/^([A-Za-zĀ-ž0-9]+)(?=$|[\s.)–-])/) || [])[1]))
    .filter((k) => k && valid.has(k));
  return [...new Set(out)];
}

// Testa uzdevuma pārbaude. Atvērtos uzdevumus pārbauda AI skolotājs.
export async function checkAnswer(taskId, answer) {
  const t = (await query('SELECT id, kind, options, answer, solution FROM exam_tasks WHERE id = $1', [taskId])).rows[0];
  if (!t) return null;
  if (t.kind !== 'choice' || !t.answer) return { kind: t.kind, checkable: false };
  const correctKeys = answerKeys(t.answer, parseOptions(t.options).map((o) => o.key)).sort().join(',');
  if (!correctKeys) return { kind: t.kind, checkable: false };
  const givenKeys = String(answer || '').split(/[,;]/).map(norm).filter(Boolean).sort().join(',');
  const correct = Boolean(givenKeys) && givenKeys === correctKeys;
  return { kind: 'choice', checkable: true, correct, solution: correct ? t.solution : '' };
}

// Eksāmena simulācijas vērtēšana: visa eksāmena atbildes vienā pieprasījumā.
// answers: { [taskId]: "B" } testa jautājumiem; atvērtajiem atbildes tekstu serveris nevērtē.
// Testa jautājumiem atgriež, vai pareizi, un pareizo variantu; atvērtajiem — atbildes paraugu pašvērtējumam.
export async function gradeExam(docId, answers = {}) {
  const doc = (await query('SELECT id FROM exam_documents WHERE id = $1', [docId])).rows[0];
  if (!doc) return null;
  const { rows } = await query(
    'SELECT id, kind, options, answer, solution, points FROM exam_tasks WHERE doc_id = $1',
    [docId]
  );
  const tasks = rows.map((t) => {
    const points = Number(t.points) > 0 ? Number(t.points) : 1;
    if (t.kind === 'choice') {
      const correctKeys = answerKeys(t.answer, parseOptions(t.options).map((o) => o.key)).sort();
      if (!correctKeys.length) return { id: t.id, kind: 'choice', checkable: false, points };
      const given = String(answers[t.id] || '').split(/[,;]/).map(norm).filter(Boolean).sort().join(',');
      return {
        id: t.id, kind: 'choice', checkable: true, points,
        correct: Boolean(given) && given === correctKeys.join(','),
        correctKeys: correctKeys.join(', '), solution: t.solution || '',
      };
    }
    return { id: t.id, kind: t.kind, checkable: false, points, answer: t.answer || '', solution: t.solution || '' };
  });
  return { tasks };
}

// Atvērtā uzdevuma atbildes paraugs (testa uzdevumiem atbildi atklāj tikai pārbaude)
export async function openTaskAnswer(taskId) {
  const t = (await query('SELECT kind, answer, solution FROM exam_tasks WHERE id = $1', [taskId])).rows[0];
  if (!t || t.kind === 'choice' || !(t.answer || t.solution)) return null;
  return { answer: t.answer, solution: t.solution };
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
