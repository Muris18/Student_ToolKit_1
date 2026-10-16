import { db, createUser, createSession, findByEmail, publicUser, cleanProfile, validateProfile } from '../../../server/db';
import { allow } from '../../../server/http';

export default function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const { email, password, profile } = req.body || {};
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Nederīgs e-pasts' });
  if (String(password || '').length < 6) return res.status(400).json({ error: 'Parolei jābūt vismaz 6 simbolus garai' });
  const p = cleanProfile(profile);
  const err = validateProfile(p);
  if (err) return res.status(400).json({ error: err });
  if (findByEmail(e)) return res.status(409).json({ error: 'Šis e-pasts jau ir reģistrēts' });

  const user = createUser({ email: e, password, profile: p });
  const token = createSession(user.id);
  res.status(201).json({ token, bootId: db.bootId, user: publicUser(user), data: user.data });
}
