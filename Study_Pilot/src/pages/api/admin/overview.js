import { db, query } from '../../../server/db';
import { allow, requireAdmin } from '../../../server/http';
import { emailEnabled } from '../../../server/email';
import { globalLimit, RIGA_DAY } from '../../../server/ai';
import { stripeEnabled } from '../../../server/stripe';

// Kopsavilkums administratoram: lietotāji, Premium, AI lietojums un izmaksas, sistēmas stāvoklis
export default async function handler(req, res) {
  if (!allow(req, res, ['GET'])) return;
  if (!(await requireAdmin(req, res))) return;
  const u = (await query(
    `SELECT count(*)::int AS users,
            count(*) FILTER (WHERE last_active > now() - interval '1 day')::int AS active_today,
            count(*) FILTER (WHERE last_active > now() - interval '7 days')::int AS active_week,
            count(*) FILTER (WHERE plan = 'premium')::int AS premium,
            count(*) FILTER (WHERE plan_source = 'stripe')::int AS paying,
            count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new_week,
            count(*) FILTER (WHERE blocked_at IS NOT NULL)::int AS blocked
     FROM users`
  )).rows[0];
  // Šodienas (Rīgas diena) kopējais AI lietojums pret globālo limitu
  const aiToday = (await query(`SELECT count(*)::int AS n FROM ai_usage WHERE created_at >= ${RIGA_DAY}`)).rows[0].n;
  const a = (await query(
    `SELECT count(*) FILTER (WHERE created_at > now() - interval '1 day')::int AS today,
            count(*)::int AS month,
            COALESCE(sum(prompt_tokens), 0)::bigint AS tin,
            COALESCE(sum(completion_tokens), 0)::bigint AS tout
     FROM ai_usage WHERE created_at > now() - interval '30 days'`
  )).rows[0];
  const daily = (await query(
    `SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Europe/Riga'), 'YYYY-MM-DD') AS day, count(*)::int AS n
     FROM ai_usage WHERE created_at > now() - interval '14 days' GROUP BY 1 ORDER BY 1`
  )).rows;
  const exams = (await query('SELECT count(DISTINCT d.id)::int AS docs, count(t.id)::int AS tasks FROM exam_documents d LEFT JOIN exam_tasks t ON t.doc_id = d.id')).rows[0];
  // Izmaksu aprēķins: cenas USD par 1 miljonu tokenu (.env AI_PRICE_IN / AI_PRICE_OUT, ja norādītas)
  const pin = parseFloat(process.env.AI_PRICE_IN);
  const pout = parseFloat(process.env.AI_PRICE_OUT);
  const cost = Number.isFinite(pin) && Number.isFinite(pout) ? (Number(a.tin) * pin + Number(a.tout) * pout) / 1e6 : null;
  res.status(200).json({
    startedAt: db.startedAt,
    users: u,
    ai: { today: a.today, todayRiga: aiToday, globalLimit: globalLimit(), month: a.month, tokensIn: Number(a.tin), tokensOut: Number(a.tout), costMonth: cost, daily, keySet: Boolean(process.env.DEEPSEEK_API_KEY) },
    exams,
    features: { email: emailEnabled(), payments: stripeEnabled(), webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET) },
  });
}
