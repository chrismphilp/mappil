ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS display_username TEXT,
  ADD COLUMN IF NOT EXISTS username_redacted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE friend_challenges
  ADD COLUMN IF NOT EXISTS created_by_display_username TEXT,
  ADD COLUMN IF NOT EXISTS username_redacted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS blocked_usernames (
  term TEXT PRIMARY KEY,
  match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'substring')),
  severity TEXT NOT NULL DEFAULT 'block',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blocked_usernames ENABLE ROW LEVEL SECURITY;

INSERT INTO blocked_usernames (term, match_type, severity, notes)
VALUES
  ('fuck', 'substring', 'block', 'Core profanity'),
  ('shit', 'substring', 'block', 'Core profanity'),
  ('bitch', 'substring', 'block', 'Core profanity'),
  ('nigger', 'substring', 'block', 'Severe racial slur'),
  ('nigga', 'substring', 'block', 'Severe racial slur'),
  ('faggot', 'substring', 'block', 'Severe homophobic slur'),
  ('whore', 'substring', 'block', 'Sexual insult'),
  ('slut', 'substring', 'block', 'Sexual insult'),
  ('retard', 'substring', 'block', 'Ableist insult')
ON CONFLICT (term) DO NOTHING;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON scores;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON friend_challenges;
