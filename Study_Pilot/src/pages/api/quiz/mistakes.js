import { allow, requireUser } from '../../../server/http';
import { userMistakes, summarize } from '../../../server/quiz';
import { dataWithAttempts } from '../../../server/db';

// GET ?grade=9|12 -> { bySubject: { [subject]: { count, topics: [{ name, n }] } } }
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const g = parseInt(req.query.grade, 10);
  const grade = [9, 12].includes(g) ? g : null;
  res.status(200).json({ bySubject: summarize(await userMistakes(await dataWithAttempts(user), grade)) });
}
