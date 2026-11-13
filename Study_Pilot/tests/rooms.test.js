import { describe, it, expect } from 'vitest';
import { makeCode, normalizeCode, displayName, cleanQuestions, timerView, timerAfter, buildStats, dalibnieki, mmss, CODE_ALPHABET } from '../src/lib/rooms';

describe('istabas kods', () => {
  it('makeCode izmanto tikai drošo alfabētu un ir 6 simbolus garš', () => {
    for (let i = 0; i < 200; i++) {
      const c = makeCode();
      expect(c).toHaveLength(6);
      for (const ch of c) expect(CODE_ALPHABET).toContain(ch);
    }
    expect(CODE_ALPHABET).not.toMatch(/[01OI]/);
  });
  it('makeCode izmanto padoto skaitļu ģeneratoru', () => {
    expect(makeCode(() => 0)).toBe('AAAAAA');
  });
  it('normalizeCode: lielie burti, izmet atstarpes un domuzīmes', () => {
    expect(normalizeCode('abc-234')).toBe('ABC234');
    expect(normalizeCode(' k7m2pq ')).toBe('K7M2PQ');
  });
  it('normalizeCode atgriež null nederīgam kodam', () => {
    for (const v of [null, undefined, 42, '', 'ABC12', 'ABC1234', 'ABC10O', 'IIIIII']) expect(normalizeCode(v)).toBeNull();
  });
  it('normalizeCode noraida SQL injekcijas mēģinājumu', () => {
    expect(normalizeCode("ABC'; DROP TABLE rooms;--")).toBeNull();
    expect(normalizeCode("' OR 1=1 --")).toBeNull();
  });
});

describe('displayName', () => {
  it('rāda vārdu un uzvārda pirmo burtu, nekad pilnu uzvārdu', () => {
    expect(displayName({ firstName: 'Kristers', lastName: 'Mortuzāns' })).toBe('Kristers M.');
    expect(displayName({ firstName: 'Anna', lastName: 'ēriksone' })).toBe('Anna Ē.');
    expect(displayName({ firstName: 'Kristers', lastName: 'Mortuzāns' })).not.toContain('ortuz');
  });
  it('bez uzvārda tikai vārds, bez vārda "Dalībnieks"', () => {
    expect(displayName({ firstName: 'Anna' })).toBe('Anna');
    expect(displayName({})).toBe('Dalībnieks');
    expect(displayName(null)).toBe('Dalībnieks');
  });
});

describe('cleanQuestions', () => {
  const good = { question: 'Cik ir 2+2?', options: ['3', '4'], correctIndex: 1, explanation: 'Summa.' };
  it('pieņem derīgu jautājumu un piešķir id q1, q2…', () => {
    const r = cleanQuestions([good, { ...good, question: 'Cik ir 3+3?' }]);
    expect(r.map((q) => q.id)).toEqual(['q1', 'q2']);
    expect(r[0].correctIndex).toBe(1);
  });
  it('izmet nederīgos', () => {
    const bad = [
      null, 'x', { ...good, question: 'ab' }, { ...good, options: ['1'] }, { ...good, options: ['1', '2', '3', '4', '5', '6', '7'] },
      { ...good, options: ['1', ''] }, { ...good, correctIndex: 2 }, { ...good, correctIndex: -1 }, { ...good, correctIndex: 1.5 }, { ...good, correctIndex: '1' },
    ];
    expect(cleanQuestions(bad)).toEqual([]);
    expect(cleanQuestions('nav saraksts')).toEqual([]);
  });
  it('ierobežo garumus un skaitu', () => {
    const r = cleanQuestions([{ question: 'q'.repeat(3000), options: ['a'.repeat(900), 'b'], correctIndex: 0, explanation: 'e'.repeat(3000), context: 'c'.repeat(20000) }]);
    expect(r[0].question).toHaveLength(1500);
    expect(r[0].options[0]).toHaveLength(400);
    expect(r[0].explanation).toHaveLength(1200);
    expect(r[0].context).toHaveLength(8000);
    expect(cleanQuestions(Array.from({ length: 80 }, () => good))).toHaveLength(30);
  });
  it('taskId paliek tikai ar allowTaskId', () => {
    const withTask = { ...good, taskId: 77 };
    expect(cleanQuestions([withTask])[0].taskId).toBeUndefined();
    expect(cleanQuestions([withTask], { allowTaskId: true })[0].taskId).toBe(77);
    expect(cleanQuestions([{ ...good, taskId: 'x' }], { allowTaskId: true })[0].taskId).toBeUndefined();
    expect(cleanQuestions([{ ...good, taskId: -3 }], { allowTaskId: true })[0].taskId).toBeUndefined();
  });
});

