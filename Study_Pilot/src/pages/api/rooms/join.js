import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { joinRoom, sendRoomError } from '../../../server/rooms';

// POST { code } -> { code }   pievienošanās istabai (kods vai saite, ko klients jau notīrījis; serveris normalizē pats)
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `rooms-join:${user.id}`, 20, 600, 'Pārāk daudz mēģinājumu pievienoties. Pamēģini pēc dažām minūtēm.')) return;
  try {
    res.status(200).json({ code: await joinRoom(user, req.body?.code) });
  } catch (e) {
    sendRoomError(res, e);
  }
}
