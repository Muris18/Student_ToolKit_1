import { allow, requireUser } from '../../../../server/http';
import { limited } from '../../../../server/security';
import { setMe, sendRoomError } from '../../../../server/rooms';

// PATCH { status: 'studying'|'break', topic } -> mans statuss un tēma istabā
export default async function handler(req, res) {
  if (!allow(req, res, ['PATCH'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `room-me:${user.id}`, 60, 60)) return;
  try {
    res.status(200).json(await setMe(user, req.query.code, req.body));
  } catch (e) {
    sendRoomError(res, e);
  }
}
