import { allow, requireUser } from '../../../server/http';
import { checkAnswer } from '../../../server/exams';
import { limited } from '../../../server/security';

// POST { taskId, answer } -> { correct } testa uzdevumiem
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `check:${user.id}`, 120, 600, 'Pārāk daudz pārbaužu. Pagaidi mazliet.')) return;
  const id = parseInt(req.body?.taskId, 10);
  const r = Number.isInteger(id) ? await checkAnswer(id, String(req.body?.answer || '').slice(0, 50)) : null;
  if (!r) return res.status(404).json({ error: 'Uzdevums nav atrasts' });
  res.status(200).json(r);
}
