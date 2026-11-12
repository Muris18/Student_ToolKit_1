import crypto from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyWebhook } from '../src/server/stripe';

const SECRET = 'whsec_test_secret';
const BODY = '{"id":"evt_1","type":"customer.subscription.updated"}';
const NOW = 1_800_000_000; // sekundes

const sign = (body, t, secret = SECRET) => crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');

describe('verifyWebhook (Stripe paraksts)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW * 1000); });
  afterEach(() => { vi.useRealTimers(); });

  it('derīgs paraksts ar svaigu laika zīmogu', () => {
    expect(verifyWebhook(BODY, `t=${NOW},v1=${sign(BODY, NOW)}`, SECRET)).toBe(true);
  });

  it('nederīgs paraksts', () => {
    expect(verifyWebhook(BODY, `t=${NOW},v1=${'0'.repeat(64)}`, SECRET)).toBe(false);
  });

  it('paraksts ar citu noslēpumu neder', () => {
    expect(verifyWebhook(BODY, `t=${NOW},v1=${sign(BODY, NOW, 'whsec_cits')}`, SECRET)).toBe(false);
  });

  it('mainīts pieprasījuma saturs neder', () => {
    expect(verifyWebhook(`${BODY} `, `t=${NOW},v1=${sign(BODY, NOW)}`, SECRET)).toBe(false);
  });

  it('pārāk vecs laika zīmogs (atkārtošanas aizsardzība)', () => {
    const old = NOW - 301;
    expect(verifyWebhook(BODY, `t=${old},v1=${sign(BODY, old)}`, SECRET)).toBe(false);
  });

  it('laika zīmogs tieši pie pieļaujamās robežas (300 s) vēl der', () => {
    const t = NOW - 300;
    expect(verifyWebhook(BODY, `t=${t},v1=${sign(BODY, t)}`, SECRET)).toBe(true);
  });

  it('laika zīmogs nākotnē ārpus pieļaujamā logā neder', () => {
    const future = NOW + 301;
    expect(verifyWebhook(BODY, `t=${future},v1=${sign(BODY, future)}`, SECRET)).toBe(false);
  });

  it('pielāgojama pieļaujamā novirze', () => {
    const t = NOW - 100;
    const h = `t=${t},v1=${sign(BODY, t)}`;
    expect(verifyWebhook(BODY, h, SECRET, 50)).toBe(false);
    expect(verifyWebhook(BODY, h, SECRET, 200)).toBe(true);
  });

  it('trūkstošs galvenes lauks vai noslēpums', () => {
    expect(verifyWebhook(BODY, undefined, SECRET)).toBe(false);
    expect(verifyWebhook(BODY, '', SECRET)).toBe(false);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${sign(BODY, NOW)}`, '')).toBe(false);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${sign(BODY, NOW)}`, undefined)).toBe(false);
  });

  it('galvenē nav t vai nav neviena v1', () => {
    expect(verifyWebhook(BODY, `v1=${sign(BODY, NOW)}`, SECRET)).toBe(false);
    expect(verifyWebhook(BODY, `t=${NOW}`, SECRET)).toBe(false);
    expect(verifyWebhook(BODY, `t=${NOW},v0=${sign(BODY, NOW)}`, SECRET)).toBe(false); // v0 netiek akceptēts
    expect(verifyWebhook(BODY, 'sviests', SECRET)).toBe(false);
  });

  it('vairāki v1= (Stripe rotē noslēpumus): der, ja kāds no tiem ir pareizs', () => {
    const good = sign(BODY, NOW);
    const bad = 'f'.repeat(64);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${bad},v1=${good}`, SECRET)).toBe(true);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${good},v1=${bad}`, SECRET)).toBe(true);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${bad},v1=${'e'.repeat(64)}`, SECRET)).toBe(false);
  });

  it('pārāk īss vai garš paraksts neizraisa kļūdu (timingSafeEqual prasa vienādu garumu)', () => {
    expect(verifyWebhook(BODY, `t=${NOW},v1=abc`, SECRET)).toBe(false);
    expect(verifyWebhook(BODY, `t=${NOW},v1=${'a'.repeat(200)}`, SECRET)).toBe(false);
  });
});
