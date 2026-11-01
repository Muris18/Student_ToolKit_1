import { allow, requireUser } from '../../../server/http';
import { docWithTasks } from '../../../server/exams';

// GET -> eksāmens ar uzdevumiem (bez pareizajām atbildēm)
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const id = parseInt(req.query.id, 10);
  const doc = Number.isInteger(id) ? await docWithTasks(id) : null;
  if (!doc) return res.status(404).json({ error: 'Eksāmens nav atrasts' });
  res.status(200).json(doc);
}
