-- Papildu lauki eksāmenu uzdevumiem: testa varianti, kopīgs konteksts, attēla apraksts.
-- tsv (meklēšanas indekss) tiek pārbūvēts, lai iekļautu arī šos laukus.

ALTER TABLE exam_tasks DROP COLUMN IF EXISTS tsv;

ALTER TABLE exam_tasks
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS options text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS figure text NOT NULL DEFAULT '';

ALTER TABLE exam_tasks DROP CONSTRAINT IF EXISTS exam_tasks_kind_check;
ALTER TABLE exam_tasks ADD CONSTRAINT exam_tasks_kind_check CHECK (kind IN ('choice', 'open'));

ALTER TABLE exam_tasks ADD COLUMN tsv tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', sp_unaccent(lower(
    topic || ' ' || section || ' ' || context || ' ' || text || ' ' || options || ' ' || figure
  )))
) STORED;

CREATE INDEX IF NOT EXISTS exam_tasks_tsv_idx ON exam_tasks USING GIN (tsv);
