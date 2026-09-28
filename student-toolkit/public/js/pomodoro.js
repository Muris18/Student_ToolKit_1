// Pomodoro timer. Uses an end timestamp so it stays accurate if the tab is in the background.
const timeEl = document.getElementById('time');
const modeEl = document.getElementById('mode');
const workEl = document.getElementById('work');
const brkEl = document.getElementById('brk');
const errorEl = document.getElementById('error');
const baseTitle = document.title;

let mode = 'work';
let remaining = 25 * 60; // seconds
let endAt = null;
let timerId = null;

function minutes(el, fallback) {
  const v = Math.floor(Number(el.value));
  return Number.isFinite(v) && v >= 1 ? Math.min(v, Number(el.max)) : fallback;
}
function fullLength() {
  return (mode === 'work' ? minutes(workEl, 25) : minutes(brkEl, 5)) * 60;
}
function fmt(s) {
  const m = Math.floor(s / 60);
  return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
function render() {
  timeEl.textContent = fmt(remaining);
  modeEl.textContent = mode === 'work' ? 'Focus' : 'Break';
  document.title = timerId ? fmt(remaining) + ' – ' + baseTitle : baseTitle;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}
function stop() {
  clearInterval(timerId);
  timerId = null;
}
function tick() {
  remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
  if (remaining === 0) {
    stop();
    beep();
    mode = mode === 'work' ? 'break' : 'work';
    remaining = fullLength();
  }
  render();
}
function start() {
  if (timerId) return;
  errorEl.textContent = '';
  endAt = Date.now() + remaining * 1000;
  timerId = setInterval(tick, 250);
  render();
}
function pause() {
  if (!timerId) return;
  tick();
  stop();
  render();
}
function reset() {
  stop();
  mode = 'work';
  remaining = fullLength();
  render();
}
[workEl, brkEl].forEach((el) => el.addEventListener('change', () => {
  if (!timerId) { remaining = fullLength(); render(); }
}));
document.getElementById('start').addEventListener('click', start);
document.getElementById('pause').addEventListener('click', pause);
document.getElementById('reset').addEventListener('click', reset);
render();
