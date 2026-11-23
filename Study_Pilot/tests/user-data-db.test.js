import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { hasDb, mkUser, cleanup, mockReq, mockRes, uniqueIp } from './helpers/db.js';

// DeepSeek netiek izsaukts: askDeepSeek ir imitēts (tīkla izsaukuma nav), pārējā AI loģika (limiti, rezervācijas) ir īsta.
vi.mock('../src/server/ai', async (importOriginal) => ({ ...(await importOriginal()), askDeepSeek: vi.fn() }));

// Testu veidošana un lietotāja datu saglabāšana: PUT /api/me/data (bezmaksas limits, versijas, mēģinājumi, CSRF)
// un POST /api/quiz/generate (tests no VIAA uzdevumiem un AI zars). Tests izveido savu eksāmenu, tāpēc nav atkarīgs no ielādētajiem failiem.
const SUBJECT = 'it-tests-quiz';
const DOC = {
  subject: SUBJECT, grade: 12, year: 2097, session: 'tests', title: 'Testa eksāmens testu veidošanai',
  tasks: Array.from({ length: 6 }, (_, i) => ({
    number: `1.${i + 1}`, section: '1. daļa. Lasīšana', topic: 'teksts', options: ['viens', 'divi', 'trīs'],
    answer: 'B', solution: 'Divi.', points: 1, text: `Testa jautājums numur ${i + 1}, izvēlies pareizo variantu.`,
  })),
};

