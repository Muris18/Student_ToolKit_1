// Budget calculator: income minus expenses, live
const EXPENSES = [
  ['rent', 'Rent / housing'],
  ['food', 'Food'],
  ['transport', 'Transport'],
  ['fun', 'Entertainment'],
  ['other', 'Other expenses'],
];
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const num = (id) => {
  const v = Number(document.getElementById(id).value);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

function update() {
  const income = num('income');
  const rows = EXPENSES.map(([id, label]) => [label, num(id)]);
  const spent = rows.reduce((sum, r) => sum + r[1], 0);
  const left = income - spent;

  const leftEl = document.getElementById('left');
  leftEl.textContent = fmt(left);
  leftEl.classList.toggle('over', left < 0);

  const msg = document.getElementById('message');
  if (income === 0 && spent === 0) msg.textContent = 'Enter your income and expenses to see the result.';
  else if (left < 0) msg.textContent = 'You are over budget by ' + fmt(-left) + '.';
  else msg.textContent = 'You spend ' + fmt(spent) + ' of ' + fmt(income) + '.';

  const list = document.getElementById('breakdown');
  list.replaceChildren();
  for (const [label, value] of rows) {
    if (value === 0) continue;
    const li = document.createElement('li');
    const share = income > 0 ? ' (' + Math.round((value / income) * 100) + '% of income)' : '';
    li.textContent = label + ': ' + fmt(value) + share;
    list.append(li);
  }
}

document.querySelectorAll('input').forEach((el) => el.addEventListener('input', update));
document.getElementById('clear').addEventListener('click', () => {
  document.querySelectorAll('input').forEach((el) => { el.value = ''; });
  update();
});
update();
