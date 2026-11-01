import { allow, requireUser } from '../../../server/http';
import { listDocs } from '../../../server/exams';

// GET ?grade=9|12 -> valsts eksāmenu saraksts
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  const g = parseInt(req.query.grade, 10);
  res.status(200).json({ docs: await listDocs([9, 12].includes(g) ? g : null) });
}
