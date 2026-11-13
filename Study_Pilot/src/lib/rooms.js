// Mācību istabu kopīgā loģika (klientam un serverim). Tīras funkcijas bez datubāzes, tāpēc testējamas (tests/rooms.test.js).
// Izmanto: src/server/rooms.js, src/features/rooms/*, tests/rooms.test.js.

// Kods: 6 simboli bez 0/O/1/I (grūti sajaukt, ja diktē skaļi)
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;
export const TIMER_MINUTES = [15, 25, 45];
export const MAX_QUESTIONS = 30;

// rnd(n) -> vesels skaitlis [0, n). Serverī padod crypto.randomInt; pēc noklusējuma Math.random
export function makeCode(rnd = (n) => Math.floor(Math.random() * n)) {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[rnd(CODE_ALPHABET.length)];
  return s;
}

// Ielīmēts kods vai saites beigas -> derīgs kods vai null. Izmet visus simbolus, kas nav burti/cipari.
export function normalizeCode(v) {
  if (typeof v !== 'string') return null;
  const c = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (c.length !== CODE_LENGTH) return null;
  for (const ch of c) if (!CODE_ALPHABET.includes(ch)) return null;
  return c;
}

// Cita lietotāja vārds istabā: "Vārds U." (e-pasts un pilns uzvārds netiek rādīti)
export function displayName(profile) {
  const first = String(profile?.firstName || '').trim();
  const last = String(profile?.lastName || '').trim();
  if (!first) return 'Dalībnieks';
  const name = first.slice(0, 30);
  return last ? `${name} ${[...last][0].toUpperCase()}.` : name;
}

const cut = (v, n) => String(v ?? '').trim().slice(0, n);

// Uzdevumu kopa -> droša, normalizēta kopa. taskId (VIAA uzdevums) paliek tikai serverim uzticamām kopām (allowTaskId).
export function cleanQuestions(list, { allowTaskId = false } = {}) {
  const out = [];
  for (const q of Array.isArray(list) ? list : []) {
    if (out.length >= MAX_QUESTIONS) break;
    const question = cut(q?.question, 1500);
    if (question.length < 3) continue;
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) continue;
    const options = q.options.map((o) => cut(o, 400));
    if (options.some((o) => !o)) continue;
    const ci = q.correctIndex;
    if (!Number.isInteger(ci) || ci < 0 || ci >= options.length) continue;
    const item = {
      id: `q${out.length + 1}`,
      question,
      options,
      correctIndex: ci,
      explanation: cut(q.explanation, 1200),
      context: cut(q.context, 8000),
      topic: cut(q.topic, 80),
      source: cut(q.source, 80),
    };
    if (allowTaskId && Number.isInteger(q.taskId) && q.taskId > 0) item.taskId = q.taskId;
    out.push(item);
  }
  return out;
}

// Taimeris: { total, left (s), endsAt (ms vai null) }. Servera laiks nowMs; klients tikai attēlo.
export function timerView(t, nowMs) {
  const total = t.total;
  if (t.endsAt == null) return { total, left: t.left, running: false, done: false };
  const left = Math.max(0, Math.ceil((t.endsAt - nowMs) / 1000));
  return { total, left, running: left > 0, done: left === 0 };
}

// op: start | pause | reset | set. Atgriež jauno taimeri vai null, ja darbība nav atļauta.
export function timerAfter(op, t, nowMs, minutes) {
  const v = timerView(t, nowMs);
  if (op === 'start') {
    if (v.running) return { ...t };
    const left = v.done || t.left <= 0 ? t.total : t.left; // pēc beigām sāk no jauna
    return { total: t.total, left, endsAt: nowMs + left * 1000 };
  }
  if (op === 'pause') {
    if (!v.running) return { ...t };
    return { total: t.total, left: v.left, endsAt: null };
  }
  if (op === 'reset') return { total: t.total, left: t.total, endsAt: null };
  if (op === 'set') {
    if (v.running || !TIMER_MINUTES.includes(minutes)) return null;
    return { total: minutes * 60, left: minutes * 60, endsAt: null };
  }
  return null;
}

// Atbildes -> statistika katram jautājumam (tikai skaitļi, bez vārdiem): { [qid]: { answered, correct, counts: [n katram variantam] } }
export function buildStats(questions, answers) {
  const stats = {};
  for (const q of questions) stats[q.id] = { answered: 0, correct: 0, counts: q.options.map(() => 0) };
  for (const a of answers) {
    const s = stats[a.questionId];
    if (!s || !Number.isInteger(a.choice) || a.choice < 0 || a.choice >= s.counts.length) continue;
    s.answered += 1;
    s.counts[a.choice] += 1;
    if (a.correct) s.correct += 1;
  }
  return stats;
}

// "1 dalībnieks", "3 dalībnieki"
export const dalibnieki = (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'dalībnieks' : 'dalībnieki'}`;

export function mmss(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
