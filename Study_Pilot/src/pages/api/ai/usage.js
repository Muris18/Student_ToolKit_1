import { allow, requireUser } from '../../../server/http';
import { limited } from '../../../server/security';
import { usageSnapshot } from '../../../server/ai';

// GET -> { used, limit, percent, resetsAt, plan }: šodien (Rīgas diena) izmantotie AI tokeni un dienas limits (josla lietotnē).
// Lietotājs redz tikai savu lietojumu; teksti netiek atgriezti.
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  const user = await requireUser(req, res);
  if (!user) return;
  if (limited(res, `aiusage:${user.id}`, 120, 600)) return;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(await usageSnapshot(user));
}
