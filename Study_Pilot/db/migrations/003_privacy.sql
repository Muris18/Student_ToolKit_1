-- Privātuma politikas prasības: reģistrācijas apstiprinājums, AI piekrišana, neaktīvo kontu tīrīšana.

-- Kad lietotājs reģistrācijā apstiprināja "vismaz 13 gadi" un "izlasīju privātuma politiku"
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Kad lietotājs piekrita datu nosūtīšanai uz DeepSeek (ārpus ES). NULL = nav piekritis vai atsaucis.
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_consent_at timestamptz;

-- Neaktīvo kontu un beigušos sesiju ātrai atrašanai
CREATE INDEX IF NOT EXISTS users_last_active_idx ON users (last_active);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);
