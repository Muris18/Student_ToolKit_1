// Drošība: klienta IP, pieslēgšanās mēģinājumu limits un vienkāršs pieprasījumu limits.
import { query } from './db';

// Caddy padod īsto klienta IP X-Forwarded-For galvenē. Lietotne no interneta tieši nav pieejama
// (docker-compose neatver 3000. portu), tāpēc šai galvenei var uzticēties.
export function clientIp(req) {
  const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return (xff || req.socket?.remoteAddress || 'unknown').slice(0, 64);
}

// Pieslēgšanās limits (nav pārāk stingrs):
// - 5 nepareizas paroles vienam e-pastam 15 minūtēs -> šim e-pastam pauze līdz 15 min
// - 30 nepareizas paroles no vienas IP 15 minūtēs -> šai IP pauze (aizsardzība pret minēšanu daudziem kontiem)
export const LOGIN_LIMITS = { perEmail: 5, perIp: 30, windowMin: 15 };

export async function loginBlockedFor(email, ip) {
  const { rows } = await query(
    `SELECT
       count(*) FILTER (WHERE email = $1) AS by_email,
       count(*) FILTER (WHERE ip = $2) AS by_ip,
       max(created_at) FILTER (WHERE email = $1) AS last_email,
       max(created_at) FILTER (WHERE ip = $2) AS last_ip
     FROM login_attempts
     WHERE NOT ok AND created_at > now() - make_interval(mins => $3) AND (email = $1 OR ip = $2)`,
    [email, ip, LOGIN_LIMITS.windowMin]
  );
  const r = rows[0];
  const minutesLeft = (last) => Math.max(1, Math.ceil((new Date(last).getTime() + LOGIN_LIMITS.windowMin * 60000 - Date.now()) / 60000));
  if (Number(r.by_email) >= LOGIN_LIMITS.perEmail) return minutesLeft(r.last_email);
  if (Number(r.by_ip) >= LOGIN_LIMITS.perIp) return minutesLeft(r.last_ip);
  return 0;
}

export async function recordLogin(email, ip, ok) {
  await query('INSERT INTO login_attempts (email, ip, ok) VALUES ($1,$2,$3)', [email, ip, ok]);
  // Veiksmīga pieslēgšanās notīra šī e-pasta neveiksmīgos mēģinājumus
  if (ok) await query('DELETE FROM login_attempts WHERE email = $1 AND NOT ok', [email]);
}

// Vienkāršs atmiņas limits citām darbībām (reģistrācija, paroles atjaunošana, e-pasta sūtīšana).
// Vienam serverim ar vienu lietotnes konteineru tas ir pietiekami.
const g = globalThis;
g.__SP_RATE__ = g.__SP_RATE__ || new Map();

export function rateLimit(key, max, windowSec) {
  const now = Date.now();
  const arr = (g.__SP_RATE__.get(key) || []).filter((t) => now - t < windowSec * 1000);
  if (arr.length >= max) {
    g.__SP_RATE__.set(key, arr);
    return Math.ceil((arr[0] + windowSec * 1000 - now) / 1000);
  }
  arr.push(now);
  g.__SP_RATE__.set(key, arr);
  if (g.__SP_RATE__.size > 5000) {
    for (const [k, v] of g.__SP_RATE__) if (!v.length || now - v[v.length - 1] > 3600 * 1000) g.__SP_RATE__.delete(k);
  }
  return 0;
}

// Atbild ar 429, ja limits pārsniegts. Atgriež true, ja pieprasījums jāpārtrauc.
export function limited(res, key, max, windowSec, msg = 'Pārāk daudz mēģinājumu. Pamēģini vēlāk.') {
  const wait = rateLimit(key, max, windowSec);
  if (!wait) return false;
  res.setHeader('Retry-After', String(wait));
  res.status(429).json({ error: msg });
  return true;
}
