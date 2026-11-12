import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { query } from '../../../server/db';
import crypto from 'crypto';
import { userMistakes, examQuiz, aiQuiz, aiBlocker, sampleTasks } from '../../../server/quiz';
import { reserveUsage, releaseUsage, limitFor } from '../../../server/ai';

const cap = (s) => s[0].toUpperCase() + s.slice(1);

// POST { subject, grade } -> { quiz, notice }
// Ja ir kļūdas — tests par tām (AI jauni jautājumi vai īsti VIAA uzdevumi). Ja nav — diagnostikas tests.
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `quizgen:${user.id}`, 30, 3600, 'Pārāk daudz testu stundas laikā. Pagaidi mazliet.')) return;

  const grade = [9, 12].includes(Number(req.body?.grade)) ? Number(req.body.grade) : null;
  const subject = String(req.body?.subject || '').trim().toLowerCase();
  if (!grade || !subject) return res.status(400).json({ error: 'Izvēlies klasi un priekšmetu' });
  const known = await query('SELECT 1 FROM exam_documents WHERE subject = $1 AND grade = $2 LIMIT 1', [subject, grade]);
  if (!known.rows.length) return res.status(404).json({ error: 'Šim priekšmetam vēl nav eksāmenu' });

  try {
    const all = await userMistakes(user.data, grade);
    const tasks = all.tasks.filter((t) => t.subject === subject);
    const questions = all.questions.filter((q) => q.subject === subject);
    const hasMistakes = tasks.length + questions.length > 0;

    let quiz = null;
    let notice = await aiBlocker(user);
    // Vieta AI limitā tiek rezervēta pirms DeepSeek izsaukuma (paralēli pieprasījumi nevar pārsniegt limitu)
    let slot = notice ? null : await reserveUsage(user.id, limitFor(user.plan));
    // Globālais AI limits: šeit ir rezerves variants bez AI (īsti VIAA uzdevumi), tāpēc 503 vietā tests tiek sastādīts bez AI
    if (slot?.globalLimit) { notice = 'AI šodien ir sasniedzis kopējo dienas limitu, tāpēc tests sastādīts no īstiem VIAA uzdevumiem.'; slot = null; }
    else if (!notice && !slot) notice = 'Šodienas AI limits ir izmantots, tāpēc tests sastādīts no īstiem VIAA uzdevumiem.';
    const aiOk = Boolean(slot);
    if (slot) {
      try {
        const material = hasMistakes ? [...tasks, ...questions] : await sampleTasks(subject, grade);
        const r = await aiQuiz({ usageId: slot.id, subject, grade, mistakes: material, diagnostic: !hasMistakes });
        quiz = {
          title: r.title || `${cap(subject)}: ${hasMistakes ? 'treniņš pēc kļūdām' : 'diagnostikas tests'}`,
          source: hasMistakes ? 'ai' : 'ai-diagnostic', questions: r.questions,
        };
      } catch (e) {
        console.error('AI testa kļūda:', e.message);
        // DeepSeek neatbildēja -> limits netiek norakstīts. Ja atbildēja, bet tests bija nederīgs, tokeni jau iztērēti.
        if (e.code !== 'UPSTREAM' || !/nederīgu/.test(e.message)) await releaseUsage(slot.id).catch(() => {});
        notice = 'AI šobrīd neizdevās izveidot testu, tāpēc tests sastādīts no īstiem VIAA uzdevumiem.';
      }
    }
    if (!quiz) {
      quiz = hasMistakes
        ? { title: `${cap(subject)}: atkārto kļūdas`, source: 'exams', questions: await examQuiz({ subject, grade, mistakes: tasks }) }
        : { title: `${cap(subject)}: diagnostikas tests`, source: 'diagnostic', questions: await examQuiz({ subject, grade, count: 10 }) };
    }
    if (!hasMistakes) notice = 'Tev vēl nav kļūdu šajā priekšmetā, tāpēc šis ir diagnostikas tests. Nākamie testi tiks veidoti no tavām kļūdām.';
    if (!quiz.questions.length) {
      return res.status(404).json({ error: aiOk ? 'Neizdevās izveidot testu. Pamēģini vēlreiz.' : 'Šajā priekšmetā VIAA eksāmenos ir gandrīz tikai atvērtie uzdevumi, tāpēc testu var izveidot tikai AI. Ieslēdz AI mācību palīgu (piekrišana datu nosūtīšanai) un mēģini vēlreiz.' });
    }

    res.status(200).json({
      quiz: { id: crypto.randomBytes(8).toString('hex'), subject, grade, createdAt: new Date().toISOString(), mistakes: tasks.length + questions.length, ...quiz },
      notice,
    });
  } catch (err) {
    console.error('quiz/generate kļūda:', err);
    res.status(500).json({ error: 'Servera kļūda' });
  }
}
