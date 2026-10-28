import { setAiConsent } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';

// POST   -> lietotājs piekrīt datu nosūtīšanai uz DeepSeek (saglabā laiku)
// DELETE -> atsauc piekrišanu
export default async function handler(req, res) {
  if (!allow(req, res, ['POST', 'DELETE'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const aiConsentAt = await setAiConsent(user.id, req.method === 'POST');
  res.status(200).json({ aiConsentAt });
}
