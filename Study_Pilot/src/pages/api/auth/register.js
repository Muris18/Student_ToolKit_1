import { db, createUser, createSession, findByEmail, publicUser, cleanProfile, validateProfile, passwordProblem, createEmailToken } from '../../../server/db';
import { allow } from '../../../server/http';
import { setSessionCookie, sameOrigin } from '../../../server/cookies';
import { clientIp, limited } from '../../../server/security';
import { emailEnabled, sendVerifyEmail } from '../../../server/email';

export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Pieprasījums noraidīts (cits izcelsmes avots)', code: 'CSRF' });
  // REGISTER_LIMIT_PER_HOUR (noklusējums 40): vienā skolā visi skolēni reģistrējas no vienas IP adreses (skolas Wi-Fi)
  const regLimit = parseInt(process.env.REGISTER_LIMIT_PER_HOUR, 10) > 0 ? parseInt(process.env.REGISTER_LIMIT_PER_HOUR, 10) : 40;
  if (limited(res, `register:${clientIp(req)}`, regLimit, 3600, 'Pārāk daudz jaunu kontu no šī tīkla. Pamēģini pēc stundas.')) return;
  const { password, profile, ageConfirmed, acceptTerms } = req.body || {};
  if (ageConfirmed !== true) return res.status(400).json({ error: 'Study Pilot drīkst lietot tikai no 13 gadu vecuma' });
  if (acceptTerms !== true) return res.status(400).json({ error: 'Lai izveidotu kontu, jāpiekrīt lietošanas noteikumiem un jāizlasa privātuma politika' });
  const e = String(req.body?.email || '').trim().toLowerCase();
  if (e.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Nederīgs e-pasts' });
  const pwErr = passwordProblem(password, e);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const p = cleanProfile(profile);
  const err = validateProfile(p);
  if (err) return res.status(400).json({ error: err });
  if (await findByEmail(e)) return res.status(409).json({ error: 'Šis e-pasts jau ir reģistrēts' });

  try {
    const sendMail = emailEnabled();
    const user = await createUser({ email: e, password, profile: p, verified: !sendMail });
    if (sendMail) {
      try {
        await sendVerifyEmail(e, await createEmailToken(user.id, 'verify', 48));
      } catch (mailErr) {
        console.error('Apstiprinājuma e-pasts netika nosūtīts:', mailErr.message);
      }
    }
    setSessionCookie(res, await createSession(user.id));
    res.status(201).json({ bootId: db.bootId, user: publicUser(user), data: user.data, dataVersion: user.dataVersion });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Šis e-pasts jau ir reģistrēts' });
    throw error;
  }
}
