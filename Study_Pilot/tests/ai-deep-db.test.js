import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { hasDb, mkUser, cleanup, mockReq, mockRes, uniqueIp } from './helpers/db.js';

// AI dziļās domāšanas režīms (tikai Premium): /api/ai/tutor ar deep:true. DeepSeek ir imitēts (tīkla izsaukuma nav),
// pārējā loģika (Premium pārbaude, svars dienas limitā, atbrīvošana kļūdas gadījumā) ir īsta.
vi.mock('../src/server/ai', async (importOriginal) => ({ ...(await importOriginal()), askDeepSeek: vi.fn() }));

describe.skipIf(!hasDb)('AI dziļā domāšana (PostgreSQL)', () => {
  let db, ai, tutor, config;
  const reply = { reply: 'Padomā par diskriminantu. Ko tu iegūsti?', usage: { prompt_tokens: 600, completion_tokens: 400 }, model: 'deepseek-v4-pro' };
  const session = async (tag, opts) => { const u = await mkUser(db, tag, opts); return { u, cookie: await db.createSession(u.id) }; };
  const ask = async (s, body) => {
    const res = mockRes();
    await tutor(mockReq({ method: 'POST', body: { message: 'Kā atrisināt x^2-5x+6=0?', ...body }, cookie: s.cookie, ip: uniqueIp() }), res);
    return res;
  };
  const rows = async (id) => (await db.query('SELECT model, prompt_tokens + completion_tokens AS t, weight FROM ai_usage WHERE user_id = $1', [id])).rows;

  beforeAll(async () => {
    db = await import('../src/server/db');
    ai = await import('../src/server/ai');
    tutor = (await import('../src/pages/api/ai/tutor.js')).default;
    config = (await import('../src/pages/api/config.js')).default;
  });
  afterAll(async () => { await cleanup(db); await db.getPool().end(); });
  beforeEach(() => { process.env.DEEPSEEK_API_KEY = 'testa-atslega'; delete process.env.AI_DEEP_ENABLED; delete process.env.AI_DEEP_TOKEN_FACTOR; ai.askDeepSeek.mockReset(); });
  afterEach(() => { delete process.env.DEEPSEEK_API_KEY; delete process.env.AI_DEEP_ENABLED; delete process.env.AI_DEEP_TOKEN_FACTOR; delete process.env.AI_DAILY_LIMIT_GLOBAL; });

  it('bezmaksas lietotājam deep:true → 402 PREMIUM_ONLY, DeepSeek netiek izsaukts un limits netiek skarts', async () => {
    const s = await session('deep1');
    const r = await ask(s, { deep: true });
    expect(r.statusCode).toBe(402);
    expect(r.body.code).toBe('PREMIUM_ONLY');
    expect(ai.askDeepSeek).not.toHaveBeenCalled();
    expect(await rows(s.u.id)).toEqual([]);
  });

  it('Premium: dziļais jautājums izmanto deep režīmu un limitā rēķinās ar svaru (pēc noklusējuma 5×)', async () => {
    const s = await session('deep2', { plan: 'premium' });
    ai.askDeepSeek.mockResolvedValue(reply);
    const r = await ask(s, { deep: true });
    expect(r.statusCode, JSON.stringify(r.body)).toBe(200);
    expect(r.body.deep).toBe(true);
    expect(r.body.reply).toBe(reply.reply);
    expect(ai.askDeepSeek).toHaveBeenCalledTimes(1);
    expect(ai.askDeepSeek.mock.calls[0][1]).toEqual({ deep: true });
    // sistēmas uzvednē ir dziļā režīma piezīme (joprojām: nesaki atbildi)
    expect(ai.askDeepSeek.mock.calls[0][0][0].content).toMatch(/DZIĻĀS DOMĀŠANAS REŽĪMS/);
    expect(await rows(s.u.id)).toEqual([{ model: 'deepseek-v4-pro', t: 1000, weight: 5 }]);
    expect(await ai.usedToday(s.u.id)).toBe(5000);
    expect(r.body.usage.used).toBe(5000);
  });

  it('svaru var mainīt ar AI_DEEP_TOKEN_FACTOR', async () => {
    const s = await session('deep3', { plan: 'premium' });
    process.env.AI_DEEP_TOKEN_FACTOR = '3';
    ai.askDeepSeek.mockResolvedValue(reply);
    await ask(s, { deep: true });
    expect(await ai.usedToday(s.u.id)).toBe(3000);
  });

  it('parasts jautājums (arī Premium) ir ar svaru 1 un parasto režīmu', async () => {
    const s = await session('deep4', { plan: 'premium' });
    ai.askDeepSeek.mockResolvedValue({ ...reply, model: 'deepseek-chat' });
    const r = await ask(s, {});
    expect(r.statusCode).toBe(200);
    expect(r.body.deep).toBe(false);
    expect(ai.askDeepSeek.mock.calls[0][1]).toEqual({ deep: false });
    expect(ai.askDeepSeek.mock.calls[0][0][0].content).not.toMatch(/DZIĻĀS DOMĀŠANAS REŽĪMS/);
    expect(await rows(s.u.id)).toEqual([{ model: 'deepseek-chat', t: 1000, weight: 1 }]);
  });

  it('deep:true tikai kā īsta būla vērtība (teksts "true" netiek uzskatīts par dziļo režīmu)', async () => {
    const s = await session('deep5', { plan: 'premium' });
    ai.askDeepSeek.mockResolvedValue(reply);
    const r = await ask(s, { deep: 'true' });
    expect(r.body.deep).toBe(false);
    expect(await ai.usedToday(s.u.id)).toBe(1000);
  });

  it('AI_DEEP_ENABLED=0 → 503 DEEP_DISABLED, un konfigurācija to norāda saskarnei', async () => {
    const s = await session('deep6', { plan: 'premium' });
    process.env.AI_DEEP_ENABLED = '0';
    const r = await ask(s, { deep: true });
    expect(r.statusCode).toBe(503);
    expect(r.body.code).toBe('DEEP_DISABLED');
    expect(ai.askDeepSeek).not.toHaveBeenCalled();
    const c = mockRes();
    await config(mockReq({ method: 'GET' }), c);
    expect(c.body.aiDeep).toEqual({ enabled: false, factor: 5 });
  });

  it('DeepSeek neatbildīja → dziļais jautājums netiek norakstīts no limita', async () => {
    const s = await session('deep7', { plan: 'premium' });
    ai.askDeepSeek.mockRejectedValue(Object.assign(new Error('x'), { code: 'UPSTREAM' }));
    const r = await ask(s, { deep: true });
    expect(r.statusCode).toBe(502);
    expect(await rows(s.u.id)).toEqual([]);
  });

  it('svērtais limits: dziļie jautājumi ātrāk izsmeļ dienas limitu', async () => {
    const s = await session('deep8', { plan: 'premium' });
    await db.query("INSERT INTO ai_usage (user_id, model, prompt_tokens, completion_tokens, weight) VALUES ($1, 'deepseek-v4-pro', 100000, 0, 20)", [s.u.id]);
    // 100 000 tokenu × svars 20 = 2 000 000 > Premium limits (1 000 000)
    const r = await ask(s, { deep: true });
    expect(r.statusCode).toBe(429);
    expect(r.body.code).toBe('AI_LIMIT');
    expect(ai.askDeepSeek).not.toHaveBeenCalled();
  });

  describe('izmaksu aizsardzība dziļajam režīmam', () => {
    it('nepabeigts dziļais izsaukums rēķinās ar svaru (5 × ~3000), nevis kā parasts', async () => {
      const s = await session('deep9', { plan: 'premium' });
      await db.query("INSERT INTO ai_usage (user_id, weight) VALUES ($1, 5)", [s.u.id]); // rezervācija (model = '')
      expect(await ai.usedToday(s.u.id)).toBe(15000);
    });
    it('kamēr notiek cits dziļais izsaukums → 429 DEEP_BUSY (paralēli dziļie nepārsniedz limitu); parastais jautājums joprojām iet', async () => {
      const s = await session('deep10', { plan: 'premium' });
      await db.query("INSERT INTO ai_usage (user_id, weight) VALUES ($1, 5)", [s.u.id]);
      const r = await ask(s, { deep: true });
      expect(r.statusCode).toBe(429);
      expect(r.body.code).toBe('DEEP_BUSY');
      expect(ai.askDeepSeek).not.toHaveBeenCalled();
      expect((await rows(s.u.id))).toHaveLength(1); // jauna rezervācija netika izveidota
      ai.askDeepSeek.mockResolvedValue({ ...reply, model: 'deepseek-chat' });
      expect((await ask(s, {})).statusCode).toBe(200);
    });
    it('vecs nepabeigts dziļais izsaukums (> 5 min) vairs nebloķē', async () => {
      const s = await session('deep11', { plan: 'premium' });
      await db.query("INSERT INTO ai_usage (user_id, weight, created_at) VALUES ($1, 5, now() - interval '10 minutes')", [s.u.id]);
      ai.askDeepSeek.mockResolvedValue(reply);
      expect((await ask(s, { deep: true })).statusCode).toBe(200);
    });
    it('globālais limits skaita dziļo izsaukumu ar svaru: 5 vietu nepietiek, parastam jautājumam pietiek', async () => {
      const s = await session('deep12', { plan: 'premium' });
      const before = (await db.query(`SELECT coalesce(sum(weight), 0)::int AS n FROM ai_usage WHERE created_at >= ${ai.RIGA_DAY}`)).rows[0].n;
      process.env.AI_DAILY_LIMIT_GLOBAL = String(before + 3);
      const deepTry = await ask(s, { deep: true });
      expect(deepTry.statusCode).toBe(503);
      expect(deepTry.body.code).toBe('AI_GLOBAL_LIMIT');
      expect(ai.askDeepSeek).not.toHaveBeenCalled();
      ai.askDeepSeek.mockResolvedValue({ ...reply, model: 'deepseek-chat' });
      expect((await ask(s, {})).statusCode).toBe(200);
    });
    it('DeepSeek atgrieza tukšu atbildi, bet tokeni iztērēti → tie tiek ieskaitīti ar svaru (nevar atkārtot bez limita)', async () => {
      const s = await session('deep13', { plan: 'premium' });
      ai.askDeepSeek.mockRejectedValue(Object.assign(new Error('Tukša AI atbilde'), { code: 'UPSTREAM', spent: { usage: { prompt_tokens: 700, completion_tokens: 6000 }, model: 'deepseek-v4-pro' } }));
      const r = await ask(s, { deep: true });
      expect(r.statusCode).toBe(502);
      expect(await rows(s.u.id)).toEqual([{ model: 'deepseek-v4-pro', t: 6700, weight: 5 }]);
      expect(await ai.usedToday(s.u.id)).toBe(33500);
    });
    it('datu eksports (VDAR) parāda arī izsaukuma svaru', async () => {
      const s = await session('deep14', { plan: 'premium' });
      ai.askDeepSeek.mockResolvedValue(reply);
      await ask(s, { deep: true });
      const exported = await db.exportUser(await db.findById(s.u.id));
      expect(exported.aiUsage).toHaveLength(1);
      expect(exported.aiUsage[0]).toMatchObject({ model: 'deepseek-v4-pro', prompt_tokens: 600, completion_tokens: 400, weight: 5 });
    });
  });

  describe('askDeepSeek un deepConfig (īstā funkcija, tīkls imitēts)', () => {
    const msgs = [{ role: 'user', content: 'x' }];
    const fakeFetch = (message, usage = { prompt_tokens: 10, completion_tokens: 20 }) =>
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message }], usage }) });
    afterEach(() => vi.unstubAllGlobals());

    it('dziļais režīms: dziļais modelis, bez temperatūras, vairāk tokenu; domāšanas gaita (ar pareizo atbildi) netiek atdota', async () => {
      const real = await vi.importActual('../src/server/ai');
      const f = fakeFetch({ content: 'Mājiens.', reasoning_content: 'PAREIZĀ ATBILDE IR 42' });
      vi.stubGlobal('fetch', f);
      const out = await real.askDeepSeek(msgs, { deep: true });
      expect(out.reply).toBe('Mājiens.');
      expect(JSON.stringify(out)).not.toMatch(/42|reasoning/);
      const body = JSON.parse(f.mock.calls[0][1].body);
      expect(body.model).toBe('deepseek-v4-pro');
      expect(body).not.toHaveProperty('temperature');
      expect(body.max_tokens).toBeGreaterThanOrEqual(6000);
    });
    it('parastais režīms nemainās: parastais modelis un temperatūra', async () => {
      const real = await vi.importActual('../src/server/ai');
      const f = fakeFetch({ content: 'Atbilde.' });
      vi.stubGlobal('fetch', f);
      await real.askDeepSeek(msgs, {});
      const body = JSON.parse(f.mock.calls[0][1].body);
      expect(body.model).toBe('deepseek-chat');
      expect(body).toHaveProperty('temperature');
      expect(body.max_tokens).toBe(900);
    });
    it('ja domāšana apēda visus tokenus un gala teksta nav → kļūda UPSTREAM, nevis domāšanas gaita', async () => {
      const real = await vi.importActual('../src/server/ai');
      vi.stubGlobal('fetch', fakeFetch({ content: '', reasoning_content: 'PAREIZĀ ATBILDE IR 42' }));
      await expect(real.askDeepSeek(msgs, { deep: true })).rejects.toMatchObject({ code: 'UPSTREAM' });
    });
    it('tukša gala atbilde: iztērētie tokeni tiek pievienoti kļūdai (err.spent), lai tos varētu ieskaitīt limitā', async () => {
      const real = await vi.importActual('../src/server/ai');
      vi.stubGlobal('fetch', fakeFetch({ content: '', reasoning_content: 'domāju…' }, { prompt_tokens: 700, completion_tokens: 6000 }));
      const err = await real.askDeepSeek(msgs, { deep: true }).catch((e) => e);
      expect(err.code).toBe('UPSTREAM');
      expect(err.spent).toEqual({ usage: { prompt_tokens: 700, completion_tokens: 6000 }, model: 'deepseek-v4-pro' });
      expect(JSON.stringify(err.spent)).not.toMatch(/domāju/);
    });
    it('DEEPSEEK_DEEP_MODEL maina dziļo modeli', async () => {
      const real = await vi.importActual('../src/server/ai');
      const f = fakeFetch({ content: 'ok' });
      vi.stubGlobal('fetch', f);
      process.env.DEEPSEEK_DEEP_MODEL = 'deepseek-reasoner';
      try { await real.askDeepSeek(msgs, { deep: true }); } finally { delete process.env.DEEPSEEK_DEEP_MODEL; }
      expect(JSON.parse(f.mock.calls[0][1].body).model).toBe('deepseek-reasoner');
    });
    it('deepConfig: svars tiek ierobežots 1–20, nederīga vērtība dod 5', async () => {
      const real = await vi.importActual('../src/server/ai');
      const factor = (v) => { process.env.AI_DEEP_TOKEN_FACTOR = v; return real.deepConfig().factor; };
      expect([factor('99'), factor('0'), factor('abc'), factor('7')]).toEqual([20, 1, 5, 7]);
      delete process.env.AI_DEEP_TOKEN_FACTOR;
      expect(real.deepConfig()).toEqual({ enabled: true, factor: 5, model: 'deepseek-v4-pro' });
    });
  });
});
