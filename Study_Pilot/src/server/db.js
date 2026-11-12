// PostgreSQL datubāze (aizstāj iepriekšējo atmiņas "DB").
// Savienojums caur DATABASE_URL (.env.local lokāli, docker-compose serverī).
import crypto from 'crypto';
import { Pool } from 'pg';
import { newSalt, hashPassword, checkPassword, passwordProblem } from '../lib/password';

// Paroles funkcijas dzīvo lib/password.js (testējamas bez datubāzes); šeit atkārtoti eksportētas esošajiem izsaucējiem
export { checkPassword, passwordProblem };

const g = globalThis;
if (!g.__SP_POOL__) {
  g.__SP_POOL__ = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000 });
  g.__SP_POOL__.on('error', (e) => console.error('PostgreSQL pool kļūda:', e.message));
}
const pool = g.__SP_POOL__;

export const query = (text, params) => pool.query(text, params);
export const getPool = () => pool;

export const db = { bootId: 'persistent', startedAt: new Date().toISOString() };

export const emptyData = () => ({
  subjects: [], // { id, name, color }
  tasks: [], // plānotājs
  exercises: [], // eksāmenu uzdevumi
  quizzes: [],
  quizResults: [],
  chat: [],
  activity: [], // 'YYYY-MM-DD'
  examAttempts: [], // { taskId, correct, at }
  aiQuizzes: [], // testa režīma testi pēc kļūdām (pēdējie 20)
  simulations: [], // eksāmena simulāciju rezultāti: { id, docId, title, at, minutes, usedSec, score, max, percent } (pēdējie 50)
});

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
  dataVersion: r.data_version ?? 0,
  createdAt: r.created_at.toISOString(),
  lastActive: r.last_active.toISOString(),
  termsAcceptedAt: r.terms_accepted_at ? r.terms_accepted_at.toISOString() : null,
  aiConsentAt: r.ai_consent_at ? r.ai_consent_at.toISOString() : null,
  blockedAt: r.blocked_at ? r.blocked_at.toISOString() : null,
  emailVerifiedAt: r.email_verified_at ? r.email_verified_at.toISOString() : null,
  planSource: r.plan_source || null,
  stripeCustomerId: r.stripe_customer_id || null,
  stripeSubscriptionId: r.stripe_subscription_id || null,
  stripeStatus: r.stripe_status || null,
  premiumUntil: r.premium_until ? r.premium_until.toISOString() : null,
});

export const publicUser = (u) => ({
  id: u.id, email: u.email, role: u.role, plan: u.plan, profile: u.profile, createdAt: u.createdAt, aiConsentAt: u.aiConsentAt,
  emailVerified: Boolean(u.emailVerifiedAt), planSource: u.planSource, stripeStatus: u.stripeStatus, premiumUntil: u.premiumUntil,
  hasBilling: Boolean(u.stripeCustomerId),
});

export async function findByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [e]);
  return toUser(rows[0]);
}

// verified=false: e-pasts vēl jāapstiprina (tikai, ja e-pasta sūtīšana ir ieslēgta)
export async function createUser({ email, password, profile, verified = true }) {
  const salt = newSalt();
  const { rows } = await pool.query(
    `INSERT INTO users (email, salt, pass_hash, profile, data, terms_accepted_at, email_verified_at)
     VALUES ($1,$2,$3,$4,$5, now(), CASE WHEN $6 THEN now() END) RETURNING *`,
    [String(email).trim().toLowerCase(), salt, await hashPassword(password, salt), profile, emptyData(), verified]
  );
  return toUser(rows[0]);
}

export const findById = async (id) => toUser((await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0]);

// Jauna parole: jauns sāls, visas sesijas tiek izbeigtas (arī citās ierīcēs)
export async function setPassword(userId, password) {
  const salt = newSalt();
  await pool.query('UPDATE users SET salt = $2, pass_hash = $3, password_changed_at = now() WHERE id = $1', [userId, salt, await hashPassword(password, salt)]);
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
}

