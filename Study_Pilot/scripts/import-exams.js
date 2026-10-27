// Ielādē eksāmenus no exams/*.json datubāzē (atkārtoti drīkst palaist — atjaunina esošos).
// Faili, kuru nosaukums sākas ar "_", tiek izlaisti (paraugi).
const fs = require('fs');
const path = require('path');
const { connect } = require('./lib');

const need = (cond, msg) => { if (!cond) throw new Error(msg); };

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
  });
}

(async () => {
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
      for (const t of d.tasks) {
        await client.query(
          `INSERT INTO exam_tasks (doc_id, number, section, topic, text, points, answer, solution)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (doc_id, number)
           DO UPDATE SET section = EXCLUDED.section, topic = EXCLUDED.topic, text = EXCLUDED.text,
                         points = EXCLUDED.points, answer = EXCLUDED.answer, solution = EXCLUDED.solution`,
          [doc.rows[0].id, String(t.number).trim(), t.section || '', t.topic || '', t.text.trim(),
           Number.isInteger(t.points) ? t.points : null, t.answer || '', t.solution || '']
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
})().catch((e) => { console.error(e.message); process.exit(1); });
