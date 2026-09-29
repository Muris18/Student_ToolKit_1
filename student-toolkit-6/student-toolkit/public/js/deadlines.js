// Deadline radar with local persistence
const KEY = 'deadlines';
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const errorEl = document.getElementById('error');
const summaryEl = document.getElementById('summary');
let items = [];

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(raw)) items = raw.filter((i) => i && typeof i.title === 'string' && Number.isFinite(i.time));
  } catch (e) { items = []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}
function level(item, now) {
  if (item.done) return ['done', 'Done'];
  const ms = item.time - now;
  if (ms < 0) return ['overdue', 'Overdue'];
  if (ms < 48 * 3600000) return ['soon', 'Due within 48 h'];
  if (ms < 7 * 86400000) return ['week', 'This week'];
  return ['later', 'Later'];
}
function leftText(ms) {
  if (ms < 0) return 'Passed ' + Math.floor(-ms / 3600000) + ' h ago';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d + ' d ' + h + ' h left';
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
  const now = Date.now();
  items.sort((a, b) => (a.done - b.done) || (a.time - b.time));
  listEl.replaceChildren();
  emptyEl.hidden = items.length > 0;
  const open = items.filter((i) => !i.done);
  summaryEl.replaceChildren(
    stat('Overdue', open.filter((i) => i.time < now).length),
    stat('Next 48 hours', open.filter((i) => i.time >= now && i.time - now < 48 * 3600000).length),
    stat('Next 7 days', open.filter((i) => i.time >= now && i.time - now < 7 * 86400000).length)
  );
  for (const item of items) {
    const [cls, label] = level(item, now);
    const li = document.createElement('li');
    li.className = 'item ' + cls;
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.title + (item.course ? ' · ' + item.course : '');
    const date = document.createElement('div');
    date.className = 'lead small';
    date.textContent = new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) +
      (item.done ? '' : ' · ' + leftText(item.time - now));
    const badge = document.createElement('span');
    badge.className = 'badge ' + cls;
    badge.textContent = label;
    info.append(title, date, badge);
    const actions = document.createElement('div');
    actions.className = 'buttons tight';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'remove';
    toggle.textContent = item.done ? 'Undo' : 'Done';
    toggle.addEventListener('click', () => { item.done = !item.done; save(); render(); });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove';
    del.textContent = 'Remove';
    del.setAttribute('aria-label', 'Remove ' + item.title);
    del.addEventListener('click', () => { items = items.filter((i) => i !== item); save(); render(); });
    actions.append(toggle, del);
    li.append(info, actions);
    listEl.append(li);
  }
}
function add() {
  errorEl.textContent = '';
  const title = document.getElementById('title').value.trim();
  const time = new Date(document.getElementById('when').value).getTime();
  if (!title) { errorEl.textContent = 'Enter what is due.'; return; }
  if (!document.getElementById('when').value || !Number.isFinite(time)) {
    errorEl.textContent = 'Pick a due date and time.';
    return;
  }
  items.push({
    title: title.slice(0, 80),
    course: document.getElementById('course').value.trim().slice(0, 40),
    time,
    done: false,
  });
  save();
  ['title', 'course', 'when'].forEach((id) => { document.getElementById(id).value = ''; });
  render();
}
document.getElementById('add').addEventListener('click', add);
load();
render();
setInterval(render, 60000);
