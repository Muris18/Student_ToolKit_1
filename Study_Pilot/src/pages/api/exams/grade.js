import { allow, requireUser } from '../../../server/http';
import { gradeExam } from '../../../server/exams';
import { limited } from '../../../server/security';

// POST { docId, answers: { [taskId]: "B" } } -> { tasks: [...] }
// Eksāmena simulācijas beigās: testa jautājumu pārbaude un atvērto uzdevumu atbilžu paraugi.
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `grade:${user.id}`, 20, 600, 'Pārāk daudz iesniegšanu. Pagaidi mazliet.')) return;
  const docId = parseInt(req.body?.docId, 10);
  if (!Number.isInteger(docId)) return res.status(400).json({ error: 'Nav norādīts eksāmens' });

  // Tikai testa atbilžu burti (īsi), pārējais tiek ignorēts
  const raw = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  const answers = {};
  for (const [k, v] of Object.entries(raw).slice(0, 500)) {
    const id = parseInt(k, 10);
    if (Number.isInteger(id) && typeof v === 'string') answers[id] = v.slice(0, 20);
  }

  const r = await gradeExam(docId, answers);
  if (!r) return res.status(404).json({ error: 'Eksāmens nav atrasts' });
  res.status(200).json(r);
}
