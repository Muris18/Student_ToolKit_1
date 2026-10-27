// PostgreSQL datubāze (aizstāj iepriekšējo atmiņas "DB").
// Savienojums caur DATABASE_URL (.env.local lokāli, docker-compose serverī).
import crypto from 'crypto';
import { Pool } from 'pg';

const g = globalThis;
if (!g.__SP_POOL__) {
  g.__SP_POOL__ = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  g.__SP_POOL__.on('error', (e) => console.error('PostgreSQL pool kļūda:', e.message));
}
const pool = g.__SP_POOL__;

export const query = (text, params) => pool.query(text, params);

export const db = { bootId: 'persistent', startedAt: new Date().toISOString() };

export const emptyData = () => ({
  subjects: [], // { id, name, color }
  tasks: [], // plānotājs
  exercises: [], // eksāmenu uzdevumi
  quizzes: [],
  quizResults: [],
  chat: [],
  activity: [], // 'YYYY-MM-DD'
});

const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');

const toUser = (r) => r && ({
  id: r.id,
  email: r.email,
  salt: r.salt,
  passHash: r.pass_hash,
  role: r.role,
  plan: r.plan,
  profile: r.profile,
  data: r.data,
  createdAt: r.created_at.toISOString(),
  lastActive: r.last_active.toISOString(),
});

export const publicUser = (u) => ({ id: u.id, email: u.email, role: u.role, plan: u.plan, profile: u.profile, createdAt: u.createdAt });

export async function findByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [e]);
  return toUser(rows[0]);
}

export async function createUser({ email, password, profile }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const { rows } = await pool.query(
    'INSERT INTO users (email, salt, pass_hash, profile, data) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [String(email).trim().toLowerCase(), salt, hash(password, salt), profile, emptyData()]
  );
  return toUser(rows[0]);
}

export function checkPassword(user, password) {
  const a = Buffer.from(hash(String(password || ''), user.salt), 'hex');
  const b = Buffer.from(user.passHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Žetons pārlūkam; datubāzē glabājas tikai tā hash
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1,$2, now() + interval '30 days')",
    [sha(token), userId]
  );
  return token;
}

export async function userFromReq(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return { token: null, user: null };
  const { rows } = await pool.query(
    `UPDATE users SET last_active = now()
     WHERE id = (SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > now())
     RETURNING *`,
    [sha(token)]
  );
  return { token, user: toUser(rows[0]) };
}

export const deleteSession = (token) => pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha(token)]);
export const deleteUser = (id) => pool.query('DELETE FROM users WHERE id = $1', [id]);
export const updateProfile = (id, profile) => pool.query('UPDATE users SET profile = $2 WHERE id = $1', [id, profile]);
export const saveData = (id, data) => pool.query('UPDATE users SET data = $2 WHERE id = $1', [id, data]);
export const allUsers = async () => (await pool.query('SELECT * FROM users ORDER BY created_at')).rows.map(toUser);

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
