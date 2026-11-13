import { allow, requireUser } from '../../../../server/http';
import { limited } from '../../../../server/security';
import { hostAction, sendRoomError } from '../../../../server/rooms';

export const config = { api: { bodyParser: { sizeLimit: '512kb' } } };

// POST { type: timer|set-exam|set-own|start|finish|new-round|kick|close, ... } -> tikai istabas īpašniekam (citiem 403)
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `room-host:${user.id}`, 120, 300)) return;
  try {
    res.status(200).json(await hostAction(user, req.query.code, req.body || {}));
  } catch (e) {
    sendRoomError(res, e);
  }
}
