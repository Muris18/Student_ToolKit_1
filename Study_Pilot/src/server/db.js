// PostgreSQL datubāze (aizstāj iepriekšējo atmiņas "DB").
// Savienojums caur DATABASE_URL (.env.local lokāli, docker-compose serverī).
import crypto from 'crypto';
import { Pool } from 'pg';

const g = globalThis;
if (!g.__SP_POOL__) {
  g.__SP_POOL__ = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000 });
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
  termsAcceptedAt: r.terms_accepted_at ? r.terms_accepted_at.toISOString() : null,
  aiConsentAt: r.ai_consent_at ? r.ai_consent_at.toISOString() : null,
});

export const publicUser = (u) => ({
  id: u.id, email: u.email, role: u.role, plan: u.plan, profile: u.profile, createdAt: u.createdAt, aiConsentAt: u.aiConsentAt,
});

export async function findByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [e]);
  return toUser(rows[0]);
}

export async function createUser({ email, password, profile }) {
  const salt = crypto.randomBytes(16).toString('hex');
  const { rows } = await pool.query(
    'INSERT INTO users (email, salt, pass_hash, profile, data, terms_accepted_at) VALUES ($1,$2,$3,$4,$5, now()) RETURNING *',
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
  // Pieslēgšanās skaitās kā aktivitāte (lai neaktīvo kontu tīrīšana neizdzēstu tikko pieslēgušos lietotāju)
  await pool.query('UPDATE users SET last_active = now() WHERE id = $1', [userId]);
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
// AI piekrišana (datu nosūtīšana uz DeepSeek). true -> saglabā laiku, false -> atsauc.
export async function setAiConsent(id, given) {
  const { rows } = await pool.query(
    'UPDATE users SET ai_consent_at = $2 WHERE id = $1 RETURNING ai_consent_at',
    [id, given ? new Date() : null]
  );
  return rows[0]?.ai_consent_at ? rows[0].ai_consent_at.toISOString() : null;
}

// Viss, kas par lietotāju glabājas datubāzē (datu eksportam, VDAR 15. un 20. pants)
export async function exportUser(user) {
  const usage = await pool.query(
    'SELECT created_at, model, prompt_tokens, completion_tokens FROM ai_usage WHERE user_id = $1 ORDER BY created_at',
    [user.id]
  );
  const sessions = await pool.query('SELECT created_at, expires_at FROM sessions WHERE user_id = $1 ORDER BY created_at', [user.id]);
  return {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      termsAcceptedAt: user.termsAcceptedAt,
      aiConsentAt: user.aiConsentAt,
    },
    profile: user.profile,
    data: user.data,
    aiUsage: usage.rows,
    sessions: sessions.rows,
  };
}

// Glabāšanas termiņi (skat. PRIVACY / content/privacy.md 6. sadaļu)
export const INACTIVE_MONTHS = 24;

// Dzēš beigušās sesijas un kontus, kas nav lietoti INACTIVE_MONTHS mēnešus (administratorus nedzēš).
export async function cleanup() {
  const s = await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  const u = await pool.query(
    "DELETE FROM users WHERE role <> 'admin' AND last_active < now() - make_interval(months => $1)",
    [INACTIVE_MONTHS]
  );
  return { sessions: s.rowCount, users: u.rowCount };
}

// Palaiž cleanup() ne biežāk kā reizi 6 stundās; kļūda netraucē pieprasījumam.
export function maybeCleanup() {
  const now = Date.now();
  if (g.__SP_CLEANUP_AT__ && now - g.__SP_CLEANUP_AT__ < 6 * 3600 * 1000) return;
  g.__SP_CLEANUP_AT__ = now;
  cleanup()
    .then((r) => { if (r.sessions || r.users) console.log('Tīrīšana: sesijas', r.sessions, 'konti', r.users); })
    .catch((e) => console.error('Tīrīšanas kļūda:', e.message));
}

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
