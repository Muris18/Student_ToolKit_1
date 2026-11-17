import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasDb, mkUser, cleanup, mockReq, mockRes, uniqueIp } from './helpers/db.js';

// AI tokenu limits (src/server/ai.js) un AI ceļi pret PostgreSQL. DeepSeek netiek izsaukts: limita pārbaude notiek pirms tā.
describe.skipIf(!hasDb)('AI tokenu limits (PostgreSQL)', () => {
  let db, ai;
  const add = (uid, tokens, { model = 'test', ago = '0 minutes', out = 0 } = {}) =>
    db.query('INSERT INTO ai_usage (user_id, model, prompt_tokens, completion_tokens, created_at) VALUES ($1,$2,$3,$4, now() - $5::interval)', [uid, model, tokens, out, ago]);

  beforeAll(async () => {
    process.env.AI_TOKEN_LIMIT_FREE = '20000';
    process.env.AI_TOKEN_LIMIT_PREMIUM = '100000';
    db = await import('../src/server/db');
    ai = await import('../src/server/ai');
  });
  afterAll(async () => { await cleanup(db); await db.getPool().end(); });

  it('limits ir atkarīgs no plāna; nezināms plāns = bezmaksas', () => {
    expect(ai.limitFor('free')).toBe(20000);
    expect(ai.limitFor('premium')).toBe(100000);
    expect(ai.limitFor('kaut-kas')).toBe(20000);
  });

  it('usedToday skaita ievades + izvades tokenus šodien un neskaita vakardienas (Rīgas diena)', async () => {
    const u = await mkUser(db, 'dienas');
    await add(u.id, 4000, { out: 500 });
    await db.query("INSERT INTO ai_usage (user_id, model, prompt_tokens, created_at) VALUES ($1,'vakar',900000, (date_trunc('day', now() AT TIME ZONE 'Europe/Riga') AT TIME ZONE 'Europe/Riga') - interval '1 minute')", [u.id]);
    expect(await ai.usedToday(u.id)).toBe(4500);
  });

  it('nepabeigts izsaukums (model = "") skaitās ~3000 tokenu, bet tikai 5 minūtes', async () => {
    const u = await mkUser(db, 'pending');
    await add(u.id, 0, { model: '' });
    expect(await ai.usedToday(u.id)).toBe(3000);
    await add(u.id, 0, { model: '', ago: '10 minutes' });
    expect(await ai.usedToday(u.id)).toBe(3000);
  });

  it('reserveUsage rezervē vietu un finishUsage ieraksta īstos tokenus', async () => {
    const u = await mkUser(db, 'rezerve');
    const slot = await ai.reserveUsage(u.id, ai.limitFor('free'));
    expect(slot.id).toBeTruthy();
    expect(await ai.usedToday(u.id)).toBe(3000);
    await ai.finishUsage(slot.id, 'deepseek-chat', { prompt_tokens: 12000, completion_tokens: 500 });
    expect(await ai.usedToday(u.id)).toBe(12500);
  });

  it('releaseUsage atceļ rezervāciju: neveiksmīgs izsaukums netiek norakstīts', async () => {
    const u = await mkUser(db, 'atcelts');
    const slot = await ai.reserveUsage(u.id, 20000);
    await ai.releaseUsage(slot.id);
    expect(await ai.usedToday(u.id)).toBe(0);
  });

  it('reserveUsage noraida, kad limits sasniegts', async () => {
    const u = await mkUser(db, 'limits');
    await add(u.id, 20000);
    expect(await ai.reserveUsage(u.id, 20000)).toBeNull();
  });

  it('paralēli izsaukumi nepārsniedz limitu (nepabeigtie tiek ieskaitīti)', async () => {
    const u = await mkUser(db, 'paralele');
    await add(u.id, 17000);
    const r = await Promise.all(Array.from({ length: 6 }, () => ai.reserveUsage(u.id, 20000)));
    expect(r.filter(Boolean)).toHaveLength(1);
  });

  it('Premium plānam ir lielāks limits', async () => {
    const u = await mkUser(db, 'prem', { plan: 'premium' });
    await add(u.id, 50000);
    expect(await ai.reserveUsage(u.id, ai.limitFor(u.plan))).toHaveProperty('id');
    const snap = await ai.usageSnapshot(u);
    expect(snap.limit).toBe(100000);
    expect(snap.plan).toBe('premium');
  });

  it('globālais limits visai sistēmai noraida pēc N pieprasījumiem', async () => {
    const before = (await db.query(`SELECT count(*)::int AS n FROM ai_usage WHERE created_at >= ${ai.RIGA_DAY}`)).rows[0].n;
    process.env.AI_DAILY_LIMIT_GLOBAL = String(before + 2);
    try {
      const u = await mkUser(db, 'globals');
      expect(await ai.reserveUsage(u.id, 1000000)).toHaveProperty('id');
      expect(await ai.reserveUsage(u.id, 1000000)).toHaveProperty('id');
      expect(await ai.reserveUsage(u.id, 1000000)).toEqual({ globalLimit: true });
    } finally { delete process.env.AI_DAILY_LIMIT_GLOBAL; }
  });

  it('usageSnapshot: procenti, ierobežoti ar 100, un atjaunošanās nākamajā pusnaktī', async () => {
    const u = await mkUser(db, 'josla');
    await add(u.id, 5000);
    let s = await ai.usageSnapshot(u);
    expect(s).toMatchObject({ used: 5000, limit: 20000, percent: 25, plan: 'free' });
    const ms = new Date(s.resetsAt).getTime() - Date.now();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 3600 * 1000 + 60000);
    await add(u.id, 30000);
    s = await ai.usageSnapshot(u);
    expect(s.percent).toBe(100);
  });

  describe('AI ceļi pie sasniegta limita (DeepSeek netiek izsaukts)', () => {
    let user, cookie;
    const call = async (path, body, method = 'POST', useCookie = true) => {
      const loaders = {
        'ai/tutor': () => import('../src/pages/api/ai/tutor.js'),
        'ai/usage': () => import('../src/pages/api/ai/usage.js'),
        'study/generate': () => import('../src/pages/api/study/generate.js'),
      };
      const mod = await loaders[path]();
      const res = mockRes();
      await mod.default(mockReq({ method, body, cookie: useCookie ? cookie : undefined, ip: uniqueIp() }), res);
      return res;
    };
    beforeAll(async () => {
      process.env.DEEPSEEK_API_KEY = 'testa-atslega'; // tikai lai ceļš nenoraidītu ar NO_KEY; tīkla izsaukuma nebūs
      user = await mkUser(db, 'celi');
      cookie = await db.createSession(user.id);
      await add(user.id, 25000);
    });
    afterAll(() => { delete process.env.DEEPSEEK_API_KEY; });

    it('AI skolotājs → 429 AI_LIMIT', async () => {
      const r = await call('ai/tutor', { message: 'Kā atrisināt x+1=3?' });
      expect(r.statusCode).toBe(429);
      expect(r.body.code).toBe('AI_LIMIT');
    });
    it('pārbaudes darbu materiāli → 429 AI_LIMIT', async () => {
      const r = await call('study/generate', { subject: 'Vēsture', topic: 'Latvijas proklamēšana' });
      expect(r.statusCode).toBe(429);
      expect(r.body.code).toBe('AI_LIMIT');
    });
    it('/api/ai/usage atdod joslas datus tikai ielogotam lietotājam', async () => {
      const r = await call('ai/usage', undefined, 'GET');
      expect(r.statusCode).toBe(200);
      expect(r.body).toMatchObject({ used: 25000, limit: 20000, percent: 100 });
      expect((await call('ai/usage', undefined, 'GET', false)).statusCode).toBe(401);
    });
  });
});
