// Nolasa content/<name>.md un pārvērš HTML. Izmanto TIKAI getStaticProps (servera pusē, build laikā).
import fs from 'fs';
import path from 'path';
import { markdownToHtml, hasPlaceholders } from './markdown';

export function loadLegal(name) {
  const md = fs.readFileSync(path.join(process.cwd(), 'content', `${name}.md`), 'utf8');
  return { html: markdownToHtml(md), draft: hasPlaceholders(md) };
}
