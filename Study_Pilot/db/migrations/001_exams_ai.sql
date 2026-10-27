-- Eksāmenu bāze, AI lietojuma uzskaite un lietotāja plāns.
-- Palaiž: npm run migrate  (drošs atkārtot)

CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent nav IMMUTABLE, tāpēc vajag apvalku, lai varētu indeksēt
CREATE OR REPLACE FUNCTION sp_unaccent(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
  AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, $1) $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'premium'));

CREATE TABLE IF NOT EXISTS exam_documents (
  id serial PRIMARY KEY,
  subject text NOT NULL,           -- piem. 'matemātika'
  grade int NOT NULL,              -- 9 vai 12
  year int NOT NULL,
  session text NOT NULL DEFAULT '',-- piem. 'pamatsesija'
  title text NOT NULL,
  source_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject, grade, year, session)
);

CREATE TABLE IF NOT EXISTS exam_tasks (
  id serial PRIMARY KEY,
  doc_id int NOT NULL REFERENCES exam_documents(id) ON DELETE CASCADE,
  number text NOT NULL,            -- uzdevuma numurs eksāmenā
  section text NOT NULL DEFAULT '',
  topic text NOT NULL DEFAULT '',
  text text NOT NULL,              -- uzdevuma teksts (formulas ar LaTeX)
  points int,
  answer text NOT NULL DEFAULT '', -- pareizā atbilde / vērtēšanas instrukcija
  solution text NOT NULL DEFAULT '',
  tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', sp_unaccent(lower(topic || ' ' || section || ' ' || text)))
  ) STORED,
  UNIQUE (doc_id, number)
);
CREATE INDEX IF NOT EXISTS exam_tasks_tsv_idx ON exam_tasks USING GIN (tsv);

CREATE TABLE IF NOT EXISTS ai_usage (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  model text NOT NULL DEFAULT '',
  prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ai_usage_user_time_idx ON ai_usage (user_id, created_at DESC);

-- Vecās sesijas netiek dzēstas automātiski; šis ļauj tās iztīrīt: DELETE FROM sessions WHERE expires_at < now();
