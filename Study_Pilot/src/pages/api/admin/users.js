import { query, deleteUser, findById } from '../../../server/db';
import { allow, requireAdmin } from '../../../server/http';
import { cancelOnDelete } from '../../../server/stripe';

// GET    -> visi lietotāji ar plānu, stāvokli un AI lietojumu
// PATCH  { id, plan?: 'free'|'premium', role?: 'user'|'admin', blocked?: boolean }
// DELETE { id } -> dzēst kontu (piem., pēc lietotāja pieprasījuma pa e-pastu)
export default async function handler(req, res) {
  if (!allow(req, res, ['GET', 'PATCH', 'DELETE'])) return;
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.plan, u.plan_source, u.stripe_status, u.premium_until, u.profile,
              u.created_at, u.last_active, u.blocked_at, u.email_verified_at,
              jsonb_array_length(COALESCE(u.data->'chat', '[]'::jsonb)) AS chat,
              jsonb_array_length(COALESCE(u.data->'quizResults', '[]'::jsonb)) AS quizzes,
              COALESCE(a.today, 0)::int AS ai_today, COALESCE(a.month, 0)::int AS ai_month,
              COALESCE(a.tokens_month, 0)::bigint AS tokens_month
       FROM users u
       LEFT JOIN (
         SELECT user_id,
                count(*) FILTER (WHERE created_at > now() - interval '1 day') AS today,
                count(*) FILTER (WHERE created_at > now() - interval '30 days') AS month,
                sum(prompt_tokens + completion_tokens) FILTER (WHERE created_at > now() - interval '30 days') AS tokens_month
         FROM ai_usage GROUP BY user_id
       ) a ON a.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    return res.status(200).json({
      users: rows.map((r) => ({
        id: r.id, email: r.email, role: r.role, plan: r.plan, planSource: r.plan_source, stripeStatus: r.stripe_status,
        premiumUntil: r.premium_until, name: `${r.profile?.firstName || ''} ${r.profile?.lastName || ''}`.trim(),
        level: r.profile?.level, grade: r.profile?.grade, school: r.profile?.school,
        createdAt: r.created_at, lastActive: r.last_active, blocked: Boolean(r.blocked_at), verified: Boolean(r.email_verified_at),
        chat: r.chat, quizzes: r.quizzes, aiToday: r.ai_today, aiMonth: r.ai_month, tokensMonth: Number(r.tokens_month),
      })),
    });
  }

  const id = String(req.body?.id || '');
  const target = /^[0-9a-f-]{36}$/.test(id) ? await findById(id) : null;
  if (!target) return res.status(404).json({ error: 'Lietotājs nav atrasts' });
  if (target.id === admin.id) return res.status(400).json({ error: 'Savu kontu šeit mainīt nevar' });

  if (req.method === 'DELETE') {
    await cancelOnDelete(target);
    await deleteUser(target.id);
    return res.status(200).json({ ok: true });
  }

  const { plan, role, blocked } = req.body || {};
  if (plan !== undefined) {
    if (!['free', 'premium'].includes(plan)) return res.status(400).json({ error: 'Nederīgs plāns' });
    if (target.planSource === 'stripe' && plan === 'free') return res.status(409).json({ error: 'Šim lietotājam ir apmaksāts abonements — to atceļ Stripe' });
    await query("UPDATE users SET plan = $2, plan_source = CASE WHEN $2 = 'premium' THEN 'admin' ELSE NULL END WHERE id = $1", [target.id, plan]);
  }
  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Nederīga loma' });
    await query('UPDATE users SET role = $2 WHERE id = $1', [target.id, role]);
  }
  if (blocked !== undefined) {
    await query('UPDATE users SET blocked_at = CASE WHEN $2 THEN now() END WHERE id = $1', [target.id, Boolean(blocked)]);
    if (blocked) await query('DELETE FROM sessions WHERE user_id = $1', [target.id]);
  }
  res.status(200).json({ ok: true });
}
