// Mācību istabu servera loģika. Izsauc: src/pages/api/rooms/**. Tīrā loģika (kodi, taimeris, kopu tīrīšana) dzīvo src/lib/rooms.js.
// Visas darbības pārbauda dalību; neesošu istabu un "neesi dalībnieks" abos gadījumos atbild 404 (neatklāj, vai istaba pastāv).
import crypto from 'crypto';
import { getPool, query } from './db';
import { examQuiz } from './quiz';
import { isPremium } from '../lib/plans';
import { makeCode, normalizeCode, displayName, cleanQuestions, timerView, timerAfter, buildStats } from '../lib/rooms';

export class RoomError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function sendRoomError(res, e) {
  if (e instanceof RoomError) return res.status(e.status).json({ error: e.message, ...(e.code ? { code: e.code } : {}) });
  console.error('rooms kļūda:', e);
  return res.status(500).json({ error: 'Servera kļūda' });
}

const envInt = (name, def) => { const n = parseInt(process.env[name], 10); return n > 0 ? n : def; };
export function roomConfig() {
  return { maxMembers: envInt('ROOM_MAX_MEMBERS', 6), maxHosted: envInt('ROOM_MAX_HOSTED', 3), premiumOnly: process.env.ROOMS_PREMIUM_ONLY === '1' };
}
// Betā visiem; ar ROOMS_PREMIUM_ONLY=1 tikai Premium un administratoriem
export const roomsAllowed = (user) => !roomConfig().premiumOnly || isPremium(user) || user?.role === 'admin';
export function requireRoomsAllowed(user) {
  if (!roomsAllowed(user)) throw new RoomError(403, 'Mācību istabas ir pieejamas Premium lietotājiem.', 'PREMIUM');
}

const notFound = () => new RoomError(404, 'Istaba nav atrasta');

// Istabas bez aktivitātes 24 h tiek dzēstas kopā ar atbildēm (ne biežāk kā reizi stundā)
const g = globalThis;
export async function maybeCleanupRooms() {
  if (g.__SP_ROOMS_CLEAN__ && Date.now() - g.__SP_ROOMS_CLEAN__ < 3600 * 1000) return;
  g.__SP_ROOMS_CLEAN__ = Date.now();
  try { await query("DELETE FROM rooms WHERE last_activity < now() - interval '24 hours'"); } catch (e) { console.error('Istabu tīrīšana:', e.message); }
}

async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const r = await fn(client);
    await client.query('COMMIT');
    return r;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

// Istaba pēc koda, ja lietotājs ir tās dalībnieks (lock = FOR UPDATE)
async function memberRoom(db, user, code, lock = false) {
  const c = normalizeCode(code);
  if (!c) throw notFound();
  const { rows } = await db.query(
    `SELECT r.* FROM rooms r JOIN room_members m ON m.room_id = r.id AND m.user_id = $2 WHERE r.code = $1${lock ? ' FOR UPDATE OF r' : ''}`,
    [c, user.id]
  );
  if (!rows[0]) throw notFound();
  return rows[0];
}

const touch = (db, roomId) => db.query('UPDATE rooms SET last_activity = now() WHERE id = $1', [roomId]);
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const timerOf = (r) => ({ total: r.timer_total, left: r.timer_left, endsAt: r.timer_ends_at ? new Date(r.timer_ends_at).getTime() : null });

async function saveTimer(db, roomId, t) {
  await db.query('UPDATE rooms SET timer_total = $2, timer_left = $3, timer_ends_at = $4 WHERE id = $1', [roomId, t.total, t.left, t.endsAt == null ? null : new Date(t.endsAt)]);
}

// ---------- Izveide, pievienošanās, iziešana ----------

export async function listMyRooms(user) {
  const { rows } = await query(
    `SELECT r.code, r.name, r.mode, r.topic, r.state, r.host_id = $1 AS is_host, r.last_activity,
            (SELECT count(*)::int FROM room_members x WHERE x.room_id = r.id) AS members
     FROM rooms r JOIN room_members m ON m.room_id = r.id AND m.user_id = $1
     ORDER BY r.last_activity DESC`,
    [user.id]
  );
  return rows.map((r) => ({ code: r.code, name: r.name, mode: r.mode, topic: r.topic, state: r.state, isHost: r.is_host, members: r.members, lastActivity: r.last_activity.toISOString() }));
}

