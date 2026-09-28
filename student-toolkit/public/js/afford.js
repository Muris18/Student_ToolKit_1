// Affordability check
const get = (id) => document.getElementById(id);
const errorEl = get('error');
const resultEl = get('result');
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

function fail(msg) {
  errorEl.textContent = msg;
  resultEl.hidden = true;
}
function check() {
  errorEl.textContent = '';
  if (['price', 'income', 'expenses'].some((id) => get(id).value.trim() === '')) {
    return fail('Fill in the price, income and expenses.');
  }
  const price = Number(get('price').value);
  const income = Number(get('income').value);
  const expenses = Number(get('expenses').value);
  const savings = get('savings').value.trim() === '' ? 0 : Number(get('savings').value);
  if (![price, income, expenses, savings].every(Number.isFinite) || price <= 0 || income < 0 || expenses < 0 || savings < 0) {
    return fail('Price must be greater than 0 and other numbers cannot be negative.');
  }
  const free = income - expenses;
  let verdict;
  let message;
  if (free > 0 && price <= 0.25 * free) {
    verdict = 'Yes';
    message = 'This is a small part of your free money this month.';
  } else if (free > 0 && price <= free) {
    verdict = 'Yes, but tight';
    message = 'It would use most of your free money this month.';
  } else if (savings >= price * 2) {
    verdict = 'From savings';
    message = 'You can pay from savings and still keep a buffer.';
  } else if (savings >= price) {
    verdict = 'Think twice';
    message = 'You could pay from savings, but it would use almost all of them.';
  } else if (free > 0) {
    const months = Math.ceil((price - savings) / free);
    verdict = 'Not yet';
    message = 'Saving all your free money, you could afford it in about ' + months + (months === 1 ? ' month.' : ' months.');
  } else {
    verdict = 'No';
    message = 'Your expenses are at or above your income, so there is no free money for this.';
  }
  get('verdict').textContent = verdict;
  get('message').textContent = message;
  const facts = get('facts');
  facts.replaceChildren();
  const lines = ['Free money per month: ' + fmt(free)];
  if (free > 0) lines.push('Price is ' + Math.round((price / free) * 100) + '% of one month of free money');
  if (savings > 0) lines.push('Price is ' + Math.round((price / savings) * 100) + '% of your savings');
  for (const text of lines) {
    const li = document.createElement('li');
    li.textContent = text;
    facts.append(li);
  }
  resultEl.hidden = false;
}
get('calc').addEventListener('click', check);
get('clear').addEventListener('click', () => {
  ['price', 'income', 'expenses', 'savings'].forEach((id) => { get(id).value = ''; });
  errorEl.textContent = '';
  resultEl.hidden = true;
});
