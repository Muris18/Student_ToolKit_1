// Piemēro db/migrations/*.sql pēc kārtas. Katra tiek izpildīta vienreiz.
const fs = require('fs');
const path = require('path');
const { connect } = require('./lib');

(async () => {
  const pool = await connect();
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const dir = path.join(process.cwd(), 'db', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const done = new Set((await pool.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
  let n = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(dir, f), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [f]);
      await client.query('COMMIT');
      console.log('Piemērots:', f);
      n++;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`Kļūda failā ${f}:`, e.message);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }
  if (!n && !process.exitCode) console.log('Migrācijas jau ir aktuālas.');
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
