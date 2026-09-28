// Rule-based study planner (no AI)
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const planEl = get('plan');
const DAY = 86400000;

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

function make() {
  errorEl.textContent = '';
  planEl.replaceChildren();
  const topics = get('topics').value.split('\n').map((t) => t.trim()).filter(Boolean).slice(0, 200);
  if (!get('date').value) { errorEl.textContent = 'Pick your exam date.'; return; }
  const parts = get('date').value.split('-').map(Number);
  const exam = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = startOfDay(new Date());
  let days = Math.round((exam - today) / DAY); // days from today up to (not including) exam day
  if (days < 1) { errorEl.textContent = 'The exam date must be tomorrow or later.'; return; }
  if (!topics.length) { errorEl.textContent = 'Add at least one topic.'; return; }
  const hpd = get('hpd').value.trim() === '' ? null : Number(get('hpd').value);
  if (hpd !== null && (!Number.isFinite(hpd) || hpd <= 0 || hpd > 16)) {
    errorEl.textContent = 'Hours per day must be between 0 and 16.';
    return;
  }
  days = Math.min(days, 90);
  const start = new Date(exam.getTime() - days * DAY);
  const revision = days >= 3;
  const studyDays = revision ? days - 1 : days;

  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * DAY);
    let task;
    if (revision && d === days - 1) {
      task = 'Revision day: go over all topics and do practice questions.';
    } else {
      const from = Math.floor((d * topics.length) / studyDays);
      const to = Math.floor(((d + 1) * topics.length) / studyDays);
      task = to > from ? topics.slice(from, to).join(', ') : 'Practice questions on earlier topics.';
    }
    const li = document.createElement('li');
    li.className = 'item';
    const box = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) +
      (hpd ? ' · ' + hpd + ' h' : '');
    const text = document.createElement('div');
    text.className = 'lead small';
    text.textContent = task;
    box.append(title, text);
    li.append(box);
    planEl.append(li);
  }
}
get('calc').addEventListener('click', make);
get('clear').addEventListener('click', () => {
  get('topics').value = '';
  get('date').value = '';
  get('hpd').value = '';
  errorEl.textContent = '';
  planEl.replaceChildren();
});