export async function createRoom(user, body) {
  requireRoomsAllowed(user);
  const name = str(body?.name, 60);
  const mode = body?.mode === 'mixed' ? 'mixed' : 'single';
  const topic = mode === 'single' ? str(body?.topic, 80) : '';
  if (name.length < 2) throw new RoomError(400, 'Istabas nosaukumam jābūt vismaz 2 simbolus garam');
  if (mode === 'single' && topic.length < 2) throw new RoomError(400, 'Ieraksti istabas tēmu (vismaz 2 simboli) vai izvēlies "Dažādas tēmas"');
  const { maxHosted } = roomConfig();
  const hosted = (await query('SELECT count(*)::int AS n FROM rooms WHERE host_id = $1', [user.id])).rows[0].n;
  if (hosted >= maxHosted) throw new RoomError(400, `Vienlaikus vari vadīt ne vairāk kā ${maxHosted} istabas. Aizver kādu no esošajām.`);
  const member = displayName(user.profile);
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = makeCode((n) => crypto.randomInt(n));
    try {
      await tx(async (c) => {
        const r = await c.query('INSERT INTO rooms (code, host_id, name, mode, topic) VALUES ($1,$2,$3,$4,$5) RETURNING id', [code, user.id, name, mode, topic]);
        await c.query('INSERT INTO room_members (room_id, user_id, name, topic) VALUES ($1,$2,$3,$4)', [r.rows[0].id, user.id, member, topic]);
      });
      return code;
    } catch (e) {
      if (e.code === '23505') continue; // kods aizņemts, ģenerē jaunu
      throw e;
    }
  }
  throw new RoomError(500, 'Neizdevās izveidot istabu. Pamēģini vēlreiz.');
}

export async function joinRoom(user, rawCode) {
  requireRoomsAllowed(user);
  const code = normalizeCode(rawCode);
  if (!code) throw new RoomError(404, 'Istaba ar šādu kodu nav atrasta');
  const { maxMembers } = roomConfig();
  return tx(async (c) => {
    const { rows } = await c.query('SELECT id, banned, topic FROM rooms WHERE code = $1 FOR UPDATE', [code]);
    const room = rows[0];
    if (!room) throw new RoomError(404, 'Istaba ar šādu kodu nav atrasta');
    const mine = await c.query('SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2', [room.id, user.id]);
    if (mine.rows.length) return code;
    if ((room.banned || []).includes(user.id)) throw new RoomError(403, 'Tu nevari pievienoties šai istabai');
    const n = (await c.query('SELECT count(*)::int AS n FROM room_members WHERE room_id = $1', [room.id])).rows[0].n;
    if (n >= maxMembers) throw new RoomError(409, `Istaba ir pilna (līdz ${maxMembers} dalībniekiem)`, 'FULL');
    await c.query('INSERT INTO room_members (room_id, user_id, name, topic) VALUES ($1,$2,$3,$4)', [room.id, user.id, displayName(user.profile), room.topic]);
    await touch(c, room.id);
    return code;
  });
}

export async function leaveRoom(user, code) {
  return tx(async (c) => {
    const room = await memberRoom(c, user, code, true);
    await c.query('DELETE FROM room_answers WHERE room_id = $1 AND user_id = $2', [room.id, user.id]);
    await c.query('DELETE FROM room_help WHERE room_id = $1 AND user_id = $2', [room.id, user.id]);
    await c.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [room.id, user.id]);
    if (room.host_id === user.id) {
      // Istaba pāriet vecākajam dalībniekam; ja neviena nav, istaba tiek dzēsta
      const next = await c.query('SELECT user_id FROM room_members WHERE room_id = $1 ORDER BY joined_at, id LIMIT 1', [room.id]);
      if (next.rows[0]) await c.query('UPDATE rooms SET host_id = $2, last_activity = now() WHERE id = $1', [room.id, next.rows[0].user_id]);
      else { await c.query('DELETE FROM rooms WHERE id = $1', [room.id]); return { closed: true }; }
    }
    return { closed: false };
  });
}

// ---------- Stāvoklis ----------

