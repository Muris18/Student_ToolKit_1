import { allow, requireUser } from '../../../server/http';
import { topicMap } from '../../../server/exams';

// GET ?grade=9|12 -> { subjects: [{ subject, attempted, topics: [{ name, total, attempted, correct, pct, lastAt }] }] }
// Tēmu karte progresa lapai (pēc lietotāja valsts eksāmenu uzdevumu mēģinājumiem).
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const g = parseInt(req.query.grade, 10);
  res.status(200).json({ subjects: await topicMap(user.data, [9, 12].includes(g) ? g : null) });
}
