-- Datu versija: novērš, ka vecāka datu kopija (cita ierīce vai cilne) pārraksta jaunāko darbu.
-- PUT /api/me/data saglabā tikai tad, ja klienta versija sakrīt ar šo; pēc saglabāšanas versija palielinās par 1.
-- Esošie lietotāji sāk ar 0. Palaiž: npm run migrate (drošs atkārtot).
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_version integer NOT NULL DEFAULT 0;
