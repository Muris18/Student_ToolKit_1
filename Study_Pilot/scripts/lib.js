// Kopīgi palīgi skriptiem (nav jāinstalē dotenv).
const fs = require('fs');
const path = require('path');

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

async function connect(retries = 20) {
  loadEnv();
  const { Pool } = require('pg');
  if (!process.env.DATABASE_URL) throw new Error('Nav DATABASE_URL (skat. .env.local)');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  for (let i = 1; ; i++) {
    try { await pool.query('SELECT 1'); return pool; } catch (e) {
      if (i >= retries) throw e;
      console.log(`Gaidu datubāzi (${i}/${retries})…`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

module.exports = { connect };
