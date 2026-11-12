import { describe, expect, it } from 'vitest';
import { hasMath, mathToHtml } from '../src/lib/mathHtml';

// Izvadē nedrīkst parādīties izpildāms HTML: nekādu <script>, <img>, <iframe>, <a href="javascript:">, on*= atribūtu.
const hasTag = (html, name) => new RegExp(`<${name}[\\s>/]`, 'i').test(html);
const hasEventAttr = (html) => /<[^>]*\son\w+\s*=/i.test(html);
const hasJsUrl = (html) => /(href|src|xlink:href)\s*=\s*["']?\s*(javascript|data|vbscript):/i.test(html);

function expectSafe(html) {
  expect(hasTag(html, 'script')).toBe(false);
  expect(hasTag(html, 'img')).toBe(false);
  expect(hasTag(html, 'iframe')).toBe(false);
  expect(hasTag(html, 'object')).toBe(false);
  expect(hasTag(html, 'embed')).toBe(false);
  expect(hasTag(html, 'a')).toBe(false); // KaTeX ar trust:false nedrīkst izveidot saites
  expect(hasEventAttr(html)).toBe(false);
  expect(hasJsUrl(html)).toBe(false);
}

describe('mathToHtml: parasts teksts', () => {
  it('<script> tiek parādīts kā teksts, nevis izpildīts', () => {
    const html = mathToHtml('<script>alert(1)</script>');
    expectSafe(html);
    expect(html).toContain('&lt;script&gt;');
  });

  it('<img onerror> tiek parādīts kā teksts', () => {
    const html = mathToHtml('<img src=x onerror=alert(1)>');
    expectSafe(html);
    expect(html).toContain('&lt;img');
  });

  it('visi HTML simboli tiek aizsargāti: & < > " \'', () => {
    const html = mathToHtml(`a & b < c > d "e" 'f'`);
    expect(html).toBe('a &amp; b &lt; c &gt; d &quot;e&quot; &#39;f&#39;');
  });

  it('iekļauti HTML simboli pie formulām netiek izpildīti', () => {
    const html = mathToHtml('"><script>alert(1)</script> un $x^2$ un <b onmouseover=alert(1)>teksts</b>');
    expectSafe(html);
    expect(html).toContain('katex');
    expect(html).toContain('&lt;b onmouseover');
  });

  it('rindu pārnesumi un parasts teksts saglabājas', () => {
    expect(mathToHtml('pirmā\notrā')).toBe('pirmā\notrā');
    expect(mathToHtml(null)).toBe('');
    expect(mathToHtml(undefined)).toBe('');
    expect(mathToHtml(42)).toBe('42');
  });

  it('naudas summas ar $ netiek uzskatītas par formulām', () => {
    expect(hasMath('Cena ir 5$ un 6$')).toBe(false);
    expect(hasMath('Formula $x^2$ ir derīga')).toBe(true);
  });
});

describe('mathToHtml: ļaunprātīgas formulas (KaTeX ar trust:false)', () => {
  const attacks = [
    '$\\href{javascript:alert(1)}{x}$',
    '$\\url{javascript:alert(1)}$',
    '$\\href{data:text/html,<script>alert(1)</script>}{x}$',
    '$\\includegraphics{x.png}$',
    '$\\htmlClass{x}{y}$',
    '$\\htmlId{x}{y}$',
    '$\\htmlStyle{background:url(javascript:alert(1))}{y}$',
    '$\\htmlData{x=y}{z}$',
    '$$\\href{javascript:alert(1)}{x}$$',
    '\\(\\href{javascript:alert(1)}{x}\\)',
    '\\[\\url{javascript:alert(1)}\\]',
    '$x<script>alert(1)</script>$',
    '$\\text{<img src=x onerror=alert(1)>}$',
    '$\\text{"><svg onload=alert(1)>}$',
  ];

  for (const a of attacks) {
    it(`droši: ${a}`, () => {
      const html = mathToHtml(a);
      expectSafe(html);
      expect(hasTag(html, 'svg') && /onload|onerror/i.test(html)).toBe(false);
    });
  }

  it('normāla formula tiek attēlota ar KaTeX', () => {
    const html = mathToHtml('Aprēķini $\\frac{a}{b} + \\sqrt{2}$ un $$x^2 + 1 = 0$$');
    expect(html).toContain('katex');
    expect(html).toContain('katex-display');
    expect(hasEventAttr(html)).toBe(false);
  });

  it('nederīga formula neizraisa kļūdu un nerada izpildāmu HTML', () => {
    const html = mathToHtml('$\\unknowncommand{<script>}$ un $\\frac{1$');
    expectSafe(html);
  });
});
