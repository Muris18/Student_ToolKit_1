import { userFromReq, db, maybeCleanup } from './db';

export function allow(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'Metode nav atļauta' });
  return false;
}

// Atgriež lietotāju vai nosūta 401 un atgriež null
export async function requireUser(req, res) {
  maybeCleanup(); // beigušās sesijas un neaktīvie konti, ne biežāk kā reizi 6 h
  const { user } = await userFromReq(req);
  if (!user) {
    res.status(401).json({ error: 'Nav pieslēgts', bootId: db.bootId });
    return null;
  }
  return user;
}

// Tikai administratoriem: citādi 403
export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Nav piekļuves' });
    return null;
  }
  return user;
}
