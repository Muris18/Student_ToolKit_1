import { allow, requireUser } from '../../../server/http';
import { findTasks, taskLabel, buildMessages, askDeepSeek, usedToday, limitFor, logUsage } from '../../../server/ai';

// POST { message, history?: [{ sender, text }] }
// -> { reply, sources: [string], remaining }
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;

  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Ievadi jautājumu' });
  if (message.length > 1500) return res.status(400).json({ error: 'Jautājums ir pārāk garš (līdz 1500 simboliem)' });
  const history = Array.isArray(req.body?.history) ? req.body.history.filter((m) => m && typeof m.text === 'string') : [];

  const limit = limitFor(user.plan);
  const used = await usedToday(user.id);
  if (used >= limit) {
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
    await logUsage(user.id, model, usage);
    res.status(200).json({ reply, sources: tasks.map(taskLabel), remaining: limit - used - 1 });
  } catch (err) {
    if (err.code === 'NO_KEY') return res.status(503).json({ error: 'AI skolotājs vēl nav ieslēgts. Lūdz administratoram pievienot DeepSeek atslēgu.' });
    if (err.code === 'UPSTREAM') return res.status(502).json({ error: 'AI šobrīd nav pieejams. Pamēģini pēc brīža.' });
    console.error('tutor kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
