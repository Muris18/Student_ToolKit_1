-- Mācību istabas: kopīga mācīšanās ar kodu, taimeri, uzdevumu kopu un kļūdu pārskatu.
-- Istabas bez aktivitātes 24 h tiek dzēstas kopā ar atbildēm (src/server/rooms.js, maybeCleanupRooms).
-- Palaiž: npm run migrate (drošs atkārtot).
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  mode text NOT NULL DEFAULT 'single' CHECK (mode IN ('single', 'mixed')),
  topic text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'lobby' CHECK (state IN ('lobby', 'running', 'review')),
  round int NOT NULL DEFAULT 1,
  set_title text NOT NULL DEFAULT '',
  set_subject text NOT NULL DEFAULT '',
  set_grade int,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,   -- uzdevumu kopas momentuzņēmums ar pareizajām atbildēm
  timer_total int NOT NULL DEFAULT 1500,
  timer_left int NOT NULL DEFAULT 1500,
  timer_ends_at timestamptz,                      -- NULL = taimeris nav ieslēgts
  banned uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_activity timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rooms_last_activity_idx ON rooms (last_activity);
CREATE INDEX IF NOT EXISTS rooms_host_idx ON rooms (host_id);

CREATE TABLE IF NOT EXISTS room_members (
  id bigserial NOT NULL UNIQUE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,                             -- "Kristers M."
  status text NOT NULL DEFAULT 'studying' CHECK (status IN ('studying', 'break')),
  topic text NOT NULL DEFAULT '',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
CREATE INDEX IF NOT EXISTS room_members_user_idx ON room_members (user_id);

CREATE TABLE IF NOT EXISTS room_answers (
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  choice int NOT NULL,
  correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id, question_id)
);

CREATE TABLE IF NOT EXISTS room_help (
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id, question_id)
);
