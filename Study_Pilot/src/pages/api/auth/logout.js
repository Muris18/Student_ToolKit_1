import { deleteSession, userFromReq } from '../../../server/db';
import { allow } from '../../../server/http';
import { clearSessionCookie, sameOrigin } from '../../../server/cookies';

export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Pieprasījums noraidīts (cits izcelsmes avots)', code: 'CSRF' });
  const { token } = await userFromReq(req);
  if (token) await deleteSession(token);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
