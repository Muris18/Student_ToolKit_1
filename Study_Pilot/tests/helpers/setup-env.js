// Palaiž pirms katra testu faila: ja DATABASE_URL nav iestatīts, mēģina to nolasīt no .env.local (lokālai izstrādei).
// CI to iestata tieši. Slepenās atslēgas (AI, e-pasts, Stripe) testos vienmēr netiek lietotas.
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  try {
    const text = fs.readFileSync(path.join(__dirname, '..', '..', '.env.local'), 'utf8');
    const m = text.match(/^DATABASE_URL=(.*)$/m);
    if (m) process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, '');
  } catch (e) { /* nav .env.local */ }
}
for (const k of ['DEEPSEEK_API_KEY', 'EMAIL_API_KEY', 'STRIPE_SECRET_KEY', 'AI_DAILY_LIMIT_GLOBAL', 'COOKIE_SECURE']) delete process.env[k];
