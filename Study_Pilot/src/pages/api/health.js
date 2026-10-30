import { db, query } from '../../server/db';

// Readiness includes PostgreSQL: the app cannot serve accounts without it.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await query('SELECT 1');
    res.status(200).json({ ok: true, database: 'connected', bootId: db.bootId, startedAt: db.startedAt });
  } catch {
    res.status(503).json({ ok: false, database: 'unavailable', error: 'Datubāze nav pieejama' });
  }
}
