// Vienkārša "datubāze" servera atmiņā.
// Dati dzīvo tikai, kamēr darbojas `npm run dev` / `npm start` process —
// pēc restarta viss ir pilnīgi tīrs un jāreģistrējas no jauna.
// Vēlāk (Phase 2) šo failu var aizstāt ar Supabase, API maršrutiem nemainoties.
import crypto from 'crypto';

const g = globalThis;
if (!g.__STUDY_PILOT_DB__) {
  g.__STUDY_PILOT_DB__ = {
    bootId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    users: new Map(), // id -> user
    sessions: new Map(), // token -> userId
  };
}
export const db = g.__STUDY_PILOT_DB__;

export const emptyData = () => ({
  subjects: [], // { id, name, color }
  tasks: [], // plānotājs: { id, title, subjectId, dueDate, type, priority, status, createdAt, doneAt }
  exercises: [], // eksāmenu uzdevumi: { id, subjectId, source, title, points, difficulty, notes, completed, createdAt, doneAt }
  quizzes: [], // { id, subjectId, title, questions: [{ id, question, options, correctIndex, explanation }] }
  quizResults: [], // { id, quizId, subjectId, score, total, wrong: [questionId], date }
  chat: [], // { id, sender: 'user', text, date }
  activity: [], // 'YYYY-MM-DD' dienas, kurās kaut kas darīts
});

const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

export function publicUser(u) {
  return { id: u.id, email: u.email, profile: u.profile, createdAt: u.createdAt };
}

export function findByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  for (const u of db.users.values()) if (u.email === e) return u;
  return null;
}

export function createUser({ email, password, profile }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID(),
    email: String(email).trim().toLowerCase(),
    salt,
    passHash: hash(password, salt),
    profile,
    data: emptyData(),
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  db.users.set(user.id, user);
  return user;
}

export function checkPassword(user, password) {
  const a = Buffer.from(hash(String(password || ''), user.salt), 'hex');
  const b = Buffer.from(user.passHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.set(token, userId);
  return token;
}

export function userFromReq(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return { token: null, user: null };
  const id = db.sessions.get(token);
  const user = id ? db.users.get(id) : null;
  if (user) user.lastActive = new Date().toISOString();
  return { token, user };
}

export function deleteUser(id) {
  db.users.delete(id);
  for (const [t, uid] of db.sessions) if (uid === id) db.sessions.delete(t);
}

// --- Validācija ---
const str = (v, max = 120) => String(v ?? '').trim().slice(0, max);

export function cleanProfile(p = {}) {
  const level = p.level === 'kurss' ? 'kurss' : 'klase';
  const n = parseInt(p.grade, 10);
  const grade = level === 'klase' ? Math.min(12, Math.max(1, n || 12)) : Math.min(6, Math.max(1, n || 1));
  return {
    firstName: str(p.firstName, 60),
    lastName: str(p.lastName, 60),
    level,
    grade,
    school: str(p.school, 120),
    program: str(p.program, 120),
  };
}

export function validateProfile(p) {
  if (!p.firstName) return 'Ievadi vārdu';
  return null;
}
