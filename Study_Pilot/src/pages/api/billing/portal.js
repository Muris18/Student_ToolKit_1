import { allow, requireUser } from '../../../server/http';
import { stripeEnabled, createPortal } from '../../../server/stripe';

// POST -> { url } uz Stripe klientu portālu (kartes maiņa, rēķini, atcelšana)
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (!stripeEnabled() || !user.stripeCustomerId) return res.status(404).json({ error: 'Tev nav abonementa' });
  try {
    res.status(200).json({ url: await createPortal(user) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
