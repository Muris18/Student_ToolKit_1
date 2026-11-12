import React, { useMemo } from 'react';
import { mathToHtml, hasMath } from '../lib/mathHtml';

// Teksts ar matemātikas formulām. Pārveides loģika dzīvo lib/mathHtml.js (testējama bez React); šeit tikai komponents.
export { mathToHtml, hasMath };

export default function MathText({ text, as: Tag = 'div', className = '' }) {
  const html = useMemo(() => mathToHtml(text), [text]);
  return <Tag className={`math-text whitespace-pre-wrap ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
