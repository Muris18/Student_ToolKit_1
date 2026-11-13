import { findByEmail, createEmailToken } from '../../../server/db';
import { allow } from '../../../server/http';
import { clientIp, limited } from '../../../server/security';
import { emailEnabled, sendResetEmail } from '../../../server/email';

// POST { email } -> vienmēr viena un tā pati atbilde, lai nevarētu uzzināt, kuri e-pasti ir reģistrēti
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (!emailEnabled()) return res.status(503).json({ error: 'Paroles atjaunošana pa e-pastu vēl nav ieslēgta. Raksti uz jautajumi@studypilot.lv.' });
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 200);
  if (limited(res, `forgot:${clientIp(req)}`, 5, 3600)) return;
  if (limited(res, `forgot-mail:${email}`, 3, 3600)) return;
  const user = email && (await findByEmail(email));
  if (user && !user.blockedAt) {
    try {
      await sendResetEmail(user.email, await createEmailToken(user.id, 'reset', 1), req.body?.theme);
    } catch (e) {
      console.error('Paroles atjaunošanas e-pasts netika nosūtīts:', e.message);
    }
  }
  res.status(200).json({ ok: true, message: 'Ja šāds konts eksistē, mēs nosūtījām saiti paroles atjaunošanai. Pārbaudi e-pastu (arī mēstules).' });
}
