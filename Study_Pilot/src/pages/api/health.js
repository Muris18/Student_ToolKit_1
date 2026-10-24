import { db } from '../../server/db';

// Vienkārša dzīvības pārbaude
export default function handler(req, res) {
  res.status(200).json({ ok: true, bootId: db.bootId, startedAt: db.startedAt });
}
