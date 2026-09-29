// Dashboard: reads data saved by other tools
const dash = document.getElementById('dash');

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v === null ? fallback : v;
  } catch (e) { return fallback; }
}
function dayKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function card(title, linkText, href) {
  const c = el('section', 'panel');
  c.append(el('h2', 'dash-title', title));
  const body = el('div');
  c.append(body);
  const a = el('a', 'small', linkText);
  a.href = href;
  c.append(a);
  dash.append(c);
  return body;
}
function daysLeft(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d + ' d ' + h + ' h';
}

const now = Date.now();

// Next exam
const exams = (read('exams', []) || []).filter((e) => e && Number.isFinite(e.time) && e.time > now).sort((a, b) => a.time - b.time);
const examBody = card('Next exam', 'Open Exam Countdown', 'countdown.html');
if (exams.length) {
  examBody.append(el('div', 'big', daysLeft(exams[0].time - now)));
  examBody.append(el('div', 'lead small', exams[0].name + ' · ' + new Date(exams[0].time).toLocaleDateString()));
} else {
  examBody.append(el('p', 'lead', 'No upcoming exams. Add one to start a countdown.'));
}

// Deadlines
const deadlines = (read('deadlines', []) || []).filter((d) => d && !d.done && Number.isFinite(d.time)).sort((a, b) => a.time - b.time);
const dlBody = card('Next deadlines', 'Open Deadline Radar', 'deadlines.html');
if (deadlines.length) {
  const ul = el('ul', 'plain-list');
  for (const d of deadlines.slice(0, 4)) {
    const li = el('li');
    li.append(el('strong', '', d.title));
    li.append(el('span', 'lead small', ' · ' + (d.time < now ? 'overdue' : daysLeft(d.time - now))));
    ul.append(li);
  }
  dlBody.append(ul);
} else {
  dlBody.append(el('p', 'lead', 'No open deadlines. Nice, or add your first one.'));
}

// Streak
const log = (read('streaks', {}) || {}).log || {};
const stBody = card('Study streak', 'Open Student Streaks', 'streaks.html');
let xp = 0;
for (const v of Object.values(log)) if (Number.isFinite(v)) xp += v;
const d = new Date();
if (!log[dayKey(d)]) d.setDate(d.getDate() - 1);
let streak = 0;
while (log[dayKey(d)] > 0) { streak += 1; d.setDate(d.getDate() - 1); }
stBody.append(el('div', 'big', streak + ' days'));
stBody.append(el('div', 'lead small', xp + ' XP · level ' + (Math.floor(xp / 250) + 1)));

// Quick links
const quick = card('Quick tools', 'All tools', '../index.html');
const links = el('div', 'quick');
for (const [name, href] of [['GPA', 'gpa.html'], ['Pomodoro', 'pomodoro.html'], ['Budget', 'budget.html'], ['Study Planner', 'planner.html'], ['Student Score', 'score.html']]) {
  const a = el('a', 'chip', name);
  a.href = href;
  links.append(a);
}
quick.append(links);
