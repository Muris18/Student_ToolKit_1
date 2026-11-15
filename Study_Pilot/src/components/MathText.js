import React, { useEffect, useMemo, useState } from 'react';
import { hasMath, plainToHtml } from '../lib/mathLight';

// Teksts ar matemātikas formulām. Pārveides loģika dzīvo lib/mathHtml.js (ar KaTeX, testējama bez React).
// KaTeX (~80 KB) tiek ielādēts atsevišķi un tikai tad, kad tekstā ir formula; līdz tam (un tekstam bez formulām)
// tiek rādīts droši aizsargāts teksts. Pēc pirmās ielādes modulis paliek atmiņā, un formulas zīmējas uzreiz.
let mathMod = null;
let loading = null;
const loadMath = () => loading || (loading = import('../lib/mathHtml').then((m) => { mathMod = m; return m; }));

// Ielādē KaTeX iepriekš, kad pārlūks ir brīvs (izsauc AppShell pēc pieslēgšanās), lai formulas nemirgo kā neapstrādāts teksts
export function preloadMath() {
  if (mathMod || typeof window === 'undefined') return;
  const run = () => loadMath().catch(() => { loading = null; });
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 800);
}

export default function MathText({ text, as: Tag = 'div', className = '' }) {
  const needs = useMemo(() => hasMath(text), [text]);
  const [ready, setReady] = useState(Boolean(mathMod));
  useEffect(() => {
    if (!needs || mathMod) return undefined;
    let alive = true;
    loadMath().then(() => { if (alive) setReady(true); }).catch(() => { loading = null; });
    return () => { alive = false; };
  }, [needs]);
  // ready ir atkarībās, lai pēc KaTeX ielādes teksts tiktu pārzīmēts ar formulām
  const html = useMemo(() => (needs && mathMod ? mathMod.mathToHtml(text) : plainToHtml(text)), [text, needs, ready]);
  return <Tag className={`math-text whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