export async function roomState(user, code) {
  const room = await memberRoom({ query }, user, code);
  await query('UPDATE room_members SET last_seen = now() WHERE room_id = $1 AND user_id = $2', [room.id, user.id]);
  const nowMs = Date.now();
  const total = Array.isArray(room.questions) ? room.questions.length : 0;
  const [mem, ans, help] = await Promise.all([
    query(
      `SELECT m.id, m.user_id, m.name, m.status, m.topic, m.joined_at, (m.last_seen > now() - interval '20 seconds') AS online
       FROM room_members m WHERE m.room_id = $1 ORDER BY m.joined_at, m.id`,
      [room.id]
    ),
    query('SELECT user_id, question_id, choice, correct FROM room_answers WHERE room_id = $1', [room.id]),
    query('SELECT user_id, question_id FROM room_help WHERE room_id = $1', [room.id]),
  ]);
  const review = room.state === 'review';
  const playing = room.state === 'running' || review;

  const byUser = new Map();
  for (const a of ans.rows) {
    const s = byUser.get(a.user_id) || { answered: 0, correct: 0 };
    s.answered += 1;
    if (a.correct) s.correct += 1;
    byUser.set(a.user_id, s);
  }
  const members = mem.rows.map((m) => {
    const s = byUser.get(m.user_id) || { answered: 0, correct: 0 };
    return {
      id: Number(m.id), name: m.name, status: m.status, topic: m.topic, online: m.online,
      isHost: m.user_id === room.host_id, isMe: m.user_id === user.id,
      answered: s.answered, ...(review ? { correct: s.correct } : {}),
    };
  });

  let questions = [];
  if (playing) {
    const mine = new Map(ans.rows.filter((a) => a.user_id === user.id).map((a) => [a.question_id, a]));
    const stats = buildStats(room.questions, ans.rows.map((a) => ({ questionId: a.question_id, choice: a.choice, correct: a.correct })));
    questions = room.questions.map((q) => {
      const my = mine.get(q.id);
      const open = review || Boolean(my); // pareizā atbilde, skaidrojums un statistika tikai pēc paša atbildes vai pārskatā
      const hq = help.rows.filter((h) => h.question_id === q.id);
      return {
        id: q.id, question: q.question, options: q.options, context: q.context || '', topic: q.topic || '', source: q.source || '',
        tracked: Boolean(q.taskId),
        mine: my ? { choice: my.choice, correct: my.correct } : null,
        help: { count: hq.length, mine: hq.some((h) => h.user_id === user.id) },
        ...(open ? { result: { correctIndex: q.correctIndex, explanation: q.explanation || '' }, stats: stats[q.id] } : {}),
      };
    });
  }

  const t = timerView(timerOf(room), nowMs);
  return {
    now: nowMs,
    me: { isHost: room.host_id === user.id },
    config: roomConfig(),
    room: {
      code: room.code, name: room.name, mode: room.mode, topic: room.topic, state: room.state, round: room.round,
      set: { title: room.set_title, subject: room.set_subject, grade: room.set_grade, total },
      timer: { ...t, endsAt: room.timer_ends_at ? new Date(room.timer_ends_at).getTime() : null },
    },
    members,
    questions,
  };
}

// ---------- Dalībnieka darbības ----------

export async function submitAnswer(user, code, { questionId, choice }) {
  const room = await memberRoom({ query }, user, code);
  if (room.state !== 'running') throw new RoomError(409, 'Kārta nav sākta vai jau beigusies');
  const q = (room.questions || []).find((x) => x.id === questionId);
  if (!q) throw new RoomError(400, 'Nezināms uzdevums');
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) throw new RoomError(400, 'Nederīga atbilde');
  const correct = choice === q.correctIndex;
  // Pirmā atbilde paliek spēkā
  const ins = await query(
    'INSERT INTO room_answers (room_id, user_id, question_id, choice, correct) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING 1',
    [room.id, user.id, q.id, choice, correct]
  );
  if (ins.rows.length) {
    // Īsts VIAA uzdevums: mēģinājums nonāk Testa režīma kļūdu sarakstā (to ieraksta serveris, lai klients nevar viltot)
    if (q.taskId) {
      await query(
        `INSERT INTO exam_attempts (user_id, task_id, correct, at) VALUES ($1,$2,$3,now())
         ON CONFLICT (user_id, task_id) DO UPDATE SET correct = EXCLUDED.correct, at = EXCLUDED.at`,
        [user.id, q.taskId, correct]
      );
    }
    await touch({ query }, room.id);
  }
  return { ok: true };
}

