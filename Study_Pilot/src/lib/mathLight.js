// Formulu atpazīšana un teksta aizsargāšana BEZ KaTeX (viegls modulis).
// Izmanto: src/lib/mathHtml.js (pilnā pārveide ar KaTeX) un src/components/MathText.js (lai KaTeX ielādētu tikai tad, kad tekstā ir formula).

export const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// $$...$$ | \[...\] | \(...\) | $...$ (bez atstarpes pie dolāriem, lai "5$ un 6$" netiktu uzskatīts par formulu)
export const MATH_RE = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)((?:\\\$|[^$\n])+?)(?<!\s)\$(?!\d)/g;

export function hasMath(text) {
  MATH_RE.lastIndex = 0;
  const r = MATH_RE.test(String(text ?? ''));
  MATH_RE.lastIndex = 0;
  return r;
}

// Teksts bez formulām -> drošs HTML (tas pats rezultāts, ko šādam tekstam dod mathToHtml)
export const plainToHtml = (text) => esc(String(text ?? ''));
