import { allow, requireUser } from '../../../../server/http';
import { limited } from '../../../../server/security';
import { roomState, leaveRoom, sendRoomError } from '../../../../server/rooms';

// GET    -> istabas stāvoklis (aptauja ik pēc 3 s)
// DELETE -> iziet no istabas
export default async function handler(req, res) {
  if (!allow(req, res, ['GET', 'DELETE'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `room:${user.id}`, 100, 60)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'DELETE') return res.status(200).json(await leaveRoom(user, req.query.code));
    res.status(200).json(await roomState(user, req.query.code));
  } catch (e) {
    sendRoomError(res, e);
  }
}
