// Required average on remaining work
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const resultEl = get('result');

function fail(msg) {
  errorEl.textContent = msg;
  resultEl.hidden = true;
}
function calculate() {
  errorEl.textContent = '';
  const ids = ['current', 'graded', 'target'];
  if (ids.some((id) => get(id).value.trim() === '')) return fail('Fill in all three fields.');
  const [current, graded, target] = ids.map((id) => Number(get(id).value));
  if (![current, graded, target].every(Number.isFinite) || [current, graded, target].some((v) => v < 0 || v > 100)) {
    return fail('All values must be between 0 and 100.');
  }
  const remaining = 100 - graded;
  if (remaining <= 0) return fail('Nothing is left to grade. Your final grade is ' + current.toFixed(1) + '%.');
  const need = (target * 100 - current * graded) / remaining;
  get('need').textContent = Math.max(need, 0).toFixed(1) + '%';
  get('message').textContent =
    need > 100 ? 'That is above 100%, so this target is not reachable with the remaining work.' :
    need <= 0 ? 'You have already secured this target, even with 0% on the rest.' :
    'This is the average you need on the remaining ' + remaining + '% of the grade.';
  resultEl.hidden = false;
}
get('calc').addEventListener('click', calculate);
get('clear').addEventListener('click', () => {
  ['current', 'graded', 'target'].forEach((id) => { get(id).value = ''; });
  errorEl.textContent = '';
  resultEl.hidden = true;
});
