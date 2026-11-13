import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { createRoom, listMyRooms, roomConfig, roomsAllowed, maybeCleanupRooms, sendRoomError } from '../../../server/rooms';

// GET  -> { rooms, allowed, premiumOnly, maxMembers }   mani istabu saraksts
// POST { name, mode: 'single'|'mixed', topic } -> { code }   izveide
export default async function handler(req, res) {
  if (!allow(req, res, ['GET', 'POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  maybeCleanupRooms();
  try {
    if (req.method === 'GET') {
      if (limited(res, `rooms:${user.id}`, 60, 60)) return;
      const cfg = roomConfig();
      return res.status(200).json({ rooms: await listMyRooms(user), allowed: roomsAllowed(user), premiumOnly: cfg.premiumOnly, maxMembers: cfg.maxMembers });
    }
    if (limited(res, `rooms-new:${user.id}`, 10, 3600, 'Pārāk daudz jaunu istabu. Pamēģini vēlāk.')) return;
    res.status(201).json({ code: await createRoom(user, req.body) });
  } catch (e) {
    sendRoomError(res, e);
  }
}
