// Hourly rate -> gross weekly / monthly / yearly
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const resultEl = get('result');
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

function calculate() {
  errorEl.textContent = '';
  const rate = Number(get('rate').value);
  const hours = Number(get('hours').value);
  const weeks = Number(get('weeks').value);
  const empty = ['rate', 'hours', 'weeks'].some((id) => get(id).value.trim() === '');
  if (empty || ![rate, hours, weeks].every(Number.isFinite) || rate <= 0 || hours <= 0 || weeks <= 0) {
    errorEl.textContent = 'Enter a rate, hours and weeks greater than 0.';
    resultEl.hidden = true;
    return;
  }
  if (hours > 168 || weeks > 52) {
    errorEl.textContent = 'Hours per week cannot exceed 168 and weeks per year cannot exceed 52.';
    resultEl.hidden = true;
    return;
  }
  const weekly = rate * hours;
  const yearly = weekly * weeks;
  const items = [['Per week', weekly], ['Per month', yearly / 12], ['Per year', yearly]];
  const stats = get('stats');
  stats.replaceChildren();
  for (const [label, value] of items) {
    const box = document.createElement('div');
    box.className = 'stat';
    const l = document.createElement('div');
    l.className = 'lead small';
    l.textContent = label;
    const v = document.createElement('strong');
    v.textContent = fmt(value);
    box.append(l, v);
    stats.append(box);
  }
  resultEl.hidden = false;
}

get('calc').addEventListener('click', calculate);
get('clear').addEventListener('click', () => {
  ['rate', 'hours'].forEach((id) => { get(id).value = ''; });
  get('weeks').value = '52';
  errorEl.textContent = '';
  resultEl.hidden = true;
});
