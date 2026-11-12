import { publicUser, deleteUser, updateProfile, cleanProfile, validateProfile, db } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';
import { cancelOnDelete } from '../../../server/stripe';

// GET    -> lietotājs + visi viņa dati
// PATCH  -> profila labošana { profile }
// DELETE -> dzēst kontu
export default async function handler(req, res) {
  if (!allow(req, res, ['GET', 'PATCH', 'DELETE'])) return;
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return res.status(200).json({ bootId: db.bootId, user: publicUser(user), data: user.data, dataVersion: user.dataVersion });
  }
  if (req.method === 'PATCH') {
    const p = cleanProfile({ ...user.profile, ...(req.body?.profile || {}) });
    const err = validateProfile(p);
    if (err) return res.status(400).json({ error: err });
    await updateProfile(user.id, p);
    user.profile = p;
    return res.status(200).json({ user: publicUser(user) });
  }
  // Aktīvs Stripe abonements tiek atcelts, lai par dzēstu kontu nauda vairs netiktu norakstīta
  await cancelOnDelete(user);
  await deleteUser(user.id);
  return res.status(200).json({ ok: true });
}
