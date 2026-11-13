import { allow, requireUser } from '../../../../server/http';
import { limited } from '../../../../server/security';
import { submitAnswer, setHelp, sendRoomError } from '../../../../server/rooms';

// POST { questionId, choice } -> atbilde uz uzdevumu (pirmā paliek spēkā)
// POST { questionId, help: true|false } -> "Vajag palīdzību" atzīme
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `room-answer:${user.id}`, 200, 600)) return;
  const questionId = String(req.body?.questionId || '').slice(0, 20);
  try {
    if (typeof req.body?.help === 'boolean') return res.status(200).json(await setHelp(user, req.query.code, questionId, req.body.help));
    res.status(200).json(await submitAnswer(user, req.query.code, { questionId, choice: req.body?.choice }));
  } catch (e) {
    sendRoomError(res, e);
  }
}
