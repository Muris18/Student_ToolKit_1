// Kopīgi palīgi datubāzes testiem. Testa konti ir it-*@example.test un tiek dzēsti pēc testiem.
import crypto from 'crypto';

export const hasDb = Boolean(process.env.DATABASE_URL);
export const PASSWORD = 'Testa-Parole-12345';

export const mkUser = (db, tag, { plan = 'free', consent = true, verified = true } = {}) =>
  db.createUser({
    email: `it-${tag}-${crypto.randomBytes(3).toString('hex')}@example.test`,
    password: PASSWORD,
    profile: { firstName: 'Tests', lastName: tag, level: 'klase', grade: 12 },
    verified,
  }).then(async (u) => {
    if (plan !== 'free') await db.query('UPDATE users SET plan = $2 WHERE id = $1', [u.id, plan]);
    if (consent) await db.query('UPDATE users SET ai_consent_at = now() WHERE id = $1', [u.id]);
    return db.findById(u.id);
  });

export const cleanup = (db) => db.query("DELETE FROM users WHERE email LIKE 'it-%@example.test'");

// Vienkārši pieprasījuma/atbildes atdarinājumi Next.js API apstrādātājiem
export function mockReq({ method = 'POST', body = {}, query = {}, headers = {}, ip = '10.9.0.1', cookie } = {}) {
  return {
    method, body, query,
    headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'x-forwarded-for': ip, ...(cookie ? { cookie: `sp_session=${cookie}` } : {}), ...headers },
    socket: { remoteAddress: ip },
  };
}
export function mockRes() {
  const r = {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k, v) { r.headers[k.toLowerCase()] = v; return r; },
    status(c) { r.statusCode = c; return r; },
    json(b) { r.body = b; return r; },
    end() { return r; },
  };
  return r;
}
export const sessionFrom = (res) => (String(res.headers['set-cookie'] || '').match(/sp_session=([0-9a-f]{64})/) || [])[1];
export const uniqueIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
