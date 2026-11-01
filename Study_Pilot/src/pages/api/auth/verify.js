import { consumeEmailToken, markEmailVerified } from '../../../server/db';
import { allow } from '../../../server/http';
import { clientIp, limited } from '../../../server/security';

// POST { token } -> e-pasts apstiprināts
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (limited(res, `verify:${clientIp(req)}`, 20, 3600)) return;
  const userId = await consumeEmailToken(req.body?.token, 'verify');
  if (!userId) return res.status(400).json({ error: 'Saite ir nederīga vai beigusies. Pieslēdzies un pieprasi jaunu.' });
  await markEmailVerified(userId);
  res.status(200).json({ ok: true });
}
