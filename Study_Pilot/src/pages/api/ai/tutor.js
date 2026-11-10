import { allow, requireUser } from '../../../server/http';
import { emailEnabled } from '../../../server/email';
import { findTasks, taskLabel, buildMessages, askDeepSeek, limitFor, reserveUsage, finishUsage, releaseUsage, signReply, verifyReply } from '../../../server/ai';

// POST { message, history?: [{ sender, text, sig? }] }
// -> { reply, sig, sources: [string], remaining }
// sig — servera paraksts atbildei; klients to glabā un sūta atpakaļ vēsturē (AI ziņas bez derīga paraksta tiek atmestas).
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (emailEnabled() && !user.emailVerifiedAt) {
    return res.status(403).json({ error: 'Lai lietotu AI skolotāju, vispirms apstiprini savu e-pastu.', code: 'EMAIL_UNVERIFIED' });
  }
  if (!user.aiConsentAt) {
    return res.status(403).json({ error: 'Lai lietotu AI skolotāju, vispirms jāpiekrīt datu nosūtīšanai uz DeepSeek.', code: 'NO_AI_CONSENT' });
  }

  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Ievadi jautājumu' });
  if (message.length > 1500) return res.status(400).json({ error: 'Jautājums ir pārāk garš (līdz 1500 simboliem)' });
  // Lietotāja ziņas paliek; AI ziņas — tikai tās, ko tiešām atbildēja šis serveris (derīgs paraksts)
  const history = (Array.isArray(req.body?.history) ? req.body.history : [])
    .filter((m) => m && typeof m.text === 'string')
    .filter((m) => m.sender === 'user' || verifyReply(user.id, m.text, m.sig))
    .slice(-6);

  const limit = limitFor(user.plan);
  const slot = await reserveUsage(user.id, limit);
  if (!slot) {
    return res.status(429).json({
      error: `Šodienas AI jautājumu limits (${limit}) ir izmantots. Atgriezies rīt${user.plan === 'free' ? ' vai pāriet uz Premium' : ''}.`,
      remaining: 0,
    });
  }

  try {
    const grade = user.profile?.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : undefined;
    const earlier = history.filter((m) => m.sender === 'user').slice(-2).map((m) => m.text.slice(0, 400)).join(' ');
    const tasks = await findTasks(`${earlier} ${message}`.trim(), { grade });
    const { reply, usage, model } = await askDeepSeek(buildMessages({ message, history, tasks }));
    await finishUsage(slot.id, model, usage).catch((e) => console.error('ai_usage atjaunināšana:', e.message));
    res.status(200).json({ reply, sig: signReply(user.id, reply), sources: tasks.map(taskLabel), remaining: Math.max(0, limit - slot.used) });
  } catch (err) {
    await releaseUsage(slot.id).catch(() => {}); // neizdevās -> jautājums netiek norakstīts no limita
    if (err.code === 'NO_KEY') return res.status(503).json({ error: 'AI skolotājs vēl nav ieslēgts. Lūdz administratoram pievienot DeepSeek atslēgu.' });
    if (err.code === 'UPSTREAM') return res.status(502).json({ error: 'AI šobrīd nav pieejams. Pamēģini pēc brīža.' });
    console.error('tutor kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
