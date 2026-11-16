import { describe, it, expect } from 'vitest';
import { fmtTokens, aiLimitText, premiumFeatures, TOKENS_PER_QUESTION } from '../src/lib/plans';

// Tokenu limita teksti (sākumlapa, Premium lapa): cilvēkam saprotami skaitļi un aptuvens jautājumu skaits.
describe('AI limita teksti', () => {
  it('fmtTokens: tūkstoši un miljoni', () => {
    expect(fmtTokens(200000)).toBe('200 tūkst.');
    expect(fmtTokens(60000)).toBe('60 tūkst.');
    expect(fmtTokens(1000000)).toBe('1 milj.');
    expect(fmtTokens(1500000)).toBe('1.5 milj.');
  });
  it('aiLimitText: tokeni un aptuvens jautājumu skaits', () => {
    expect(aiLimitText(200000)).toBe(`200 tūkst. AI tokenu dienā (≈ ${200000 / TOKENS_PER_QUESTION} jautājumi)`);
    expect(aiLimitText(0)).toContain('0 tūkst.');
    expect(aiLimitText(undefined)).toContain('≈ 0 jautājumi');
  });
  it('premiumFeatures: pirmajā rindā abi limiti un noklusējumi, ja config tukšs', () => {
    expect(premiumFeatures({ aiTokensFree: 200000, aiTokensPremium: 1000000 })[0]).toBe('1 milj. AI tokenu dienā (≈ 400 jautājumi) (bezmaksas — 200 tūkst.)');
    expect(premiumFeatures()[0]).toContain('1 milj.');
  });
});
