import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import importer from '../scripts/import-exams.js';

// Eksāmenu faili (exams/*.json): formāts tiek pārbaudīts ar to pašu validāciju, ko izmanto npm run import:exams.
const dir = path.join(__dirname, '..', 'exams');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
const docs = files.map((f) => ({ f, d: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));

describe('exams/*.json', () => {
  it('mapē ir eksāmenu faili', () => {
    expect(files.length).toBeGreaterThan(20);
  });
  it.each(docs.map((x) => [x.f, x.d]))('%s: derīgs formāts (import validācija)', (f, d) => {
    expect(() => importer.validate(f, d)).not.toThrow();
  });
  it('(priekšmets, klase, gads, sesija) ir unikāls katram failam', () => {
    const keys = docs.map(({ d }) => [d.subject, d.grade, d.year, d.session || ''].join('|'));
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('platformā ir tikai latviešu valoda, angļu valoda un matemātika (dabaszinātņu parauga vairs nav)', () => {
    const subjects = new Set(docs.map(({ d }) => d.subject));
    expect([...subjects].sort()).toEqual(['angļu valoda', 'latviešu valoda', 'matemātika']);
    expect(files.some((f) => /dabaszin/i.test(f))).toBe(false);
  });
  it('klases ir tikai 9 un 12', () => {
    for (const { d } of docs) expect([9, 12]).toContain(Number(d.grade));
  });
  it('testa uzdevumiem ir atbildes atslēga', () => {
    for (const { f, d } of docs) {
      for (const t of d.tasks) {
        const n = importer.normalizeTask(t, d);
        if (n.kind === 'choice') expect(n.answer.trim(), `${f} ${t.number}`).not.toBe('');
      }
    }
  });
});
