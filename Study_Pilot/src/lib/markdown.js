// Neliels Markdown -> HTML pārveidotājs privātuma politikai (bez papildu bibliotēkām).
// Atbalsta: # virsrakstus, rindkopas, sarakstus (-), tabulas (|), **treknrakstu**, `kodu`,
// [saites](url) un rindas pārnesumu ar divām atstarpēm rindas beigās. Ievades HTML tiek aizsargāts.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    if (!/^(https?:\/\/|\/|mailto:)/.test(url)) return label;
    return `<a href="${url}"${url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  return s;
}

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null;

  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p>${para.map((l, i) => inline(l.trim()) + (i < para.length - 1 && / {2,}$/.test(l) ? '<br>' : '')).join(' ')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flushPara(); flushList(); continue; }

    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara(); flushList();
      const n = h[1].length;
      out.push(`<h${n}>${inline(h[2])}</h${n}>`);
      continue;
    }

    if (t === '---') { flushPara(); flushList(); out.push('<hr>'); continue; }

    if (t.startsWith('|') && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flushPara(); flushList();
      const head = cells(t);
      i += 1;
      const rows = [];
      while (lines[i + 1] && lines[i + 1].trim().startsWith('|')) rows.push(cells(lines[++i]));
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>` +
          `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      );
      continue;
    }

    const li = t.match(/^[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      (list = list || []).push(li[1]);
      continue;
    }

    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join('\n');
}

// Vai tekstā vēl ir neaizpildītas vietas, piem. [datums] (bet ne [saite](url))
export const hasPlaceholders = (md) => /\[[^\]\n]+\](?!\()/.test(md);