describe('taimeris', () => {
  const idle = { total: 1500, left: 1500, endsAt: null };
  const t0 = 1_000_000;
  it('start, pauze un turpināšana', () => {
    const run = timerAfter('start', idle, t0);
    expect(timerView(run, t0 + 10_000)).toMatchObject({ left: 1490, running: true, done: false });
    const paused = timerAfter('pause', run, t0 + 100_000);
    expect(paused).toEqual({ total: 1500, left: 1400, endsAt: null });
    expect(timerView(paused, t0 + 500_000)).toMatchObject({ left: 1400, running: false });
    const resumed = timerAfter('start', paused, t0 + 500_000);
    expect(timerView(resumed, t0 + 510_000).left).toBe(1390);
  });
  it('start, kamēr iet, nemaina beigu laiku', () => {
    const run = timerAfter('start', idle, t0);
    expect(timerAfter('start', run, t0 + 5000).endsAt).toBe(run.endsAt);
  });
  it('pēc beigām start sāk no jauna', () => {
    const run = timerAfter('start', idle, t0);
    const after = t0 + 1500 * 1000 + 1;
    expect(timerView(run, after)).toMatchObject({ left: 0, running: false, done: true });
    const again = timerAfter('start', run, after);
    expect(timerView(again, after).left).toBe(1500);
  });
  it('reset atgriež pilnu laiku un aptur', () => {
    const run = timerAfter('start', idle, t0);
    expect(timerAfter('reset', run, t0 + 1000)).toEqual({ total: 1500, left: 1500, endsAt: null });
  });
  it('set drīkst tikai 15/25/45 un tikai kad neiet', () => {
    expect(timerAfter('set', idle, t0, 45)).toEqual({ total: 2700, left: 2700, endsAt: null });
    expect(timerAfter('set', idle, t0, 30)).toBeNull();
    expect(timerAfter('set', idle, t0, '25')).toBeNull();
    const run = timerAfter('start', idle, t0);
    expect(timerAfter('set', run, t0 + 1000, 15)).toBeNull();
    expect(timerAfter('nezināms', idle, t0)).toBeNull();
  });
});

describe('buildStats', () => {
  const qs = [{ id: 'q1', options: ['a', 'b', 'c'] }, { id: 'q2', options: ['a', 'b'] }];
  it('skaita atbildes pa variantiem un pareizās', () => {
    const s = buildStats(qs, [
      { questionId: 'q1', choice: 0, correct: true }, { questionId: 'q1', choice: 2, correct: false }, { questionId: 'q1', choice: 2, correct: false },
      { questionId: 'q2', choice: 1, correct: true },
    ]);
    expect(s.q1).toEqual({ answered: 3, correct: 1, counts: [1, 0, 2] });
    expect(s.q2).toEqual({ answered: 1, correct: 1, counts: [0, 1] });
  });
  it('ignorē nezināmus jautājumus un nederīgus variantus; bez atbildēm nulles', () => {
    const s = buildStats(qs, [{ questionId: 'q9', choice: 0, correct: true }, { questionId: 'q1', choice: 7, correct: true }]);
    expect(s.q1).toEqual({ answered: 0, correct: 0, counts: [0, 0, 0] });
    expect(s.q9).toBeUndefined();
  });
});

describe('palīgi', () => {
  it('dalibnieki', () => {
    expect(dalibnieki(1)).toBe('1 dalībnieks');
    expect(dalibnieki(2)).toBe('2 dalībnieki');
    expect(dalibnieki(11)).toBe('11 dalībnieki');
    expect(dalibnieki(21)).toBe('21 dalībnieks');
  });
  it('mmss', () => {
    expect(mmss(1500)).toBe('25:00');
    expect(mmss(65)).toBe('01:05');
    expect(mmss(-4)).toBe('00:00');
  });
});
