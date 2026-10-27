// Ielādē eksāmenus no exams/*.json datubāzē (atkārtoti drīkst palaist — atjaunina esošos).
// Faili, kuru nosaukums sākas ar "_", tiek izlaisti (paraugi). Formātu skat. exams/README.md
const fs = require('fs');
const path = require('path');

const need = (cond, msg) => { if (!cond) throw new Error(msg); };

// Testa varianti: masīvs ["...", "..."] vai objekts {"A": "...", "B": "..."} -> "A) ...\nB) ..."
function optionsText(o) {
  if (!o) return '';
  if (Array.isArray(o)) return o.map((v, i) => `${String.fromCharCode(65 + i)}) ${v}`).join('\n');
  return Object.entries(o).map(([k, v]) => `${k}) ${v}`).join('\n');
}

// Apvieno uzdevumu ar tā grupas kopīgajiem laukiem (context, figure, section, topic)
function normalizeTask(t, d) {
  const g = (t.group !== undefined && d.groups && d.groups[t.group]) || {};
  const pick = (k) => (t[k] !== undefined ? t[k] : g[k] !== undefined ? g[k] : '');
  const options = optionsText(t.options);
  return {
    number: String(t.number).trim(),
    section: pick('section'),
    topic: pick('topic'),
    kind: t.kind || (options ? 'choice' : 'open'),
    options,
    context: pick('context'),
    figure: pick('figure'),
    text: String(t.text || '').trim(),
    points: Number.isInteger(t.points) ? t.points : null,
    answer: String(t.answer || ''),
    solution: String(t.solution || ''),
  };
}

function validate(file, d) {
  need(typeof d.subject === 'string' && d.subject.trim(), `${file}: trūkst "subject"`);
  need([9, 12].includes(Number(d.grade)), `${file}: "grade" jābūt 9 vai 12`);
  need(Number.isInteger(d.year) && d.year > 1990, `${file}: "year" jābūt gadam`);
  need(Array.isArray(d.tasks) && d.tasks.length, `${file}: "tasks" ir tukšs`);
  const seen = new Set();
  d.tasks.forEach((t, i) => {
    need(t.number !== undefined && String(t.number).trim(), `${file}: uzdevumam #${i + 1} trūkst "number"`);
    need(typeof t.text === 'string' && t.text.trim().length > 5, `${file}: uzdevumam ${t.number} trūkst "text"`);
    need(!seen.has(String(t.number)), `${file}: dubults uzdevuma numurs ${t.number}`);
    seen.add(String(t.number));
    if (t.group !== undefined) need(d.groups && d.groups[t.group], `${file}: uzdevumam ${t.number} norādīta nezināma grupa "${t.group}"`);
    const n = normalizeTask(t, d);
    need(['choice', 'open'].includes(n.kind), `${file}: uzdevumam ${t.number} "kind" jābūt choice vai open`);
    if (n.kind === 'choice') {
      need(n.options, `${file}: testa uzdevumam ${t.number} trūkst "options"`);
      need(n.answer.trim(), `${file}: testa uzdevumam ${t.number} trūkst "answer"`);
    }
  });
}

async function main() {
  const { connect } = require('./lib');
  const dir = path.join(process.cwd(), 'exams');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')) : [];
  if (!files.length) { console.log('Mapē exams/ nav importējamu .json failu (faili ar "_" sākumā tiek izlaisti).'); return; }

  const docs = files.map((f) => {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { throw new Error(`${f}: nederīgs JSON (${e.message})`); }
    validate(f, d);
    return { f, d };
  });

  const pool = await connect();
  let total = 0;
  for (const { f, d } of docs) {
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
          [doc.rows[0].id, t.number, t.section, t.topic, t.kind, t.options, t.context, t.figure, t.text, t.points, t.answer, t.solution]
        );
      }
      await client.query('COMMIT');
      console.log(`✔ ${f}: ${d.tasks.length} uzdevumi`);
      total += d.tasks.length;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`✘ ${f}:`, e.message);
      process.exitCode = 1;
    } finally {
      client.release();
    }
  }
  console.log(`Kopā importēti ${total} uzdevumi.`);
  await pool.end();
}

module.exports = { validate, normalizeTask, optionsText };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
