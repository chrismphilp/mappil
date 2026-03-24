-- Create the scores table
CREATE TABLE scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT NOT NULL,
    score INTEGER NOT NULL,
    errors INTEGER NOT NULL,
    best_streak INTEGER NOT NULL,
    total_regions INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    continent TEXT NOT NULL,
    game_mode TEXT NOT NULL,
    duration_secs INTEGER NOT NULL,
    
    -- Challenge mode fields
    challenge_id TEXT,
    seed TEXT,
    is_daily_challenge BOOLEAN DEFAULT FALSE
);

-- Set up Row Level Security (RLS)
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so players can submit scores without an account)
CREATE POLICY "Allow anonymous inserts" ON scores
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow anonymous reads (so anyone can view the leaderboard)
CREATE POLICY "Allow anonymous reads" ON scores
    FOR SELECT
    TO public
    USING (true);

-- Create indices for efficient leaderboard querying
CREATE INDEX idx_scores_difficulty ON scores(difficulty);
CREATE INDEX idx_scores_continent ON scores(continent);
CREATE INDEX idx_scores_game_mode ON scores(game_mode);
CREATE INDEX idx_scores_challenge ON scores(challenge_id) WHERE challenge_id IS NOT NULL;
CREATE INDEX idx_scores_daily ON scores(is_daily_challenge);
