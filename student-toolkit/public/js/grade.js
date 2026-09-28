// Grade calculator: percentage = earned / max * 100
const earnedEl = document.getElementById('earned');
const maxEl = document.getElementById('max');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');

// Default scale; change here if you want a different one
const SCALE = [
  [90, 'A'],
  [80, 'B'],
  [70, 'C'],
  [60, 'D'],
  [0, 'F'],
];

function letterFor(percent) {
  for (const [min, letter] of SCALE) {
    if (percent >= min) return letter;
  }
  return 'F';
}

function showError(message) {
  errorEl.textContent = message;
  resultEl.hidden = true;
}

function calculate() {
  errorEl.textContent = '';
  if (earnedEl.value.trim() === '' || maxEl.value.trim() === '') {
    showError('Enter both the points you earned and the maximum points.');
    return;
  }
  const earned = Number(earnedEl.value);
  const max = Number(maxEl.value);
  if (!Number.isFinite(earned) || !Number.isFinite(max) || earned < 0 || max <= 0) {
    showError('Points must be 0 or more, and the maximum must be greater than 0.');
    return;
  }

  const percent = (earned / max) * 100;
  document.getElementById('percent').textContent = percent.toFixed(1) + '%';
  document.getElementById('letter').textContent = 'Letter grade: ' + letterFor(percent);
  resultEl.hidden = false;
}

function clearAll() {
  earnedEl.value = '';
  maxEl.value = '';
  errorEl.textContent = '';
  resultEl.hidden = true;
  earnedEl.focus();
}

document.getElementById('calc').addEventListener('click', calculate);
document.getElementById('clear').addEventListener('click', clearAll);
[earnedEl, maxEl].forEach((el) =>
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') calculate(); })
);
