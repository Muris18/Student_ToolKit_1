import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasDb, mkUser, cleanup } from './helpers/db.js';

// Eksāmenu pārbaude un vērtēšana pret PostgreSQL. Tests pats izveido savu eksāmenu (priekšmets "it-tests"),
// tāpēc nav atkarīgs no ielādētajiem VIAA failiem un tos neskar.
const SUBJECT = 'it-tests';
const DOC = {
  subject: SUBJECT, grade: 12, year: 2098, session: 'tests', title: 'Testa eksāmens',
  tasks: [
    { number: '1.1', section: '1. daļa. Lasīšana (Reading)', topic: 'teksts A', options: ['pirmais', 'otrais', 'trešais'], answer: 'B', solution: 'Otrais ir pareizs.', points: 1, text: 'Kurš variants ir pareizs?' },
    { number: '1.2', section: '1. daļa. Lasīšana (Reading)', topic: 'teksts A', options: { A: 'viens', B: 'divi', C: 'trīs', D: 'četri' }, answer: 'A, C', points: 2, text: 'Atzīmē visus pareizos.' },
    { number: '1.10', section: '1. daļa. Lasīšana (Reading)', topic: 'teksts B', options: ['jā', 'nē'], answer: 'B) nē', text: 'Desmitais jautājums.' },
    { number: 'II.1', section: '2. daļa. Rakstīšana', kind: 'open', answer: 'Kritēriji: 2 punkti par pareizu piemēru.', solution: 'Paraugs.', points: 3, text: 'Uzraksti īsu atbildi.' },
    { number: '1.3', section: '1. daļa. Lasīšana (Reading)', topic: 'teksts A', options: ['x', 'y'], answer: 'Z', text: 'Atslēga neatbilst variantiem.' },
  ],
};

describe('answerKeys (bez DB)', () => {
  let answerKeys, taskOrder;
  beforeAll(async () => { ({ answerKeys, taskOrder } = await import('../src/server/exams')); });
  const K = ['A', 'B', 'C', 'D'];
  it('atpazīst dažādus pareizās atbildes pierakstus', () => {
    expect(answerKeys('B', K)).toEqual(['B']);
    expect(answerKeys('b) teksts', K)).toEqual(['B']);
    expect(answerKeys('C – teksts', K)).toEqual(['C']);
    expect(answerKeys('A, C', K)).toEqual(['A', 'C']);
    expect(answerKeys('A; A', K)).toEqual(['A']);
  });
  it('ignorē to, kas nav starp variantiem', () => {
    expect(answerKeys('Z', K)).toEqual([]);
    expect(answerKeys('', K)).toEqual([]);
    expect(answerKeys(undefined, K)).toEqual([]);
  });
  it('uzdevumu secība: 1.2 pirms 1.10, romiešu daļas un rakstīšana beigās', () => {
    const sorted = ['W', 'II.1', '1.10', '1.2', 'III.1', '1.1'].sort((a, b) => taskOrder(a).localeCompare(taskOrder(b)));
    expect(sorted).toEqual(['1.1', '1.2', '1.10', 'II.1', 'III.1', 'W']);
  });
});

