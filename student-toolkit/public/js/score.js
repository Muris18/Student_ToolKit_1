// Exam readiness score
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const resultEl = get('result');
const IDS = ['total', 'done', 'hours', 'needed', 'practice'];

function fail(msg) {
  errorEl.textContent = msg;
  resultEl.hidden = true;
}
function calculate() {
  errorEl.textContent = '';
  const total = Number(get('total').value);
  const done = Number(get('done').value);
  const hours = Number(get('hours').value);
  const needed = Number(get('needed').value);
  const hasPractice = get('practice').value.trim() !== '';
  const practice = Number(get('practice').value);
  if (['total', 'done', 'hours', 'needed'].some((id) => get(id).value.trim() === '')) {
    return fail('Fill in topics, hours studied and hours needed.');
  }
  if (![total, done, hours, needed].every(Number.isFinite) || total <= 0 || needed <= 0 || done < 0 || hours < 0) {
    return fail('Topics in total and hours needed must be greater than 0. Other numbers cannot be negative.');
  }
  if (done > total) return fail('Topics covered cannot be more than topics in total.');
  if (hasPractice && (!Number.isFinite(practice) || practice < 0 || practice > 100)) {
    return fail('Practice test result must be between 0 and 100.');
  }

  const coverage = done / total;
  const time = Math.min(hours / needed, 1);
  const score = hasPractice
    ? 0.4 * coverage + 0.3 * (practice / 100) + 0.3 * time
    : 0.55 * coverage + 0.45 * time;
  const pct = Math.round(score * 100);

  get('score').textContent = pct;
  get('label').textContent =
    pct < 40 ? 'Just getting started. Plan your topics and begin.' :
    pct < 60 ? 'Building up. Keep going and add a practice test.' :
    pct < 80 ? 'Getting there. Focus on the weak topics.' :
    'Well prepared. Keep revising and rest well.';
  const list = get('breakdown');
  list.replaceChildren();
  const lines = ['Topics covered: ' + Math.round(coverage * 100) + '%', 'Study time: ' + Math.round(time * 100) + '% of what you need'];
  if (hasPractice) lines.push('Practice test: ' + Math.round(practice) + '%');
  for (const text of lines) {
    const li = document.createElement('li');
    li.textContent = text;
    list.append(li);
  }
  resultEl.hidden = false;
}
get('calc').addEventListener('click', calculate);
get('clear').addEventListener('click', () => {
  IDS.forEach((id) => { get(id).value = ''; });
  errorEl.textContent = '';
  resultEl.hidden = true;
});
