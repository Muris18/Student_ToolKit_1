-- Palaišanai: drošība (pieslēgšanās limits, bloķēšana), e-pasta apstiprināšana un paroles atjaunošana,
-- Stripe Premium abonements. Palaiž: npm run migrate (drošs atkārtot).

-- Konta stāvoklis
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at timestamptz;          -- administrators bloķējis
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;   -- e-pasts apstiprināts
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;

-- Premium: kas to piešķīra ('admin' vai 'stripe') un Stripe identifikatori
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_source text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_status text;               -- active, trialing, past_due, canceled ...
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until timestamptz;       -- pašreizējā apmaksātā perioda beigas
CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Esošajiem kontiem e-pastu uzskatām par apstiprinātu (tie izveidoti pirms apstiprināšanas ieviešanas)
UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL;

-- Pieslēgšanās mēģinājumi (limitam). Tiek tīrīti automātiski pēc 1 dienas.
CREATE TABLE IF NOT EXISTS login_attempts (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  ip text NOT NULL,
  ok boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_email_idx ON login_attempts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON login_attempts (ip, created_at DESC);

-- Vienreizējie žetoni e-pasta apstiprināšanai un paroles atjaunošanai (glabājas tikai hash)
CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('verify', 'reset')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS email_tokens_user_idx ON email_tokens (user_id, kind);

-- Stripe notikumi, kas jau apstrādāti (lai viens notikums netiktu apstrādāts divreiz)
CREATE TABLE IF NOT EXISTS stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
