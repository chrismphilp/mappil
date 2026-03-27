-- Migration: Add daily challenge fields to scores table

ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS challenge_id TEXT,
ADD COLUMN IF NOT EXISTS seed TEXT,
ADD COLUMN IF NOT EXISTS is_daily_challenge BOOLEAN DEFAULT FALSE;

-- Add indices for the new challenge fields to optimize the updated leaderboard queries
CREATE INDEX IF NOT EXISTS idx_scores_challenge ON scores(challenge_id) WHERE challenge_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scores_daily ON scores(is_daily_challenge);
