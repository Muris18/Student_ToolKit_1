import { peekEmailToken, resetPasswordWithToken, findById, passwordProblem } from '../../../server/db';
import { allow } from '../../../server/http';
import { clientIp, limited } from '../../../server/security';

const INVALID = 'Saite ir nederīga vai beigusies. Pieprasi jaunu.';

// POST { token, password } -> jauna parole; visas iepriekšējās sesijas tiek izbeigtas
// Secība: 1) žetonu NOLASA (neiztērējot), 2) pārbauda jauno paroli, 3) tikai tad atomāri iztērē žetonu un nomaina paroli.
// Ja parole ir pārāk vienkārša, saite paliek derīga un lietotājs var mēģināt vēlreiz.
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (limited(res, `reset:${clientIp(req)}`, 10, 3600)) return;
  const { token, password } = req.body || {};
  const userId = await peekEmailToken(token, 'reset');
  if (!userId) return res.status(400).json({ error: INVALID });
  const user = await findById(userId);
  if (!user) return res.status(400).json({ error: 'Konts nav atrasts' });
  const err = passwordProblem(password, user.email);
  if (err) return res.status(400).json({ error: err, retry: true });
  // Atomāri: žetons tiek iztērēts un parole nomainīta vienā transakcijā; divi vienlaicīgi pieprasījumi nevar abi izdoties
  const done = await resetPasswordWithToken(token, password);
  if (!done) return res.status(400).json({ error: INVALID });
  res.status(200).json({ ok: true });
}
