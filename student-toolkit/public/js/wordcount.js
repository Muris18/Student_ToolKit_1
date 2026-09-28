// Word / character counter
const textEl = document.getElementById('text');
const statsEl = document.getElementById('stats');

function counts(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const sentences = (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  return [
    ['Words', words],
    ['Characters', [...text].length],
    ['Characters without spaces', [...text.replace(/\s/g, '')].length],
    ['Sentences', sentences],
    ['Paragraphs', paragraphs],
    ['Reading time', words ? Math.max(1, Math.ceil(words / 200)) + ' min' : '0 min'],
  ];
}
function update() {
  statsEl.replaceChildren();
  for (const [label, value] of counts(textEl.value)) {
    const box = document.createElement('div');
    box.className = 'stat';
    const l = document.createElement('div');
    l.className = 'lead small';
    l.textContent = label;
    const v = document.createElement('strong');
    v.textContent = value;
    box.append(l, v);
    statsEl.append(box);
  }
}
textEl.addEventListener('input', update);
document.getElementById('clear').addEventListener('click', () => {
  textEl.value = '';
  update();
  textEl.focus();
});
update();