describe.skipIf(!hasDb)('Eksāmenu pārbaude un vērtēšana (PostgreSQL)', () => {
  let db, ex, docId, ids;
  const purge = () => db.query('DELETE FROM exam_documents WHERE subject = $1', [SUBJECT]);

  beforeAll(async () => {
    db = await import('../src/server/db');
    ex = await import('../src/server/exams');
    await purge();
    docId = await ex.saveDoc(db.getPool(), DOC);
    const { rows } = await db.query('SELECT id, number FROM exam_tasks WHERE doc_id = $1', [docId]);
    ids = Object.fromEntries(rows.map((r) => [r.number, r.id]));
  });
  afterAll(async () => { await cleanup(db); await purge(); await db.getPool().end(); });

  describe('saglabāšana un uzdevumu saraksts', () => {
    it('atkārtota saglabāšana atjaunina, nevis dubulto', async () => {
      const again = await ex.saveDoc(db.getPool(), { ...DOC, title: 'Jauns nosaukums' });
      expect(again).toBe(docId);
      expect((await db.query('SELECT count(*)::int AS n FROM exam_tasks WHERE doc_id = $1', [docId])).rows[0].n).toBe(5);
      expect((await db.query('SELECT title FROM exam_documents WHERE id = $1', [docId])).rows[0].title).toBe('Jauns nosaukums');
    });
    it('skolēnam tiek sūtīti uzdevumi BEZ pareizās atbildes un risinājuma', async () => {
      const doc = await ex.docWithTasks(docId);
      expect(doc.tasks).toHaveLength(5);
      for (const t of doc.tasks) {
        expect(t).not.toHaveProperty('answer');
        expect(t).not.toHaveProperty('solution');
      }
      expect(JSON.stringify(doc)).not.toMatch(/Otrais ir pareizs|Kritēriji/);
      expect(doc.tasks.find((t) => t.number === '1.1').has_answer).toBe(true);
    });
    it('uzdevumi ir dabiskā secībā un varianti sadalīti pa burtiem', async () => {
      const doc = await ex.docWithTasks(docId);
      expect(doc.tasks.map((t) => t.number)).toEqual(['1.1', '1.2', '1.3', '1.10', 'II.1']);
      expect(doc.tasks[0].options).toEqual([{ key: 'A', text: 'pirmais' }, { key: 'B', text: 'otrais' }, { key: 'C', text: 'trešais' }]);
    });
    it('nezināms eksāmens → null; saraksts atrod mūsu eksāmenu ar uzdevumu skaitu', async () => {
      expect(await ex.docWithTasks(2147483000)).toBeNull();
      const mine = (await ex.listDocs(12)).find((d) => d.id === docId);
      expect(mine.tasks).toBe(5);
    });
  });

  describe('checkAnswer', () => {
    it('pareiza atbilde → correct + risinājums', async () => {
      expect(await ex.checkAnswer(ids['1.1'], 'B')).toEqual({ kind: 'choice', checkable: true, correct: true, solution: 'Otrais ir pareizs.' });
    });
    it('nepareiza atbilde → correct = false un risinājums netiek atklāts', async () => {
      const r = await ex.checkAnswer(ids['1.1'], 'A');
      expect(r).toMatchObject({ correct: false, solution: '' });
    });
    it('tukša atbilde nekad nav pareiza', async () => {
      expect((await ex.checkAnswer(ids['1.1'], '')).correct).toBe(false);
      expect((await ex.checkAnswer(ids['1.1'], undefined)).correct).toBe(false);
    });
    it('vairākas pareizās atbildes: jāatzīmē tieši visas, secība nav svarīga, burtu lielums nav svarīgs', async () => {
      expect((await ex.checkAnswer(ids['1.2'], 'C, A')).correct).toBe(true);
      expect((await ex.checkAnswer(ids['1.2'], 'c;a')).correct).toBe(true);
      expect((await ex.checkAnswer(ids['1.2'], 'A')).correct).toBe(false);
      expect((await ex.checkAnswer(ids['1.2'], 'A, B, C')).correct).toBe(false);
    });
    it('atslēga formā "B) nē" tiek atpazīta', async () => {
      expect((await ex.checkAnswer(ids['1.10'], 'B')).correct).toBe(true);
    });
    it('atvērto uzdevumu un uzdevumu ar nederīgu atslēgu serveris nevērtē', async () => {
      expect(await ex.checkAnswer(ids['II.1'], 'jebkas')).toEqual({ kind: 'open', checkable: false });
      expect((await ex.checkAnswer(ids['1.3'], 'Z')).checkable).toBe(false);
    });
    it('nezināms uzdevums → null', async () => {
      expect(await ex.checkAnswer(2147483000, 'A')).toBeNull();
    });
    it('atvērtā uzdevuma paraugs ir pieejams, testa uzdevuma atbilde — nē', async () => {
      expect(await ex.openTaskAnswer(ids['II.1'])).toMatchObject({ answer: expect.stringMatching(/Kritēriji/) });
      expect(await ex.openTaskAnswer(ids['1.1'])).toBeNull();
    });
  });

  describe('gradeExam (eksāmena simulācija)', () => {
    it('vērtē visu eksāmenu vienā reizē, punkti pēc uzdevuma vērtības', async () => {
      const r = await ex.gradeExam(docId, { [ids['1.1']]: 'B', [ids['1.2']]: 'A', [ids['1.10']]: 'B' });
      const by = Object.fromEntries(r.tasks.map((t) => [t.id, t]));
      expect(by[ids['1.1']]).toMatchObject({ checkable: true, correct: true, points: 1 });
      expect(by[ids['1.2']]).toMatchObject({ checkable: true, correct: false, points: 2, correctKeys: 'A, C' });
      expect(by[ids['1.10']]).toMatchObject({ correct: true, points: 1 });
    });
    it('neatbildētais uzdevums ir nepareizs; atvērtajam atdod paraugu pašvērtējumam', async () => {
      const r = await ex.gradeExam(docId, {});
      const by = Object.fromEntries(r.tasks.map((t) => [t.id, t]));
      expect(by[ids['1.1']].correct).toBe(false);
      expect(by[ids['II.1']]).toMatchObject({ kind: 'open', checkable: false, points: 3 });
      expect(by[ids['II.1']].answer).toMatch(/Kritēriji/);
      expect(by[ids['1.3']].checkable).toBe(false);
    });
    it('nezināms eksāmens → null', async () => {
      expect(await ex.gradeExam(2147483000, {})).toBeNull();
    });
  });

  describe('mēģinājumi (exam_attempts)', () => {
    it('jaunākais mēģinājums uzvar, vecāks to nepārraksta', async () => {
      const u = await mkUser(db, 'att');
      await db.syncAttempts(u.id, [{ taskId: ids['1.1'], correct: false, at: '2026-05-01T10:00:00Z' }]);
      await db.syncAttempts(u.id, [{ taskId: ids['1.1'], correct: true, at: '2026-05-02T10:00:00Z' }]);
      await db.syncAttempts(u.id, [{ taskId: ids['1.1'], correct: false, at: '2026-04-01T10:00:00Z' }]);
      const got = await db.getAttempts(u.id);
      expect(got).toHaveLength(1);
      expect(got[0]).toMatchObject({ taskId: ids['1.1'], correct: true });
    });
    it('novecojis klients nevar izdzēst citur uzkrātos mēģinājumus', async () => {
      const u = await mkUser(db, 'att2');
      await db.syncAttempts(u.id, [{ taskId: ids['1.1'], correct: true, at: '2026-05-01T10:00:00Z' }, { taskId: ids['1.2'], correct: false, at: '2026-05-01T10:00:00Z' }]);
      await db.syncAttempts(u.id, [{ taskId: ids['1.10'], correct: true, at: '2026-05-03T10:00:00Z' }]);
      expect((await db.getAttempts(u.id)).map((a) => a.taskId).sort()).toEqual([ids['1.1'], ids['1.2'], ids['1.10']].sort());
    });
    it('nederīgi ieraksti tiek izlaisti, derīgie saglabāti', async () => {
      const u = await mkUser(db, 'att3');
      await db.syncAttempts(u.id, [
        { taskId: 'abc', correct: true, at: '2026-05-01T10:00:00Z' },
        { taskId: ids['1.1'], correct: 'jā', at: '2026-05-01T10:00:00Z' },
        { taskId: ids['1.2'], correct: true, at: 'nav-datums' },
        { taskId: -5, correct: true, at: '2026-05-01T10:00:00Z' },
        { taskId: ids['1.10'], correct: true, at: '2026-05-01T10:00:00Z' },
      ]);
      expect((await db.getAttempts(u.id)).map((a) => a.taskId)).toEqual([ids['1.10']]);
      await db.syncAttempts(u.id, 'nav-saraksts');
      await db.syncAttempts(u.id, null);
    });
    it('klients mēģinājumus redz kā data.examAttempts', async () => {
      const u = await mkUser(db, 'att4');
      await db.syncAttempts(u.id, [{ taskId: ids['1.1'], correct: true, at: '2026-05-01T10:00:00Z' }]);
      const data = await db.dataWithAttempts(await db.findById(u.id));
      expect(data.examAttempts).toEqual([{ taskId: ids['1.1'], correct: true, at: '2026-05-01T10:00:00.000Z' }]);
    });
  });

  describe('tēmu karte', () => {
    it('grupē pēc eksāmena daļas, skaita mēģinātos un pareizos, vājākās tēmas pirmās', async () => {
      const attempts = [
        { taskId: ids['1.1'], correct: false, at: '2026-05-01T10:00:00Z' },
        { taskId: ids['1.1'], correct: true, at: '2026-05-02T10:00:00Z' }, // jaunākais uzvar
        { taskId: ids['1.2'], correct: true, at: '2026-05-02T10:00:00Z' },
        { taskId: ids['1.10'], correct: false, at: '2026-05-02T10:00:00Z' },
      ];
      const map = await ex.topicMap({ examAttempts: attempts }, 12);
      const mine = map.find((s) => s.subject === SUBJECT);
      expect(mine.attempted).toBe(3);
      const reading = mine.topics.find((t) => t.name === 'Lasīšana');
      expect(reading).toMatchObject({ total: 4, attempted: 3, correct: 2, pct: 67 });
      const writing = mine.topics.find((t) => t.name === 'Rakstīšana');
      expect(writing).toMatchObject({ total: 1, attempted: 0, pct: null });
      expect(mine.topics[mine.topics.length - 1].name).toBe('Rakstīšana'); // nemēģinātās beigās
    });
    it('bez mēģinājumiem darbojas un neizmet kļūdu', async () => {
      const map = await ex.topicMap({}, 12);
      expect(map.find((s) => s.subject === SUBJECT).attempted).toBe(0);
    });
  });
});