export async function setHelp(user, code, questionId, on) {
  const room = await memberRoom({ query }, user, code);
  if (room.state !== 'running') throw new RoomError(409, 'Kārta nav sākta');
  if (!(room.questions || []).some((x) => x.id === questionId)) throw new RoomError(400, 'Nezināms uzdevums');
  if (on) await query('INSERT INTO room_help (room_id, user_id, question_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [room.id, user.id, questionId]);
  else await query('DELETE FROM room_help WHERE room_id = $1 AND user_id = $2 AND question_id = $3', [room.id, user.id, questionId]);
  return { ok: true };
}

export async function setMe(user, code, body) {
  const room = await memberRoom({ query }, user, code);
  const status = body?.status === 'break' ? 'break' : body?.status === 'studying' ? 'studying' : null;
  const topic = body?.topic === undefined ? null : str(body.topic, 60);
  if (!status && topic === null) throw new RoomError(400, 'Nav ko mainīt');
  await query(
    'UPDATE room_members SET status = COALESCE($3, status), topic = COALESCE($4, topic) WHERE room_id = $1 AND user_id = $2',
    [room.id, user.id, status, topic]
  );
  return { ok: true };
}

// ---------- Īpašnieka darbības ----------

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export async function hostAction(user, code, body) {
  const type = body?.type;
  return tx(async (c) => {
    const room = await memberRoom(c, user, code, true);
    if (room.host_id !== user.id) throw new RoomError(403, 'Tikai istabas īpašnieks drīkst to darīt');
    const nowMs = Date.now();
    switch (type) {
      case 'timer': {
        const next = timerAfter(String(body.op), timerOf(room), nowMs, body.minutes);
        if (!next) throw new RoomError(400, 'Šo taimera darbību tagad nevar veikt');
        await saveTimer(c, room.id, next);
        break;
      }
      case 'set-exam': {
        if (room.state !== 'lobby') throw new RoomError(409, 'Uzdevumu kopu var mainīt tikai pirms kārtas');
        const subject = str(body.subject, 80).toLowerCase();
        const grade = [9, 12].includes(Number(body.grade)) ? Number(body.grade) : null;
        const count = [5, 10, 15, 20].includes(Number(body.count)) ? Number(body.count) : 10;
        if (!subject || !grade) throw new RoomError(400, 'Izvēlies klasi un priekšmetu');
        const questions = cleanQuestions(await examQuiz({ subject, grade, count }), { allowTaskId: true });
        if (questions.length < 3) throw new RoomError(400, 'Šim priekšmetam nepietiek testa uzdevumu');
        await c.query('UPDATE rooms SET questions = $2::jsonb, set_title = $3, set_subject = $4, set_grade = $5 WHERE id = $1', [room.id, JSON.stringify(questions), `VIAA: ${cap(subject)}, ${grade}. klase`, subject, grade]);
        break;
      }
      case 'set-own': {
        if (room.state !== 'lobby') throw new RoomError(409, 'Uzdevumu kopu var mainīt tikai pirms kārtas');
        // Bez taskId: neviens nevar uzspiest citiem viltotus eksāmenu mēģinājumus
        const questions = cleanQuestions(body.questions);
        if (questions.length < 1) throw new RoomError(400, 'Testā nav derīgu jautājumu');
        const grade = Number.isInteger(body.grade) && body.grade >= 1 && body.grade <= 12 ? body.grade : null;
        await c.query('UPDATE rooms SET questions = $2::jsonb, set_title = $3, set_subject = $4, set_grade = $5 WHERE id = $1', [room.id, JSON.stringify(questions), str(body.title, 80) || 'Mans tests', str(body.subject, 80), grade]);
        break;
      }
      case 'start': {
        if (room.state !== 'lobby') throw new RoomError(409, 'Kārta jau ir sākta');
        if (!room.questions?.length) throw new RoomError(400, 'Vispirms izvēlies uzdevumu kopu');
        await c.query("UPDATE rooms SET state = 'running' WHERE id = $1", [room.id]);
        if (body.startTimer) await saveTimer(c, room.id, timerAfter('start', timerOf(room), nowMs));
        break;
      }
      case 'finish': {
        if (room.state !== 'running') throw new RoomError(409, 'Kārta nav sākta');
        await c.query("UPDATE rooms SET state = 'review' WHERE id = $1", [room.id]);
        await saveTimer(c, room.id, timerAfter('pause', timerOf(room), nowMs));
        break;
      }
      case 'new-round': {
        if (room.state === 'lobby') throw new RoomError(409, 'Jauna kārta jau ir sagatavota');
        await c.query('DELETE FROM room_answers WHERE room_id = $1', [room.id]);
        await c.query('DELETE FROM room_help WHERE room_id = $1', [room.id]);
        await c.query("UPDATE rooms SET round = round + 1, state = 'lobby' WHERE id = $1", [room.id]);
        await saveTimer(c, room.id, timerAfter('reset', timerOf(room), nowMs));
        break;
      }
      case 'kick': {
        const mid = Number(body.memberId);
        if (!Number.isInteger(mid)) throw new RoomError(400, 'Nederīgs dalībnieks');
        const m = await c.query('SELECT user_id FROM room_members WHERE id = $1 AND room_id = $2', [mid, room.id]);
        if (!m.rows[0]) throw new RoomError(404, 'Dalībnieks nav atrasts');
        if (m.rows[0].user_id === user.id) throw new RoomError(400, 'Sevi izmest nevar. Izej no istabas.');
        const uid = m.rows[0].user_id;
        await c.query('DELETE FROM room_answers WHERE room_id = $1 AND user_id = $2', [room.id, uid]);
        await c.query('DELETE FROM room_help WHERE room_id = $1 AND user_id = $2', [room.id, uid]);
        await c.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [room.id, uid]);
        await c.query('UPDATE rooms SET banned = array_append(banned, $2::uuid) WHERE id = $1', [room.id, uid]);
        break;
      }
      case 'close': {
        await c.query('DELETE FROM rooms WHERE id = $1', [room.id]);
        return { ok: true, closed: true };
      }
      default:
        throw new RoomError(400, 'Nezināma darbība');
    }
    await touch(c, room.id);
    return { ok: true };
  });
}