describe.skipIf(!hasDb)('Lietotāja dati un testu veidošana (PostgreSQL)', () => {
  let db, ai, ex, putData, genQuiz, taskIds;
  const quizzes = (n) => Array.from({ length: n }, (_, i) => ({ id: `q${i}`, title: `Tests ${i}`, questions: [] }));
  const call = async (handler, { cookie, body, method = 'PUT', headers }) => {
    const res = mockRes();
    await handler(mockReq({ method, body, cookie, headers, ip: uniqueIp() }), res);
    return res;
  };
  const withSession = async (tag, opts) => { const u = await mkUser(db, tag, opts); return { u, cookie: await db.createSession(u.id) }; };
  const put = (s, data, version) => call(putData, { cookie: s.cookie, body: { data, version } });
  const attemptIds = async (id) => (await db.getAttempts(id)).map((a) => a.taskId).sort((a, b) => a - b);
  const sorted = (...ids) => [...ids].sort((a, b) => a - b);

  beforeAll(async () => {
    db = await import('../src/server/db');
    ai = await import('../src/server/ai');
    ex = await import('../src/server/exams');
    putData = (await import('../src/pages/api/me/data.js')).default;
    genQuiz = (await import('../src/pages/api/quiz/generate.js')).default;
    await db.query('DELETE FROM exam_documents WHERE subject = $1', [SUBJECT]);
    const docId = await ex.saveDoc(db.getPool(), DOC);
    taskIds = (await db.query('SELECT id FROM exam_tasks WHERE doc_id = $1 ORDER BY number', [docId])).rows.map((r) => r.id);
  });
  afterAll(async () => {
    await cleanup(db);
    await db.query('DELETE FROM exam_documents WHERE subject = $1', [SUBJECT]);
    await db.getPool().end();
  });

  describe('PUT /api/me/data', () => {
    it('bez pieteikšanās → 401; GET → 405', async () => {
      expect((await call(putData, { body: { data: {}, version: 0 } })).statusCode).toBe(401);
      const s = await withSession('dati0');
      expect((await call(putData, { cookie: s.cookie, method: 'GET' })).statusCode).toBe(405);
    });
    it('cits izcelsmes avots (CSRF) → 403 un dati netiek mainīti', async () => {
      const s = await withSession('csrf');
      const r = await call(putData, { cookie: s.cookie, body: { data: { subjects: [{ id: 'x', name: 'Uzbrucējs' }] }, version: s.u.dataVersion }, headers: { origin: 'https://ļaunais.example' } });
      expect(r.statusCode).toBe(403);
      expect(r.body.code).toBe('CSRF');
      expect((await db.findById(s.u.id)).data.subjects).toEqual([]);
    });
    it('trūkst datu → 400; trūkst vai ir nederīga versija → 400 VERSION_REQUIRED', async () => {
      const s = await withSession('dati1');
      expect((await call(putData, { cookie: s.cookie, body: { version: 0 } })).statusCode).toBe(400);
      for (const version of [undefined, null, '0', -1, 1.5]) {
        const r = await call(putData, { cookie: s.cookie, body: { data: {}, version } });
        expect(r.statusCode, `version=${String(version)}`).toBe(400);
        expect(r.body.code).toBe('VERSION_REQUIRED');
      }
    });
    it('saglabā datus un palielina versiju; nezināmi lauki tiek atmesti, ne-masīvi aizstāti ar tukšiem', async () => {
      const s = await withSession('dati2');
      const r = await put(s, { subjects: [{ id: 's1', name: 'Matemātika' }], tasks: 'nav-masivs', huuhaa: [1, 2] }, s.u.dataVersion);
      expect(r.statusCode).toBe(200);
      expect(r.body.version).toBe(s.u.dataVersion + 1);
      const saved = (await db.findById(s.u.id)).data;
      expect(saved.subjects).toHaveLength(1);
      expect(saved.tasks).toEqual([]);
      expect(saved).not.toHaveProperty('huuhaa');
    });
    it('novecojusi versija (cita ierīce) → 409 STALE_DATA un jaunākais darbs netiek pārrakstīts', async () => {
      const s = await withSession('dati3');
      const v0 = s.u.dataVersion;
      expect((await put(s, { subjects: [{ id: 'a', name: 'No telefona' }] }, v0)).statusCode).toBe(200);
      const r = await put(s, { subjects: [{ id: 'b', name: 'No datora (vecs)' }] }, v0);
      expect(r.statusCode).toBe(409);
      expect(r.body.code).toBe('STALE_DATA');
      expect(r.body.version).toBe(v0 + 1);
      expect((await db.findById(s.u.id)).data.subjects[0].name).toBe('No telefona');
    });
    it('divi vienlaicīgi saglabāšanas pieprasījumi ar vienu versiju: tieši viens izdodas, otrs 409', async () => {
      const s = await withSession('dati4');
      const v0 = s.u.dataVersion;
      const [a, b] = await Promise.all([put(s, { subjects: [{ id: 'a', name: 'A' }] }, v0), put(s, { subjects: [{ id: 'b', name: 'B' }] }, v0)]);
      expect([a.statusCode, b.statusCode].sort()).toEqual([200, 409]);
      expect((await db.findById(s.u.id)).dataVersion).toBe(v0 + 1);
    });
  });

  describe('bezmaksas plāna limits savu testu skaitam', () => {
    it('līdz 3 testiem drīkst, ceturtais → 402 PLAN_LIMIT un netiek saglabāts', async () => {
      const s = await withSession('limits1');
      const ok = await put(s, { quizzes: quizzes(3) }, s.u.dataVersion);
      expect(ok.statusCode).toBe(200);
      const r = await put(s, { quizzes: quizzes(4) }, ok.body.version);
      expect(r.statusCode).toBe(402);
      expect(r.body.code).toBe('PLAN_LIMIT');
      expect((await db.findById(s.u.id)).data.quizzes).toHaveLength(3);
    });
    it('Premium drīkst vairāk par 3', async () => {
      const s = await withSession('limits2', { plan: 'premium' });
      const r = await put(s, { quizzes: quizzes(8) }, s.u.dataVersion);
      expect(r.statusCode).toBe(200);
      expect((await db.findById(s.u.id)).data.quizzes).toHaveLength(8);
    });
    it('pēc Premium beigām esošie testi paliek un var tos saglabāt, bet nevar pievienot jaunus', async () => {
      const s = await withSession('limits3', { plan: 'premium' });
      const v1 = (await put(s, { quizzes: quizzes(5) }, s.u.dataVersion)).body.version;
      await db.query("UPDATE users SET plan = 'free' WHERE id = $1", [s.u.id]);
      const same = await put(s, { quizzes: quizzes(5), subjects: [{ id: 'x', name: 'Jauns priekšmets' }] }, v1);
      expect(same.statusCode).toBe(200);
      expect((await put(s, { quizzes: quizzes(6) }, same.body.version)).statusCode).toBe(402);
      expect((await put(s, { quizzes: quizzes(4) }, same.body.version)).statusCode).toBe(200);
    });
  });

  describe('eksāmenu mēģinājumi caur datu saglabāšanu', () => {
    it('mēģinājumi nonāk tabulā exam_attempts, novecojis klients neizdzēš citur uzkrātos, un users.data.examAttempts paliek nemainīts', async () => {
      const s = await withSession('meg1');
      await db.syncAttempts(s.u.id, [{ taskId: taskIds[0], correct: true, at: '2026-05-01T10:00:00Z' }]);
      const r = await put(s, { examAttempts: [{ taskId: taskIds[1], correct: false, at: '2026-05-02T10:00:00Z' }] }, s.u.dataVersion);
      expect(r.statusCode).toBe(200);
      expect(await attemptIds(s.u.id)).toEqual(sorted(taskIds[0], taskIds[1]));
      expect((await db.findById(s.u.id)).data.examAttempts).toEqual([]);
    });
    it('jaunākais mēģinājums uzvar arī caur PUT: vecāks nepārraksta jaunāko', async () => {
      const s = await withSession('meg2');
      await db.syncAttempts(s.u.id, [{ taskId: taskIds[0], correct: true, at: '2026-05-02T10:00:00Z' }]);
      await put(s, { examAttempts: [{ taskId: taskIds[0], correct: false, at: '2026-05-01T10:00:00Z' }] }, s.u.dataVersion);
      expect((await db.getAttempts(s.u.id))[0]).toMatchObject({ taskId: taskIds[0], correct: true });
    });
    it('mēģinājumi netiek pazaudēti arī tad, ja šī datu versija ir novecojusi (409)', async () => {
      const s = await withSession('meg3');
      const v0 = s.u.dataVersion;
      expect((await put(s, { subjects: [] }, v0)).statusCode).toBe(200);
      const r = await put(s, { examAttempts: [{ taskId: taskIds[3], correct: false, at: '2026-05-03T10:00:00Z' }] }, v0);
      expect(r.statusCode).toBe(409);
      expect(await attemptIds(s.u.id)).toEqual([taskIds[3]]);
    });
  });

  describe('POST /api/quiz/generate (tests no VIAA uzdevumiem)', () => {
    const gen = (s, body, method = 'POST') => call(genQuiz, { cookie: s.cookie, body, method });
    const okBody = (r) => { expect(r.statusCode, JSON.stringify(r.body)).toBe(200); return r.body; };

    it('bez pieteikšanās → 401; GET → 405; bez klases vai priekšmeta → 400; nezināms priekšmets vai klase → 404', async () => {
      const s = await withSession('tests1');
      expect((await call(genQuiz, { body: { subject: SUBJECT, grade: 12 }, method: 'POST' })).statusCode).toBe(401);
      expect((await gen(s, undefined, 'GET')).statusCode).toBe(405);
      expect((await gen(s, { subject: SUBJECT })).statusCode).toBe(400);
      expect((await gen(s, { grade: 12 })).statusCode).toBe(400);
      expect((await gen(s, { subject: 'nav-tāda-priekšmeta', grade: 12 })).statusCode).toBe(404);
      expect((await gen(s, { subject: SUBJECT, grade: 9 })).statusCode).toBe(404);
    });
    it('bez kļūdām un bez AI → diagnostikas tests no mūsu uzdevumiem (3 varianti, pareizā atbilde "B")', async () => {
      const s = await withSession('tests2');
      const b = okBody(await gen(s, { subject: SUBJECT, grade: 12 }));
      expect(b.quiz.source).toBe('diagnostic');
      expect(b.quiz.mistakes).toBe(0);
      expect(b.notice).toMatch(/diagnostikas/);
      expect(b.quiz.id).toMatch(/^[0-9a-f]{16}$/);
      expect(b.quiz.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of b.quiz.questions) {
        expect(q.options).toEqual(['viens', 'divi', 'trīs']);
        expect(q.correctIndex).toBe(1);
        expect(taskIds).toContain(q.taskId);
      }
    });
    it('priekšmeta nosaukums ar lielajiem burtiem tiek atpazīts', async () => {
      const s = await withSession('tests1b');
      expect(okBody(await gen(s, { subject: SUBJECT.toUpperCase(), grade: 12 })).quiz.subject).toBe(SUBJECT);
    });
    it('ar kļūdām → tests no tām: kļūdaini atbildētais uzdevums ir testā, pareizi atbildētais nav piespiedu', async () => {
      const s = await withSession('tests3');
      await db.syncAttempts(s.u.id, [
        { taskId: taskIds[0], correct: false, at: '2026-05-01T10:00:00Z' },
        { taskId: taskIds[1], correct: true, at: '2026-05-01T10:00:00Z' },
      ]);
      const b = okBody(await gen(s, { subject: SUBJECT, grade: 12 }));
      expect(b.quiz.source).toBe('exams');
      expect(b.quiz.mistakes).toBe(1);
      expect(b.quiz.questions.map((q) => q.taskId)).toContain(taskIds[0]);
    });
    it('izlabota kļūda vairs nenonāk testā (jaunākais mēģinājums uzvar)', async () => {
      const s = await withSession('tests4');
      await db.syncAttempts(s.u.id, [{ taskId: taskIds[2], correct: false, at: '2026-05-01T10:00:00Z' }]);
      await db.syncAttempts(s.u.id, [{ taskId: taskIds[2], correct: true, at: '2026-05-02T10:00:00Z' }]);
      const b = okBody(await gen(s, { subject: SUBJECT, grade: 12 }));
      expect(b.quiz.mistakes).toBe(0);
      expect(b.quiz.source).toBe('diagnostic');
    });
  });

  describe('testa veidošana ar AI (DeepSeek imitēts)', () => {
    const goodReply = () => JSON.stringify({
      title: 'AI tests',
      questions: Array.from({ length: 5 }, (_, i) => ({ question: `AI jautājums numur ${i + 1}?`, options: ['a', 'b', 'c'], correctIndex: 2, topic: 'teksts', explanation: 'Paskaidrojums.' })),
    });
    const gen = (s) => call(genQuiz, { cookie: s.cookie, body: { subject: SUBJECT, grade: 12 }, method: 'POST' });
    const usage = async (id) => (await db.query("SELECT model, prompt_tokens + completion_tokens AS t FROM ai_usage WHERE user_id = $1", [id])).rows;

    beforeEach(() => { process.env.DEEPSEEK_API_KEY = 'testa-atslega'; ai.askDeepSeek.mockReset(); });
    afterEach(() => { delete process.env.DEEPSEEK_API_KEY; });

    it('veiksmīgs izsaukums: tests no AI, īstie tokeni ierakstīti dienas limitā', async () => {
      const s = await withSession('ai1');
      ai.askDeepSeek.mockResolvedValue({ reply: goodReply(), usage: { prompt_tokens: 1200, completion_tokens: 800 }, model: 'deepseek-chat' });
      const r = await gen(s);
      expect(r.statusCode, JSON.stringify(r.body)).toBe(200);
      expect(r.body.quiz.source).toBe('ai-diagnostic');
      expect(r.body.quiz.questions).toHaveLength(5);
      expect(r.body.quiz.questions.every((q) => q.source === 'AI' && q.options.length === 3)).toBe(true);
      expect(ai.askDeepSeek).toHaveBeenCalledTimes(1);
      expect(await usage(s.u.id)).toEqual([{ model: 'deepseek-chat', t: 2000 }]);
    });
    it('AI nav pieejams → tests tomēr tiek sastādīts no VIAA uzdevumiem un tokeni netiek norakstīti', async () => {
      const s = await withSession('ai2');
      ai.askDeepSeek.mockRejectedValue(Object.assign(new Error('AI pakalpojums nav pieejams'), { code: 'UPSTREAM' }));
      const r = await gen(s);
      expect(r.statusCode).toBe(200);
      expect(r.body.quiz.source).toBe('diagnostic');
      expect(r.body.notice).toMatch(/neizdevās/);
      expect(await usage(s.u.id)).toEqual([]);
    });
    it('AI atbildēja ar nederīgu testu → rezerves tests no VIAA, bet iztērētie tokeni paliek uzskaitīti', async () => {
      const s = await withSession('ai3');
      ai.askDeepSeek.mockResolvedValue({ reply: JSON.stringify({ title: 'x', questions: [] }), usage: { prompt_tokens: 500, completion_tokens: 100 }, model: 'deepseek-chat' });
      const r = await gen(s);
      expect(r.statusCode).toBe(200);
      expect(r.body.quiz.source).toBe('diagnostic');
      expect(await usage(s.u.id)).toEqual([{ model: 'deepseek-chat', t: 600 }]);
    });
    it('bez AI piekrišanas DeepSeek netiek izsaukts un paziņojums to paskaidro', async () => {
      const s = await withSession('ai4', { consent: false });
      const r = await gen(s);
      expect(r.statusCode).toBe(200);
      expect(r.body.notice).toMatch(/piekrīti/);
      expect(r.body.quiz.source).toBe('diagnostic');
      expect(ai.askDeepSeek).not.toHaveBeenCalled();
    });
    it('izmantots dienas tokenu limits → DeepSeek netiek izsaukts, tests no VIAA', async () => {
      const s = await withSession('ai5');
      await db.query("INSERT INTO ai_usage (user_id, model, prompt_tokens) VALUES ($1, 'tests', 9999999)", [s.u.id]);
      const r = await gen(s);
      expect(r.statusCode).toBe(200);
      expect(r.body.notice).toMatch(/limits/);
      expect(r.body.quiz.source).toBe('diagnostic');
      expect(ai.askDeepSeek).not.toHaveBeenCalled();
    });
  });
});
