import { verifyWebhook, handleEvent } from '../../../server/stripe';

// Stripe sūta notikumus šeit: https://<domēns>/api/billing/webhook
// Vajag neapstrādātu (raw) ķermeni paraksta pārbaudei, tāpēc Next.js bodyParser ir izslēgts.
export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1024 * 1024) throw new Error('too large');
    chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  let body;
  try { body = await rawBody(req); } catch { return res.status(413).end(); }
  if (!verifyWebhook(body, req.headers['stripe-signature'])) return res.status(400).json({ error: 'Nederīgs paraksts' });
  let event;
  try { event = JSON.parse(body); } catch { return res.status(400).json({ error: 'Nederīgs JSON' }); }
  try {
    const result = await handleEvent(event);
    res.status(200).json({ received: true, result });
  } catch (e) {
    console.error('Stripe webhook kļūda:', e.message);
    // 500 -> Stripe mēģinās vēlreiz; notikumu atzīmējam kā neapstrādātu
    const { query } = await import('../../../server/db');
    await query('DELETE FROM stripe_events WHERE id = $1', [event.id]).catch(() => {});
    res.status(500).json({ error: 'Apstrāde neizdevās' });
  }
}
