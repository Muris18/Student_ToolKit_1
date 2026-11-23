import { allow, requireUser } from '../../../server/http';
import { emailEnabled } from '../../../server/email';
import { findTasks, taskLabel, buildMessages, askDeepSeek, limitFor, deepConfig, reserveUsage, finishUsage, releaseUsage, usageSnapshot, signReply, verifyReply, GLOBAL_LIMIT_MESSAGE } from '../../../server/ai';
import { isPremium } from '../../../lib/plans';

// POST { message, history?: [{ sender, text, sig? }], deep?: true }
// -> { reply, sig, sources: [string], usage, deep }
// deep: dziļās domāšanas režīms (tikai Premium): lēnāks, rūpīgāks modelis, dienas limitā rēķinās kā vairāki parastie jautājumi.
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

  const deep = req.body?.deep === true;
  const deepCfg = deepConfig();
  if (deep && !deepCfg.enabled) return res.status(503).json({ error: 'Dziļā domāšana šobrīd nav pieejama.', code: 'DEEP_DISABLED' });
  if (deep && !isPremium(user)) return res.status(402).json({ error: 'Dziļā domāšana ir Premium funkcija.', code: 'PREMIUM_ONLY' });

  const weight = deep ? deepCfg.factor : 1;
  const limit = limitFor(user.plan);
  const slot = await reserveUsage(user.id, limit, { weight });
  if (slot?.globalLimit) return res.status(503).json({ error: GLOBAL_LIMIT_MESSAGE, code: 'AI_GLOBAL_LIMIT' });
  if (slot?.busy) return res.status(429).json({ error: 'Iepriekšējā dziļā atbilde vēl tiek gatavota. Pagaidi, kamēr tā beigsies.', code: 'DEEP_BUSY' });
  if (!slot) {
    return res.status(429).json({
      error: `Šodienas AI limits ir izmantots. Tas atjaunojas plkst. 00:00${user.plan === 'free' ? ' vai pāriet uz Premium' : ''}.`,
      code: 'AI_LIMIT',
    });
  }

  try {
    const grade = user.profile?.level === 'klase' && [9, 12].includes(user.profile.grade) ? user.profile.grade : undefined;
    const earlier = history.filter((m) => m.sender === 'user').slice(-2).map((m) => m.text.slice(0, 400)).join(' ');
    const tasks = await findTasks(`${earlier} ${message}`.trim(), { grade });
    const { reply, usage, model } = await askDeepSeek(buildMessages({ message, history, tasks, deep }), { deep });
    await finishUsage(slot.id, model, usage, weight).catch((e) => console.error('ai_usage atjaunināšana:', e.message));
    res.status(200).json({ reply, sig: signReply(user.id, reply), sources: tasks.map(taskLabel), usage: await usageSnapshot(user), deep });
  } catch (err) {
    // Neizdevās -> jautājums netiek norakstīts no limita. Ja DeepSeek tomēr iztērēja tokenus (tukša atbilde), tie tiek ieskaitīti ar svaru.
    if (err.spent?.usage) await finishUsage(slot.id, err.spent.model, err.spent.usage, weight).catch(() => {});
    else await releaseUsage(slot.id).catch(() => {});
    if (err.code === 'NO_KEY') return res.status(503).json({ error: 'AI skolotājs vēl nav ieslēgts. Lūdz administratoram pievienot DeepSeek atslēgu.' });
    if (err.code === 'UPSTREAM') return res.status(502).json({ error: 'AI šobrīd nav pieejams. Pamēģini pēc brīža.' });
    console.error('tutor kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
