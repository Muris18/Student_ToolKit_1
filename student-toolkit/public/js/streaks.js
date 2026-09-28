// Study streaks and XP, saved locally
const KEY = 'streaks';
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const XP_PER_LEVEL = 250;
let log = {};

function dayKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (raw && typeof raw.log === 'object' && raw.log) {
      for (const [k, v] of Object.entries(raw.log)) if (Number.isFinite(v) && v > 0) log[k] = v;
    }
  } catch (e) { log = {}; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ log })); } catch (e) {}
}
function streak() {
  const d = new Date();
  if (!log[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (log[dayKey(d)] > 0) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
}
function stat(label, value) {
  const box = document.createElement('div');
  box.className = 'stat';
  const l = document.createElement('div');
  l.className = 'lead small';
  l.textContent = label;
  const v = document.createElement('strong');
  v.textContent = value;
  box.append(l, v);
  return box;
}
function render() {
  const xp = Object.values(log).reduce((a, b) => a + b, 0);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const today = log[dayKey(new Date())] || 0;
  get('stats').replaceChildren(
    stat('Streak', streak() + ' days'), stat('Total XP', xp), stat('Level', level), stat('Studied today', today + ' min')
  );
  get('fill').style.width = Math.round((into / XP_PER_LEVEL) * 100) + '%';
  get('next').textContent = (XP_PER_LEVEL - into) + ' XP to level ' + (level + 1);
  const week = get('week');
  week.replaceChildren();
  const values = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    values.push([d.toLocaleDateString([], { weekday: 'short' }), log[dayKey(d)] || 0]);
  }
  const max = Math.max(60, ...values.map((v) => v[1]));
  for (const [label, minutes] of values) {
    const col = document.createElement('div');
    col.className = 'col';
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = Math.round((minutes / max) * 100) + '%';
    bar.title = minutes + ' min';
    const val = document.createElement('div');
    val.className = 'small';
    val.textContent = minutes;
    const name = document.createElement('div');
    name.className = 'small';
    name.textContent = label;
    col.append(val, bar, name);
    week.append(col);
  }
}
get('log').addEventListener('click', () => {
  errorEl.textContent = '';
  const m = Math.floor(Number(get('minutes').value));
  if (!Number.isFinite(m) || m < 1 || m > 600) {
    errorEl.textContent = 'Enter between 1 and 600 minutes.';
    return;
  }
  const key = dayKey(new Date());
  log[key] = (log[key] || 0) + m;
  save();
  render();
});
get('reset').addEventListener('click', () => {
  if (confirm('Delete all streak and XP progress on this device?')) {
    log = {};
    save();
    render();
  }
});
load();
render();
