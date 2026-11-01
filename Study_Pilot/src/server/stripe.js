// Stripe Premium abonements bez papildu bibliotēkām (Stripe REST API + fetch).
// Ieslēdzas, ja .env ir STRIPE_SECRET_KEY un STRIPE_PRICE_ID.
//   STRIPE_SECRET_KEY=sk_live_... (vai sk_test_... testēšanai)
//   STRIPE_PRICE_ID=price_...      (abonementa cena no Stripe Dashboard → Product catalog)
//   STRIPE_WEBHOOK_SECRET=whsec_... (Dashboard → Developers → Webhooks → /api/billing/webhook)
import crypto from 'crypto';
import { query } from './db';
import { appUrl } from './email';

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

// {a: 1, b: {c: 2}, d: [{e: 3}]} -> a=1&b[c]=2&d[0][e]=3
function encode(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encode(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out.join('&');
}

async function stripe(method, path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params && method !== 'GET' ? encode(params) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Stripe kļūda', res.status, json?.error?.message);
    const e = new Error('Maksājumu sistēma šobrīd nav pieejama');
    e.code = 'STRIPE';
    throw e;
  }
  return json;
}

async function ensureCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const c = await stripe('POST', 'customers', { email: user.email, metadata: { user_id: user.id } });
  await query('UPDATE users SET stripe_customer_id = $2 WHERE id = $1', [user.id, c.id]);
  return c.id;
}

// Stripe Checkout lapa abonementa iegādei. waiver = lietotājs piekrita, ka pakalpojums sākas uzreiz.
export async function createCheckout(user) {
  const customer = await ensureCustomer(user);
  const session = await stripe('POST', 'checkout/sessions', {
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl()}/premium?status=success`,
    cancel_url: `${appUrl()}/premium?status=cancel`,
    locale: 'auto',
    allow_promotion_codes: 'true',
    subscription_data: { metadata: { user_id: user.id, waiver_at: new Date().toISOString() } },
    metadata: { user_id: user.id },
  });
  return session.url;
}

// Stripe klientu portāls: maksājuma kartes maiņa, rēķini, abonementa atcelšana
export async function createPortal(user) {
  const s = await stripe('POST', 'billing_portal/sessions', { customer: user.stripeCustomerId, return_url: `${appUrl()}/profile` });
  return s.url;
}

// Stripe-Signature: t=...,v1=... ; paraksts = HMAC-SHA256(secret, `${t}.${rawBody}`)
export function verifyWebhook(rawBody, header, secret = process.env.STRIPE_WEBHOOK_SECRET, toleranceSec = 300) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    String(header).split(',').map((p) => p.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k.trim(), v.trim()])
  );
  const sigs = String(header).split(',').filter((p) => p.trim().startsWith('v1=')).map((p) => p.trim().slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

const ACTIVE = ['active', 'trialing'];

// Saskaņo lietotāja plānu ar Stripe abonementa stāvokli.
// Premium, ko piešķīris administrators (plan_source = 'admin'), Stripe neatņem.
export async function syncSubscription(sub) {
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  const userId = sub.metadata?.user_id;
  const periodEnd = sub.current_period_end || sub.items?.data?.[0]?.current_period_end || null;
  const active = ACTIVE.includes(sub.status);
  const { rowCount } = await query(
    `UPDATE users SET
       stripe_customer_id = COALESCE(stripe_customer_id, $2),
       stripe_subscription_id = $3,
       stripe_status = $4,
       premium_until = CASE WHEN $6::bigint IS NULL THEN NULL ELSE to_timestamp($6::bigint) END,
       plan = CASE WHEN $5 THEN 'premium' WHEN plan_source = 'admin' THEN plan ELSE 'free' END,
       plan_source = CASE WHEN $5 THEN 'stripe' WHEN plan_source = 'admin' THEN 'admin' ELSE NULL END
     WHERE stripe_customer_id = $2 OR ($1::text IS NOT NULL AND id::text = $1::text)`,
    [userId || null, customer, sub.id, sub.status, active, periodEnd]
  );
  return rowCount;
}

export async function handleEvent(event) {
  const seen = await query('INSERT INTO stripe_events (id, type) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [event.id, event.type]);
  if (!seen.rowCount) return 'duplicate';
  const obj = event.data?.object || {};
  if (event.type === 'checkout.session.completed' && obj.mode === 'subscription' && obj.subscription) {
    const sub = await stripe('GET', `subscriptions/${obj.subscription}`);
    if (!sub.metadata?.user_id && obj.client_reference_id) sub.metadata = { ...(sub.metadata || {}), user_id: obj.client_reference_id };
    await syncSubscription(sub);
    return 'synced';
  }
  if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.paused', 'customer.subscription.resumed'].includes(event.type)) {
    await syncSubscription(obj);
    return 'synced';
  }
  return 'ignored';
}

// Lietotājs dzēš kontu: atceļam abonementu uzreiz, lai nauda netiktu norakstīta par dzēstu kontu
export async function cancelOnDelete(user) {
  if (!stripeEnabled() || !user.stripeSubscriptionId || !ACTIVE.includes(user.stripeStatus || '')) return;
  try { await stripe('DELETE', `subscriptions/${user.stripeSubscriptionId}`); } catch (e) { console.error('Abonementa atcelšana neizdevās', e.message); }
}
