import { db, createSession, findByEmail, checkPassword, publicUser, dataWithAttempts } from '../../../server/db';
import { allow } from '../../../server/http';
import { setSessionCookie, sameOrigin } from '../../../server/cookies';
import { dummyPasswordCheck } from '../../../lib/password';
import { clientIp, loginBlockedFor, recordLogin } from '../../../server/security';

export default async function handler(req, res) {
  if (!allow(req, res, ['POST'])) return;
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Pieprasījums noraidīts (cits izcelsmes avots)', code: 'CSRF' });
  const { password } = req.body || {};
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 200);
  const ip = clientIp(req);

  const wait = await loginBlockedFor(email, ip);
  if (wait) {
    res.setHeader('Retry-After', String(wait * 60));
    return res.status(429).json({ error: `Pārāk daudz nepareizu mēģinājumu. Pamēģini pēc ${wait} min.` });
  }

  const user = await findByEmail(email);
  // Konstants laiks: ja e-pasts nav reģistrēts, tik un tā izpilda tādu pašu hash darbu, lai atbildes ātrums neatklātu, kuri e-pasti eksistē
  const valid = user ? await checkPassword(user, password) : await dummyPasswordCheck(password);
  if (!user || !valid) {
    await recordLogin(email, ip, false);
    return res.status(401).json({ error: 'Nepareizs e-pasts vai parole' });
  }
  if (user.blockedAt) {
    await recordLogin(email, ip, false);
    return res.status(403).json({ error: 'Šis konts ir bloķēts. Raksti uz jautajumi@studypilot.lv.' });
  }
  await recordLogin(email, ip, true);
  setSessionCookie(res, await createSession(user.id));
  res.status(200).json({ bootId: db.bootId, user: publicUser(user), data: await dataWithAttempts(user), dataVersion: user.dataVersion });
}
