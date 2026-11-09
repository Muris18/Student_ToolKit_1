import { allow, requireUser } from '../../../server/http';
import { openTaskAnswer } from '../../../server/exams';
import { limited } from '../../../server/security';

// POST { taskId } -> { answer, solution } atvērtajiem uzdevumiem (atbildes paraugs pēc paša mēģinājuma)
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `answer:${user.id}`, 120, 600, 'Pārāk daudz pieprasījumu. Pagaidi mazliet.')) return;
  const id = parseInt(req.body?.taskId, 10);
  const r = Number.isInteger(id) ? await openTaskAnswer(id) : null;
  if (!r) return res.status(404).json({ error: 'Atbildes paraugs nav pieejams' });
  res.status(200).json(r);
}
