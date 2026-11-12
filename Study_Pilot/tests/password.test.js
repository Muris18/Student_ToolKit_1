import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { checkPassword, dummyPasswordCheck, hashPassword, newSalt, passwordProblem } from '../src/lib/password';

describe('passwordProblem', () => {
  it('pieņem normālu paroli', () => {
    expect(passwordProblem('Labs-Paroles-teksts1')).toBeNull();
    expect(passwordProblem('abcdefgh')).toBeNull(); // tikai burti ir atļauti
    expect(passwordProblem('a1b2c3d4')).toBeNull();
  });

  it('noraida pārāk īsu (< 8 simboli)', () => {
    expect(passwordProblem('abc123')).toMatch(/vismaz 8/);
    expect(passwordProblem('1234567')).toMatch(/vismaz 8/);
    expect(passwordProblem('')).toMatch(/vismaz 8/);
    expect(passwordProblem(undefined)).toMatch(/vismaz 8/);
    expect(passwordProblem(null)).toMatch(/vismaz 8/);
  });

  it('robeža: tieši 8 simboli ir derīgi, 200 ir derīgi, 201 ir pārāk gara', () => {
    expect(passwordProblem('abcdefg1')).toBeNull();
    expect(passwordProblem('a'.repeat(200))).toBeNull();
    expect(passwordProblem('a'.repeat(201))).toMatch(/pārāk gara/);
  });

  it('noraida paroli, kas sastāv tikai no cipariem', () => {
    expect(passwordProblem('9876543210')).toMatch(/ne tikai cipariem/);
    expect(passwordProblem('00000000')).toMatch(/ne tikai cipariem/);
  });

  it('noraida paroli, kas ir tāda pati kā e-pasts (neatkarīgi no reģistra)', () => {
    expect(passwordProblem('jānis@example.com', 'jānis@example.com')).toMatch(/e-pasts/);
    expect(passwordProblem('JANIS@EXAMPLE.COM', 'janis@example.com')).toMatch(/e-pasts/);
    // citu paroli ar tādu e-pastu atļauj
    expect(passwordProblem('Cita-Parole-99', 'janis@example.com')).toBeNull();
    // bez e-pasta pārbaude netiek veikta
    expect(passwordProblem('janis@example.com')).toBeNull();
  });

  it('noraida bieži lietotas vienkāršas paroles (arī ar citu reģistru)', () => {
    for (const p of ['password', 'PASSWORD', 'Parole123', 'qwertyui', 'studypilot', 'StudyPilot']) {
      expect(passwordProblem(p)).toMatch(/pārāk vienkārša/);
    }
    // "12345678" ir tikai cipari, tāpēc to noķer cipara noteikums
    expect(passwordProblem('12345678')).toMatch(/ne tikai cipariem/);
  });
});

describe('paroles hash (asinhrons)', () => {
  it('atpakaļsaderība: tas pats hash kā iepriekšējais scryptSync (esošie lietotāji var pieslēgties)', async () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const old = crypto.scryptSync('Mana-Parole-1', salt, 64).toString('hex');
    expect(await hashPassword('Mana-Parole-1', salt)).toBe(old);
    expect(old).toHaveLength(128); // 64 baiti hex formātā
  });

  it('newSalt: 16 baiti hex (32 simboli), katru reizi cits', () => {
    const a = newSalt();
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(newSalt()).not.toBe(a);
  });

  it('checkPassword: pareiza parole der, nepareiza neder', async () => {
    const salt = newSalt();
    const user = { salt, passHash: await hashPassword('Pareiza-Parole-7', salt) };
    expect(await checkPassword(user, 'Pareiza-Parole-7')).toBe(true);
    expect(await checkPassword(user, 'Nepareiza-Parole-7')).toBe(false);
    expect(await checkPassword(user, 'pareiza-parole-7')).toBe(false); // reģistrjutīga
    expect(await checkPassword(user, '')).toBe(false);
    expect(await checkPassword(user, undefined)).toBe(false);
    expect(await checkPassword(user, null)).toBe(false);
  });

  it('checkPassword: bojāts saglabātais hash neizraisa kļūdu, bet noraida', async () => {
    const user = { salt: newSalt(), passHash: 'abc' };
    expect(await checkPassword(user, 'jebkura-parole-1')).toBe(false);
  });

  it('dummyPasswordCheck: vienmēr false, bet izpilda īstu hash darbu (konstants laiks)', async () => {
    const t0 = process.hrtime.bigint();
    expect(await dummyPasswordCheck('jebkura-parole-1')).toBe(false);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    expect(ms).toBeGreaterThan(5); // scrypt ar noklusējuma parametriem prasa desmitiem milisekunžu
    expect(await dummyPasswordCheck(undefined)).toBe(false);
  });
});
