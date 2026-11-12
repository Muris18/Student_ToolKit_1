// Sesijas sīkdatne: HttpOnly (JavaScript to nevar nolasīt, tāpēc XSS nenozog sesiju), SameSite=Lax, Secure produkcijā.
// Izsauc: src/pages/api/auth/{login,register,logout}.js, src/pages/api/me/{index,password}.js, src/server/db.js (userFromReq).
// COOKIE_SECURE=0 izslēdz Secure karogu (tikai ja lokāli produkcijas režīmā strādā bez HTTPS, piem. Safari uz localhost).
export const SESSION_COOKIE = 'sp_session';
const MAX_AGE = 30 * 24 * 3600; // tāds pats kā sessions.expires_at (30 dienas)

const secure = () => process.env.COOKIE_SECURE !== '0' && process.env.NODE_ENV === 'production';

export function readCookie(req, name = SESSION_COOKIE) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      try { return decodeURIComponent(part.slice(i + 1).trim()); } catch (e) { return null; }
    }
  }
  return null;
}

const build = (value, maxAge) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure() ? '; Secure' : ''}`;

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', build(encodeURIComponent(token), MAX_AGE));
}
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', build('', 0));
}

// CSRF aizsardzība pieprasījumiem ar sīkdatni: ne-lasīšanas metodēm Origin (vai Referer) jāsakrīt ar šo vietni.
// Pārlūki Origin vienmēr pievieno POST/PUT/PATCH/DELETE; svešas vietnes pieprasījums tiek noraidīts.
export function sameOrigin(req) {
  const m = req.method;
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return true;
  const src = req.headers.origin || req.headers.referer;
  if (!src) return false;
  let host;
  try { host = new URL(src).host; } catch (e) { return false; }
  const own = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  return host === own;
}
