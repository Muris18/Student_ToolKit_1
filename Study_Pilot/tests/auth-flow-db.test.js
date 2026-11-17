import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { hasDb, PASSWORD, mkUser, cleanup, mockReq, mockRes, sessionFrom, uniqueIp } from './helpers/db.js';

// Pieteikšanās plūsma: reģistrācija, ielogošanās, sīkdatņu sesija, izlogošanās, CSRF, mēģinājumu bloķēšana, paroles atjaunošana.
describe.skipIf(!hasDb)('Pieteikšanās plūsma (PostgreSQL)', () => {
  let db, register, login, logout, reset, usage;
  const run = async (handler, opts) => {
    const res = mockRes();
    await handler(mockReq({ ip: uniqueIp(), ...opts }), res);
    return res;
  };
  const newEmail = (tag) => `it-${tag}-${crypto.randomBytes(3).toString('hex')}@example.test`;
  const regBody = (email, extra = {}) => ({
    email, password: PASSWORD, ageConfirmed: true, acceptTerms: true,
    profile: { firstName: 'Tests', lastName: 'Lietotajs', level: 'klase', grade: 12 }, ...extra,
  });

  beforeAll(async () => {
    db = await import('../src/server/db');
    register = (await import('../src/pages/api/auth/register.js')).default;
    login = (await import('../src/pages/api/auth/login.js')).default;
    logout = (await import('../src/pages/api/auth/logout.js')).default;
    reset = (await import('../src/pages/api/auth/reset.js')).default;
    usage = (await import('../src/pages/api/ai/usage.js')).default;
  });
  afterAll(async () => { await cleanup(db); await db.getPool().end(); });

  describe('reģistrācija', () => {
    it('izveido kontu, iedod HttpOnly sesijas sīkdatni un neatklāj paroles jaucējkodu', async () => {
      const r = await run(register, { body: regBody(newEmail('reg')) });
      expect(r.statusCode).toBe(201);
      expect(sessionFrom(r)).toBeTruthy();
      expect(String(r.headers['set-cookie'])).toMatch(/HttpOnly/i);
      expect(String(r.headers['set-cookie'])).toMatch(/SameSite=Lax/i);
      expect(JSON.stringify(r.body)).not.toMatch(/scrypt|password_hash|passwordHash/i);
    });
    it('bez e-pasta sūtīšanas konts uzreiz ir apstiprināts', async () => {
      const email = newEmail('apst');
      await run(register, { body: regBody(email) });
      expect((await db.findByEmail(email)).emailVerifiedAt).toBeTruthy();
    });
    it('noraida: bez vecuma apstiprinājuma, bez noteikumiem, nederīgu e-pastu, vāju paroli', async () => {
      expect((await run(register, { body: regBody(newEmail('a'), { ageConfirmed: false }) })).statusCode).toBe(400);
      expect((await run(register, { body: regBody(newEmail('b'), { acceptTerms: false }) })).statusCode).toBe(400);
      expect((await run(register, { body: regBody('nav-epasts') })).statusCode).toBe(400);
      expect((await run(register, { body: regBody(newEmail('c'), { password: '123' }) })).statusCode).toBe(400);
    });
    it('atkārtots e-pasts (arī ar citiem burtiem) → 409', async () => {
      const email = newEmail('dub');
      expect((await run(register, { body: regBody(email) })).statusCode).toBe(201);
      expect((await run(register, { body: regBody(email.toUpperCase()) })).statusCode).toBe(409);
    });
    it('cits izcelsmes avots (CSRF) → 403 un konts netiek izveidots', async () => {
      const email = newEmail('csrf');
      const r = await run(register, { body: regBody(email), headers: { origin: 'https://ļaunais.example' } });
      expect(r.statusCode).toBe(403);
      expect(await db.findByEmail(email)).toBeFalsy();
    });
  });

  describe('ielogošanās un izlogošanās', () => {
    let user, cookie;
    beforeAll(async () => { user = await mkUser(db, 'login'); });

    it('pareiza parole → 200 + sesija; ar to atveras aizsargāts ceļš', async () => {
      const r = await run(login, { body: { email: user.email, password: PASSWORD } });
      expect(r.statusCode).toBe(200);
      cookie = sessionFrom(r);
      expect(cookie).toBeTruthy();
      expect(r.body.user.email).toBe(user.email);
      expect((await run(usage, { method: 'GET', cookie })).statusCode).toBe(200);
    });
    it('e-pasts bez ievērības uz burtu lielumu', async () => {
      const r = await run(login, { body: { email: user.email.toUpperCase(), password: PASSWORD } });
      expect(r.statusCode).toBe(200);
    });
    it('nepareiza parole un nezināms e-pasts dod vienādu atbildi', async () => {
      const a = await run(login, { body: { email: user.email, password: 'nepareiza-parole-1' } });
      const b = await run(login, { body: { email: newEmail('nav'), password: 'nepareiza-parole-1' } });
      expect(a.statusCode).toBe(401);
      expect(b.statusCode).toBe(401);
      expect(a.body).toEqual(b.body);
      expect(sessionFrom(a)).toBeUndefined();
    });
    it('bloķēts konts nevar ielogoties', async () => {
      const u = await mkUser(db, 'blok');
      await db.query('UPDATE users SET blocked_at = now() WHERE id = $1', [u.id]);
      expect((await run(login, { body: { email: u.email, password: PASSWORD } })).statusCode).toBe(403);
    });
    it('bez sesijas aizsargāts ceļš → 401; cits izcelsmes avots ar derīgu sesiju → 403', async () => {
      expect((await run(usage, { method: 'GET' })).statusCode).toBe(401);
      const post = await import('../src/pages/api/ai/tutor.js');
      const r = await run(post.default, { cookie, body: { message: 'x' }, headers: { origin: 'https://ļaunais.example' } });
      expect(r.statusCode).toBe(403);
    });
    it('izlogošanās iznīcina sesiju serverī (vecā sīkdatne vairs nestrādā)', async () => {
      const r = await run(logout, { cookie });
      expect(r.statusCode).toBe(200);
      expect(String(r.headers['set-cookie'])).toMatch(/Max-Age=0|Expires=/i);
      expect((await run(usage, { method: 'GET', cookie })).statusCode).toBe(401);
    });
  });

  describe('mēģinājumu ierobežojums', () => {
    it('pēc 5 nepareizām parolēm konts uz laiku tiek bloķēts, arī ar pareizo paroli', async () => {
      const u = await mkUser(db, 'brute');
      for (let i = 0; i < 5; i++) {
        expect((await run(login, { body: { email: u.email, password: `nepareiza-${i}-parole` } })).statusCode).toBe(401);
      }
      const r = await run(login, { body: { email: u.email, password: PASSWORD } });
      expect(r.statusCode).toBe(429);
      expect(r.headers['retry-after']).toBeTruthy();
    });
  });

  describe('paroles atjaunošana', () => {
    it('žetons maina paroli, izbeidz vecās sesijas un darbojas tikai vienreiz', async () => {
      const u = await mkUser(db, 'reset');
      const oldSession = await db.createSession(u.id);
      const token = await db.createEmailToken(u.id, 'reset', 1);
      const NEW = 'Jauna-Parole-98765';

      const r = await run(reset, { body: { token, password: NEW } });
      expect(r.statusCode).toBe(200);

      expect((await run(usage, { method: 'GET', cookie: oldSession })).statusCode).toBe(401);
      expect((await run(login, { body: { email: u.email, password: PASSWORD } })).statusCode).toBe(401);
      expect((await run(login, { body: { email: u.email, password: NEW } })).statusCode).toBe(200);
      expect((await run(reset, { body: { token, password: 'Cita-Parole-24680' } })).statusCode).toBe(400);
    });
    it('vāja parole neiztērē žetonu — var mēģināt vēlreiz', async () => {
      const u = await mkUser(db, 'reset2');
      const token = await db.createEmailToken(u.id, 'reset', 1);
      const weak = await run(reset, { body: { token, password: '123' } });
      expect(weak.statusCode).toBe(400);
      expect(weak.body.retry).toBe(true);
      expect((await run(reset, { body: { token, password: 'Stipra-Parole-13579' } })).statusCode).toBe(200);
    });
    it('nederīgs žetons → 400; žetons citam mērķim (verify) reset neder', async () => {
      expect((await run(reset, { body: { token: 'nav-zetons', password: 'Stipra-Parole-13579' } })).statusCode).toBe(400);
      const u = await mkUser(db, 'reset3');
      const verify = await db.createEmailToken(u.id, 'verify', 1);
      expect((await run(reset, { body: { token: verify, password: 'Stipra-Parole-13579' } })).statusCode).toBe(400);
    });
    it('beidzies žetons nedarbojas', async () => {
      const u = await mkUser(db, 'reset4');
      const token = await db.createEmailToken(u.id, 'reset', 1);
      await db.query("UPDATE email_tokens SET expires_at = now() - interval '1 minute' WHERE user_id = $1", [u.id]);
      expect((await run(reset, { body: { token, password: 'Stipra-Parole-13579' } })).statusCode).toBe(400);
    });
  });
});
