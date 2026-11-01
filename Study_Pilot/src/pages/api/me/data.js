import { emptyData, saveData } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';
import { FREE_LIMITS, isPremium } from '../../../lib/plans';

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
  // Bezmaksas plāna limits: drīkst nepievienot vairāk par limitu (esošie ieraksti paliek arī pēc Premium beigām)
  if (!isPremium(user)) {
    for (const key of Object.keys(FREE_LIMITS)) {
      const before = (user.data?.[key] || []).length;
      if (next[key].length > before && next[key].length > FREE_LIMITS[key]) {
        return res.status(402).json({ error: `Bezmaksas plānā var būt līdz ${FREE_LIMITS[key]} ${key === 'quizzes' ? 'saviem testiem' : 'saviem uzdevumiem'}. Premium — bez ierobežojuma.`, code: 'PLAN_LIMIT' });
      }
    }
  }
  await saveData(user.id, next);
  res.status(200).json({ ok: true });
}
