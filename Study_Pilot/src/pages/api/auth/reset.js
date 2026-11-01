import { consumeEmailToken, findById, passwordProblem, setPassword, markEmailVerified } from '../../../server/db';
import { allow } from '../../../server/http';
import { clientIp, limited } from '../../../server/security';

// POST { token, password } -> jauna parole; visas iepriekšējās sesijas tiek izbeigtas
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (limited(res, `reset:${clientIp(req)}`, 10, 3600)) return;
  const { token, password } = req.body || {};
  const userId = await consumeEmailToken(token, 'reset');
  if (!userId) return res.status(400).json({ error: 'Saite ir nederīga vai beigusies. Pieprasi jaunu.' });
  const user = await findById(userId);
  if (!user) return res.status(400).json({ error: 'Konts nav atrasts' });
  const err = passwordProblem(password, user.email);
  if (err) return res.status(400).json({ error: err, retry: true });
  await setPassword(userId, password);
  // Saite atnāca uz šo e-pastu, tātad e-pasts ir apstiprināts
  await markEmailVerified(userId);
  res.status(200).json({ ok: true });
}