// Vienreizējs žetons e-pastam (apstiprināšana vai paroles atjaunošana). Datubāzē tikai hash.
export async function createEmailToken(userId, kind, hours) {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query("UPDATE email_tokens SET used_at = now() WHERE user_id = $1 AND kind = $2 AND used_at IS NULL", [userId, kind]);
  await pool.query(
    'INSERT INTO email_tokens (token_hash, user_id, kind, expires_at) VALUES ($1,$2,$3, now() + make_interval(hours => $4))',
    [sha(token), userId, kind, hours]
  );
  return token;
}

// Atgriež user_id un atzīmē žetonu kā izlietotu; nederīgs / beidzies / izlietots -> null
export async function consumeEmailToken(token, kind) {
  if (!/^[a-f0-9]{64}$/.test(String(token || ''))) return null;
  const { rows } = await pool.query(
    `UPDATE email_tokens SET used_at = now()
     WHERE token_hash = $1 AND kind = $2 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [sha(token), kind]
  );
  return rows[0]?.user_id || null;
}

// Nolasa žetonu, to NEIZTĒRĒJOT: atgriež user_id, ja žetons ir derīgs (nav izlietots, nav beidzies), citādi null.
// Paroles atjaunošanai: vispirms nolasa, pārbauda jauno paroli, un tikai tad žetonu iztērē (resetPasswordWithToken).
export async function peekEmailToken(token, kind) {
  if (!/^[a-f0-9]{64}$/.test(String(token || ''))) return null;
  const { rows } = await pool.query(
    'SELECT user_id FROM email_tokens WHERE token_hash = $1 AND kind = $2 AND used_at IS NULL AND expires_at > now()',
    [sha(token), kind]
  );
  return rows[0]?.user_id || null;
}

// Paroles atjaunošana ar žetonu vienā transakcijā: žetons tiek iztērēts un parole nomainīta atomāri.
// Ja divi pieprasījumi ar to pašu žetonu nāk vienlaikus, izdodas tikai viens (otrs atgriež null).
// Ja kaut kas neizdodas pēc žetona iztērēšanas, viss tiek atcelts un žetons paliek derīgs.
export async function resetPasswordWithToken(token, password) {
  if (!/^[a-f0-9]{64}$/.test(String(token || ''))) return null;
  // Dārgo hash aprēķina pirms transakcijas, lai rindas slēdzene netiktu turēta ilgi
  const salt = newSalt();
  const passHash = await hashPassword(password, salt);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const t = await client.query(
      `UPDATE email_tokens SET used_at = now()
       WHERE token_hash = $1 AND kind = 'reset' AND used_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [sha(token)]
    );
    const userId = t.rows[0]?.user_id;
    if (!userId) { await client.query('ROLLBACK'); return null; }
    await client.query('UPDATE users SET salt = $2, pass_hash = $3, password_changed_at = now() WHERE id = $1', [userId, salt, passHash]);
    await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    // Saite atnāca uz šo e-pastu, tātad e-pasts ir apstiprināts
    await client.query('UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1', [userId]);
    await client.query('COMMIT');
    return userId;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export const markEmailVerified = (userId) => pool.query('UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1', [userId]);

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
       AND blocked_at IS NULL
     RETURNING *`,
    [sha(token)]
  );
  return { token, user: toUser(rows[0]) };
}

export const deleteSession = (token) => pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha(token)]);
export const deleteUser = (id) => pool.query('DELETE FROM users WHERE id = $1', [id]);
export const updateProfile = (id, profile) => pool.query('UPDATE users SET profile = $2 WHERE id = $1', [id, profile]);
// Saglabā datus tikai tad, ja versija sakrīt (atomāri, vienā UPDATE): atgriež jauno versiju vai null, ja versija ir novecojusi
export async function saveData(id, data, version) {
  const { rows } = await pool.query(
    'UPDATE users SET data = $2, data_version = data_version + 1 WHERE id = $1 AND data_version = $3 RETURNING data_version',
    [id, data, version]
  );
  return rows[0] ? rows[0].data_version : null;
}
// Eksāmenu mēģinājumi glabājas tabulā exam_attempts (viens ieraksts uz uzdevumu). Klients tos joprojām redz kā data.examAttempts.
const MAX_ATTEMPTS = 2000;
export async function getAttempts(userId) {
  const { rows } = await pool.query('SELECT task_id, correct, at FROM exam_attempts WHERE user_id = $1 ORDER BY at', [userId]);
  return rows.map((r) => ({ taskId: r.task_id, correct: r.correct, at: r.at.toISOString() }));
}
// Datu objekts ar mēģinājumiem no tabulas (aizstāj vecos no users.data)
export async function dataWithAttempts(user) {
  return { ...user.data, examAttempts: await getAttempts(user.id) };
}
// Apvieno klienta mēģinājumus ar tabulu: uzvar jaunākais `at`, nekas netiek dzēsts (novecojis klients nevar izdzēst citu ierīču mēģinājumus)
export async function syncAttempts(userId, list) {
  const valid = new Map();
  for (const a of Array.isArray(list) ? list : []) {
    const id = Number(a?.taskId);
    const at = new Date(a?.at);
    if (!Number.isInteger(id) || id < 0 || id > 2147483647 || typeof a.correct !== 'boolean' || Number.isNaN(at.getTime())) continue;
    const prev = valid.get(id);
    if (!prev || at > prev.at) valid.set(id, { id, correct: a.correct, at });
  }
  if (!valid.size) return;
  const have = new Map((await pool.query('SELECT task_id, correct, at FROM exam_attempts WHERE user_id = $1', [userId])).rows.map((r) => [r.task_id, r]));
  const changed = [...valid.values()].filter((v) => { const h = have.get(v.id); return !h || v.at > h.at || (+v.at === +h.at && v.correct !== h.correct); });
  if (!changed.length) return;
  await pool.query(
    `INSERT INTO exam_attempts (user_id, task_id, correct, at)
     SELECT $1, t, c, a FROM unnest($2::int[], $3::boolean[], $4::timestamptz[]) AS x(t, c, a)
     ON CONFLICT (user_id, task_id) DO UPDATE SET correct = EXCLUDED.correct, at = EXCLUDED.at WHERE EXCLUDED.at >= exam_attempts.at`,
    [userId, changed.map((v) => v.id), changed.map((v) => v.correct), changed.map((v) => v.at)]
  );
  // Atstāj jaunākos MAX_ATTEMPTS
  await pool.query(
    `DELETE FROM exam_attempts WHERE user_id = $1 AND task_id NOT IN (SELECT task_id FROM exam_attempts WHERE user_id = $1 ORDER BY at DESC LIMIT $2)`,
    [userId, MAX_ATTEMPTS]
  );
}
export async function currentDataVersion(id) {
  const { rows } = await pool.query('SELECT data_version FROM users WHERE id = $1', [id]);
  return rows[0]?.data_version ?? 0;
}
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
      emailVerifiedAt: user.emailVerifiedAt,
      planSource: user.planSource,
      stripeStatus: user.stripeStatus,
      premiumUntil: user.premiumUntil,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      termsAcceptedAt: user.termsAcceptedAt,
      aiConsentAt: user.aiConsentAt,
    },
    profile: user.profile,
    data: await dataWithAttempts(user),
    aiUsage: usage.rows,
    sessions: sessions.rows,
  };
}

// Glabāšanas termiņi (skat. PRIVACY / content/privacy.md 6. sadaļu)
export const INACTIVE_MONTHS = 24;

// Dzēš beigušās sesijas un kontus, kas nav lietoti INACTIVE_MONTHS mēnešus (administratorus nedzēš).
export async function cleanup() {
  const s = await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  await pool.query("DELETE FROM login_attempts WHERE created_at < now() - interval '1 day'");
  await pool.query("DELETE FROM email_tokens WHERE expires_at < now() - interval '1 day'");
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
