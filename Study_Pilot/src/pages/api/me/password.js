import { checkPassword, passwordProblem, setPassword, createSession, findById, publicUser } from '../../../server/db';
import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';

// POST { current, password } -> maina paroli, izbeidz citas sesijas un atgriež jaunu žetonu
export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `pw:${user.id}`, 5, 900)) return;
  const { current, password } = req.body || {};
  if (!(await checkPassword(user, current))) return res.status(400).json({ error: 'Pašreizējā parole nav pareiza' });
  const err = passwordProblem(password, user.email);
  if (err) return res.status(400).json({ error: err });
  await setPassword(user.id, password);
  const token = await createSession(user.id);
  res.status(200).json({ token, user: publicUser(await findById(user.id)) });
}
