import { allow, requireUser } from '../../../server/http';
import { stripeEnabled, createCheckout } from '../../../server/stripe';
import { emailEnabled } from '../../../server/email';
import { limited } from '../../../server/security';

// POST { waiver: true, adult: true } -> { url } uz Stripe Checkout lapu
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (!stripeEnabled()) return res.status(503).json({ error: 'Maksājumi vēl nav ieslēgti' });
  if (user.plan === 'premium') return res.status(409).json({ error: 'Tev jau ir Premium' });
  if (emailEnabled() && !user.emailVerifiedAt) return res.status(403).json({ error: 'Vispirms apstiprini savu e-pastu', code: 'EMAIL_UNVERIFIED' });
  if (req.body?.adult !== true) return res.status(400).json({ error: 'Jāapstiprina, ka esi pilngadīgs vai tev ir vecāku atļauja' });
  if (req.body?.waiver !== true) return res.status(400).json({ error: 'Jāpiekrīt, ka Premium sāk darboties uzreiz' });
  if (limited(res, `checkout:${user.id}`, 10, 3600)) return;
  try {
    res.status(200).json({ url: await createCheckout(user) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
