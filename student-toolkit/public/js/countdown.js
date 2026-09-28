// Exam countdown with local persistence
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const errorEl = document.getElementById('error');
const nameEl = document.getElementById('name');
const whenEl = document.getElementById('when');
const KEY = 'exams';
let exams = [];

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(raw)) exams = raw.filter((e) => e && typeof e.name === 'string' && Number.isFinite(e.time));
  } catch (e) { exams = []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(exams)); } catch (e) {}
}
function remainingText(ms) {
  if (ms <= 0) return 'Exam time has passed';
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return d + ' d  ' + h + ' h  ' + m + ' min  ' + s + ' s';
}
function render() {
  exams.sort((a, b) => a.time - b.time);
  listEl.replaceChildren();
  emptyEl.hidden = exams.length > 0;
  for (const exam of exams) {
    const li = document.createElement('li');
    li.className = 'item';
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = exam.name;
    const date = document.createElement('div');
    date.className = 'lead small';
    date.textContent = new Date(exam.time).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
    const left = document.createElement('div');
    left.className = 'left';
    left.dataset.time = exam.time;
    info.append(title, date, left);
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove';
    del.textContent = 'Remove';
    del.setAttribute('aria-label', 'Remove ' + exam.name);
    del.addEventListener('click', () => {
      exams = exams.filter((e) => e !== exam);
      save();
      render();
    });
    li.append(info, del);
    listEl.append(li);
  }
  update();
}
function update() {
  const now = Date.now();
  listEl.querySelectorAll('.left').forEach((el) => {
    el.textContent = remainingText(Number(el.dataset.time) - now);
  });
}
function add() {
  errorEl.textContent = '';
  const name = nameEl.value.trim() || 'Exam';
  const time = new Date(whenEl.value).getTime();
  if (!whenEl.value || !Number.isFinite(time)) {
    errorEl.textContent = 'Pick a date and time for the exam.';
    return;
  }
  exams.push({ name: name.slice(0, 80), time });
  save();
  nameEl.value = '';
  whenEl.value = '';
  render();
}
document.getElementById('add').addEventListener('click', add);
load();
render();
setInterval(update, 1000);
