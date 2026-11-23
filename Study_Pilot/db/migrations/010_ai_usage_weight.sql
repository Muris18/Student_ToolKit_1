-- AI dziļās domāšanas režīms: izsaukuma svars dienas limitā (1 = parasts jautājums, 5 = dziļās domāšanas jautājums u.tml.).
-- Limits tiek rēķināts kā summa (prompt_tokens + completion_tokens) * weight; paši tokenu skaiti paliek patiesi (izmaksu uzskaitei).
-- Droša atkārtošanai: esošie ieraksti saņem svaru 1. Palaiž: npm run migrate.
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS weight smallint NOT NULL DEFAULT 1 CHECK (weight >= 1);
