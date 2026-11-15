// Teksts ar matemātikas formulām -> drošs HTML (KaTeX). Tīra funkcija bez React, lai to varētu testēt.
// Formulas: $...$ rindā, $$...$$ vai \[...\] atsevišķā rindā, \(...\) rindā.
// Pārējais teksts tiek droši aizsargāts (HTML netiek izpildīts), rindu pārnesumi saglabājas.
// Formulu atpazīšana (regulārā izteiksme, hasMath) dzīvo lib/mathLight.js bez KaTeX, lai lapas bez formulām KaTeX neielādētu.
import katex from 'katex';
import { esc, MATH_RE as RE, hasMath } from './mathLight';

export { hasMath };

function render(tex, displayMode) {
  try {
    // trust: false — KaTeX neatļauj \href, \url, \includegraphics u.c. potenciāli bīstamas komandas
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml', trust: false, maxSize: 20, maxExpand: 500 });
  } catch {
    return esc(tex);
  }
}

export function mathToHtml(text) {
  const s = String(text ?? '');
  let out = '';
  let last = 0;
  for (const m of s.matchAll(RE)) {
    out += esc(s.slice(last, m.index));
    if (m[1] !== undefined) out += render(m[1].trim(), true);
    else if (m[2] !== undefined) out += render(m[2].trim(), true);
    else if (m[3] !== undefined) out += render(m[3].trim(), false);
    else out += render(m[4], false);
    last = m.index + m[0].length;
  }
  return out + esc(s.slice(last));
}
