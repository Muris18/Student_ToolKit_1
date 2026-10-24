import { db, createSession, findByEmail, checkPassword, publicUser } from '../../../server/db';
import { allow } from '../../../server/http';

export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const { email, password } = req.body || {};
  const user = await findByEmail(email);
  if (!user || !checkPassword(user, password)) return res.status(401).json({ error: 'Nepareizs e-pasts vai parole' });
  const token = await createSession(user.id);
  res.status(200).json({ token, bootId: db.bootId, user: publicUser(user), data: user.data });
}
