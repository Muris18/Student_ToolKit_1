import { db, userFromReq } from '../../../server/db';
import { allow } from '../../../server/http';

export default function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const { token } = userFromReq(req);
  if (token) db.sessions.delete(token);
  res.status(200).json({ ok: true });
}
