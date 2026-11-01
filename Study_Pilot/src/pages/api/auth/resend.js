import { createEmailToken } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { emailEnabled, sendVerifyEmail } from '../../../server/email';

// POST -> vēlreiz nosūta apstiprinājuma e-pastu pieslēgtajam lietotājam
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (!emailEnabled()) return res.status(503).json({ error: 'E-pasta sūtīšana nav ieslēgta' });
  if (user.emailVerifiedAt) return res.status(200).json({ ok: true, already: true });
  if (limited(res, `resend:${user.id}`, 3, 3600, 'Apstiprinājuma e-pastu var sūtīt līdz 3 reizēm stundā.')) return;
  try {
    await sendVerifyEmail(user.email, await createEmailToken(user.id, 'verify', 48));
  } catch (e) {
    return res.status(502).json({ error: 'E-pastu neizdevās nosūtīt. Pamēģini vēlāk.' });
  }
  res.status(200).json({ ok: true });
}
