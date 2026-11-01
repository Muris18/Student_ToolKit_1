import React, { useMemo } from 'react';
import katex from 'katex';

// Teksts ar matemātikas formulām: $...$ rindā, $$...$$ vai \[...\] atsevišķā rindā, \(...\) rindā.
// Pārējais teksts tiek droši aizsargāts (HTML netiek izpildīts), rindu pārnesumi saglabājas.
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// $$...$$ | \[...\] | \(...\) | $...$ (bez atstarpes pie dolāriem, lai "5$ un 6$" netiktu uzskatīts par formulu)
const RE = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)((?:\\\$|[^$\n])+?)(?<!\s)\$(?!\d)/g;

function render(tex, displayMode) {
  try {
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

export function hasMath(text) {
  RE.lastIndex = 0;
  const r = RE.test(String(text ?? ''));
  RE.lastIndex = 0;
  return r;
}

export default function MathText({ text, as: Tag = 'div', className = '' }) {
  const html = useMemo(() => mathToHtml(text), [text]);
  return <Tag className={`math-text whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
