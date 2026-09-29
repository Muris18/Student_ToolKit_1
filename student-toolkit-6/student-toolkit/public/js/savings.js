// Savings calculator (no interest)
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const resultEl = get('result');

function calculate() {
  errorEl.textContent = '';
  const goal = Number(get('goal').value);
  const have = get('have').value.trim() === '' ? 0 : Number(get('have').value);
  const monthly = Number(get('monthly').value);
  if (get('goal').value.trim() === '' || !Number.isFinite(goal) || goal <= 0) {
    errorEl.textContent = 'Enter a savings goal greater than 0.';
    resultEl.hidden = true;
    return;
  }
  if (!Number.isFinite(have) || have < 0) {
    errorEl.textContent = 'Saved so far cannot be negative.';
    resultEl.hidden = true;
    return;
  }
  if (have >= goal) {
    get('time').textContent = 'Done';
    get('summary').textContent = 'You have already reached your goal.';
    resultEl.hidden = false;
    return;
  }
  if (get('monthly').value.trim() === '' || !Number.isFinite(monthly) || monthly <= 0) {
    errorEl.textContent = 'Enter a monthly amount greater than 0.';
    resultEl.hidden = true;
    return;
  }
  const months = Math.ceil((goal - have) / monthly);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(years + (years === 1 ? ' year' : ' years'));
  if (rest || !years) parts.push(rest + (rest === 1 ? ' month' : ' months'));
  const target = new Date();
  target.setMonth(target.getMonth() + months);
  get('time').textContent = parts.join(' ');
  get('summary').textContent = months + ' months in total. You would reach your goal around ' +
    target.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) + '.';
  resultEl.hidden = false;
}

get('calc').addEventListener('click', calculate);
get('clear').addEventListener('click', () => {
  ['goal', 'have', 'monthly'].forEach((id) => { get(id).value = ''; });
  errorEl.textContent = '';
  resultEl.hidden = true;
});
