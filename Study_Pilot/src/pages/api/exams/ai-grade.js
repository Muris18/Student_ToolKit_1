import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { emailEnabled } from '../../../server/email';
import { limitFor, reserveUsage, finishUsage, releaseUsage, usageSnapshot, GLOBAL_LIMIT_MESSAGE } from '../../../server/ai';
import { loadGradable, gradeBatch } from '../../../server/aiGrade';
import { GRADE_BATCH } from '../../../lib/aiGrade';

export const config = { api: { bodyParser: { sizeLimit: '256kb' } } };

// POST { docId, answers: { [taskId]: "atbildes teksts" } } -> { results: { [taskId]: { points, max, feedback } }, skipped: [taskId], remaining }
// Simulācijas pašvērtējuma solis: AI piedāvā punktus atvērtajiem uzdevumiem ar pamatojumu; skolēns tos var mainīt.
// Viens izsaukums = līdz GRADE_BATCH uzdevumiem = 1 vieta AI dienas limitā. Uzdevumu teksts un kritēriji tiek ņemti no DB.
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `aigrade:${user.id}`, 12, 3600, 'Pārāk daudz vērtēšanas pieprasījumu stundas laikā. Pagaidi mazliet.')) return;

  if (!process.env.DEEPSEEK_API_KEY) return res.status(503).json({ error: 'AI vēl nav ieslēgts. Lūdz administratoram pievienot DeepSeek atslēgu.', code: 'NO_KEY' });
  if (emailEnabled() && !user.emailVerifiedAt) return res.status(403).json({ error: 'Lai lietotu AI, vispirms apstiprini savu e-pastu.', code: 'EMAIL_UNVERIFIED' });
  if (!user.aiConsentAt) return res.status(403).json({ error: 'Lai AI novērtētu tavas atbildes, jāpiekrīt datu nosūtīšanai uz DeepSeek.', code: 'NO_AI_CONSENT' });

  const docId = parseInt(req.body?.docId, 10);
  if (!Number.isInteger(docId)) return res.status(400).json({ error: 'Nav norādīts eksāmens' });
  const raw = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  const answers = {};
  for (const [k, v] of Object.entries(raw).slice(0, 200)) {
    const id = parseInt(k, 10);
    if (Number.isInteger(id) && typeof v === 'string') answers[id] = v.slice(0, 1500);
  }

  const { tasks, skipped } = await loadGradable(docId, answers);
  if (!tasks.length) return res.status(200).json({ results: {}, skipped, remaining: null });
  const batch = tasks.slice(0, GRADE_BATCH);
  const extra = tasks.slice(GRADE_BATCH).map((t) => t.id); // klients tos atsūta nākamajā porcijā

  const limit = limitFor(user.plan);
  const slot = await reserveUsage(user.id, limit);
  if (slot?.globalLimit) return res.status(503).json({ error: GLOBAL_LIMIT_MESSAGE, code: 'AI_GLOBAL_LIMIT' });
  if (!slot) return res.status(429).json({ error: `Šodienas AI limits ir izmantots. Tas atjaunojas plkst. 00:00${user.plan === 'free' ? ' vai pāriet uz Premium' : ''}. Atvērtos uzdevumus vari novērtēt arī pats.`, code: 'AI_LIMIT' });

  try {
    const r = await gradeBatch(batch);
    await finishUsage(slot.id, r.model, r.usage).catch((e) => console.error('ai_usage atjaunināšana:', e.message));
    res.status(200).json({ results: r.results, skipped: [...skipped, ...r.missing], later: extra, usage: await usageSnapshot(user) });
  } catch (err) {
    await releaseUsage(slot.id).catch(() => {}); // neizdevās -> vieta limitā netiek norakstīta
    if (err.code === 'UPSTREAM') return res.status(502).json({ error: 'AI šobrīd nevar novērtēt atbildes. Vari tās novērtēt pats vai pamēģināt vēlāk.', code: 'AI_DOWN' });
    console.error('ai-grade kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
