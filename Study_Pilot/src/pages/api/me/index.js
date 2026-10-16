import { publicUser, deleteUser, cleanProfile, validateProfile, db } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';

// GET    -> lietotājs + visi viņa dati
// PATCH  -> profila labošana { profile }
// DELETE -> dzēst kontu
export default function handler(req, res) {
  if (!allow(req, res, ['GET', 'PATCH', 'DELETE'])) return;
  const user = requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return res.status(200).json({ bootId: db.bootId, user: publicUser(user), data: user.data });
  }
  if (req.method === 'PATCH') {
    const p = cleanProfile({ ...user.profile, ...(req.body?.profile || {}) });
    const err = validateProfile(p);
    if (err) return res.status(400).json({ error: err });
    user.profile = p;
    return res.status(200).json({ user: publicUser(user) });
  }
  deleteUser(user.id);
  return res.status(200).json({ ok: true });
}
