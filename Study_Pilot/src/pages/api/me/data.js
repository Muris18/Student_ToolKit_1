import { emptyData, saveData } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

// PUT -> saglabā visus lietotāja datus (klients sūta pilnu objektu)
export default async function handler(req, res) {
  if (!allow(req, res, ['PUT'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const incoming = req.body?.data;
  if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error: 'Trūkst datu' });

  const base = emptyData();
  const next = {};
  for (const key of Object.keys(base)) next[key] = Array.isArray(incoming[key]) ? incoming[key] : base[key];
  await saveData(user.id, next);
  res.status(200).json({ ok: true });
}
