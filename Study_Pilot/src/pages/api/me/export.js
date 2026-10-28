import { exportUser } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';

// GET -> visi lietotāja dati JSON formātā ("Lejupielādēt manus datus")
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(await exportUser(user));
}
