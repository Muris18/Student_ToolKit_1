import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { emailEnabled } from '../../../server/email';
import { limitFor, reserveUsage, finishUsage, releaseUsage } from '../../../server/ai';
import { studyMaterials } from '../../../server/study';

// POST { subject, topic, notes?, kind: 'all'|'quiz', previous?: [jautājumu teksti] }
// -> { summary?, cards?, quiz: { questions }, sources, remaining }
// Pārbaudes darbam: konspekts, kartītes un tests pēc tēmas, skolēna piezīmēm un Vikipēdijas. Skaitās AI dienas limitā.
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `study:${user.id}`, 20, 3600, 'Pārāk daudz pieprasījumu stundas laikā. Pagaidi mazliet.')) return;

  if (!process.env.DEEPSEEK_API_KEY) return res.status(503).json({ error: 'AI vēl nav ieslēgts. Lūdz administratoram pievienot DeepSeek atslēgu.', code: 'NO_KEY' });
  if (emailEnabled() && !user.emailVerifiedAt) return res.status(403).json({ error: 'Lai lietotu AI, vispirms apstiprini savu e-pastu.', code: 'EMAIL_UNVERIFIED' });
  if (!user.aiConsentAt) return res.status(403).json({ error: 'Lai AI sagatavotu materiālus, jāpiekrīt datu nosūtīšanai uz DeepSeek.', code: 'NO_AI_CONSENT' });

  const subject = String(req.body?.subject || '').trim().slice(0, 80);
  const topic = String(req.body?.topic || '').trim().slice(0, 200);
  const notes = String(req.body?.notes || '').trim().slice(0, 6000);
  const kind = req.body?.kind === 'quiz' ? 'quiz' : 'all';
  const previous = (Array.isArray(req.body?.previous) ? req.body.previous : []).filter((q) => typeof q === 'string').slice(0, 20);
  if (topic.length < 3) return res.status(400).json({ error: 'Ieraksti pārbaudes darba tēmu' });

  const limit = limitFor(user.plan);
  const slot = await reserveUsage(user.id, limit);
  if (!slot) return res.status(429).json({ error: `Šodienas AI limits (${limit}) ir izmantots. Atgriezies rīt${user.plan === 'free' ? ' vai pāriet uz Premium' : ''}.` });

  const p = user.profile || {};
  const grade = p.grade ? `${p.grade}. ${p.level === 'kurss' ? 'kurss' : 'klase'}` : '';
  try {
    const r = await studyMaterials({ subject, grade, topic, notes, kind, previous });
    await finishUsage(slot.id, r.model, r.usage).catch((e) => console.error('ai_usage atjaunināšana:', e.message));
    res.status(200).json({
      ...(kind === 'all' ? { summary: r.summary, cards: r.cards } : {}),
      quiz: { questions: r.questions },
      sources: r.sources,
      remaining: Math.max(0, limit - slot.used),
    });
  } catch (err) {
    // DeepSeek atbildēja, bet materiāli nederīgi -> tokeni iztērēti, rezervācija paliek; citādi atceļ
    if (err.spent) await finishUsage(slot.id, err.spent.model, err.spent.usage).catch(() => {});
    else await releaseUsage(slot.id).catch(() => {});
    if (err.code === 'UPSTREAM') return res.status(502).json({ error: 'AI šobrīd neizdevās sagatavot materiālus. Pamēģini vēlreiz.' });
    console.error('study/generate kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
