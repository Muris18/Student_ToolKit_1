-- Eksāmenu mēģinājumi atsevišķā tabulā (iepriekš users.data -> examAttempts).
-- Viens ieraksts uz (lietotājs, uzdevums) ar jaunāko rezultātu. Novecojis klients vairs nevar izdzēst citur uzkrātos mēģinājumus.
-- users.data->examAttempts netiek dzēsts (rezerves kopija); lietotne no tā vairs nelasa. Palaiž: npm run migrate (drošs atkārtot).
CREATE TABLE IF NOT EXISTS exam_attempts (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id integer NOT NULL,
  correct boolean NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id)
);
CREATE INDEX IF NOT EXISTS exam_attempts_user_at_idx ON exam_attempts (user_id, at);

-- Esošo datu pārcelšana: katram uzdevumam jaunākais mēģinājums
INSERT INTO exam_attempts (user_id, task_id, correct, at)
SELECT DISTINCT ON (u.id, (a->>'taskId')::int)
       u.id, (a->>'taskId')::int, (a->>'correct')::boolean,
       COALESCE(NULLIF(a->>'at', '')::timestamptz, u.created_at)
FROM users u, jsonb_array_elements(CASE WHEN jsonb_typeof(u.data->'examAttempts') = 'array' THEN u.data->'examAttempts' ELSE '[]'::jsonb END) a
WHERE (a->>'taskId') ~ '^[0-9]{1,9}$' AND (a->>'correct') IN ('true', 'false')
ORDER BY u.id, (a->>'taskId')::int, COALESCE(NULLIF(a->>'at', '')::timestamptz, u.created_at) DESC
ON CONFLICT DO NOTHING;
