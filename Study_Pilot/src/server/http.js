import { userFromReq, db } from './db';

export function allow(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'Metode nav atļauta' });
  return false;
}

// Atgriež lietotāju vai nosūta 401 un atgriež null
export function requireUser(req, res) {
  const { user } = userFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Nav pieslēgts', bootId: db.bootId });
    return null;
  }
  return user;
}
