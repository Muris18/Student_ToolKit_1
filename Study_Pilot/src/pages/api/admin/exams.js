import { query, getPool } from '../../../server/db';
import { allow, requireAdmin } from '../../../server/http';
import { listDocs, validate, saveDoc } from '../../../server/exams';

export const config = { api: { bodyParser: { sizeLimit: '3mb' } } };

// GET    -> visi eksāmeni
// POST   { exam: {...} } -> augšupielādē (formāts kā exams/*.json; atkārtoti atjaunina)
// DELETE { id } -> dzēš eksāmenu ar visiem uzdevumiem
export default async function handler(req, res) {
  if (!allow(req, res, ['GET', 'POST', 'DELETE'])) return;
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') return res.status(200).json({ docs: await listDocs(null) });

  if (req.method === 'DELETE') {
    const id = parseInt(req.body?.id, 10);
    const r = await query('DELETE FROM exam_documents WHERE id = $1', [id]);
    return r.rowCount ? res.status(200).json({ ok: true }) : res.status(404).json({ error: 'Nav atrasts' });
  }

  const d = req.body?.exam;
  try {
    if (!d || typeof d !== 'object') throw new Error('Trūkst eksāmena JSON');
    validate('fails', d);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  const id = await saveDoc(getPool(), d);
  res.status(200).json({ ok: true, id, tasks: d.tasks.length });
}
