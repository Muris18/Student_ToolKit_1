// Password generator using the browser's secure random source
const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
};
const pwEl = document.getElementById('pw');
const errorEl = document.getElementById('error');
const lenEl = document.getElementById('len');

function randInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
  return x % max;
}
function pick(str) { return str[randInt(str.length)]; }

function generate() {
  errorEl.textContent = '';
  const active = Object.keys(SETS).filter((k) => document.getElementById(k).checked);
  if (!active.length) {
    errorEl.textContent = 'Select at least one type of character.';
    pwEl.textContent = '';
    return;
  }
  const length = Number(lenEl.value);
  const all = active.map((k) => SETS[k]).join('');
  const chars = active.map((k) => pick(SETS[k])); // at least one of each chosen type
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) { // Fisher-Yates shuffle
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  pwEl.textContent = chars.join('');
}
async function copy() {
  if (!pwEl.textContent) return;
  const btn = document.getElementById('copy');
  try {
    await navigator.clipboard.writeText(pwEl.textContent);
    btn.textContent = 'Copied';
  } catch (e) {
    btn.textContent = 'Select and copy manually';
  }
  setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
}
lenEl.addEventListener('input', () => {
  document.getElementById('lenval').textContent = lenEl.value;
  generate();
});
['lower', 'upper', 'digits', 'symbols'].forEach((id) => document.getElementById(id).addEventListener('change', generate));
document.getElementById('gen').addEventListener('click', generate);
document.getElementById('copy').addEventListener('click', copy);
generate();
