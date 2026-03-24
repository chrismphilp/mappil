ALTER TABLE scores
  ADD COLUMN IF NOT EXISTS player_id TEXT,
  ADD COLUMN IF NOT EXISTS challenge_source TEXT NOT NULL DEFAULT 'free_play',
  ADD COLUMN IF NOT EXISTS ruleset_key TEXT;

UPDATE scores
SET challenge_source = CASE
  WHEN is_daily_challenge = TRUE THEN 'daily'
  WHEN challenge_id IS NOT NULL THEN 'friend'
  ELSE 'free_play'
END
WHERE challenge_source IS NULL OR challenge_source = '';

UPDATE scores
SET ruleset_key = CONCAT(
  'difficulty=', difficulty,
  '|continent=', continent,
  '|mode=', game_mode,
  '|source=', challenge_source,
  CASE
    WHEN challenge_id IS NOT NULL THEN CONCAT('|challenge=', challenge_id)
    ELSE ''
  END
)
WHERE ruleset_key IS NULL;

ALTER TABLE scores
  ALTER COLUMN ruleset_key SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scores_challenge_source ON scores(challenge_source);
CREATE INDEX IF NOT EXISTS idx_scores_ruleset_key ON scores(ruleset_key);
