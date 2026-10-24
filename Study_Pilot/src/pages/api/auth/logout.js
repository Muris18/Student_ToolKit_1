import { deleteSession, userFromReq } from '../../../server/db';
import { allow } from '../../../server/http';

export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const { token } = await userFromReq(req);
  if (token) await deleteSession(token);
  res.status(200).json({ ok: true });
}
