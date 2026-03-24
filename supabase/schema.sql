-- Create the scores table
CREATE TABLE scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player_id TEXT,
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
    challenge_source TEXT NOT NULL DEFAULT 'free_play',
    ruleset_key TEXT NOT NULL,
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
CREATE INDEX idx_scores_player ON scores(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_scores_challenge_source ON scores(challenge_source);
CREATE INDEX idx_scores_ruleset_key ON scores(ruleset_key);

-- Create the friend_challenges table
CREATE TABLE friend_challenges (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_username TEXT NOT NULL,
    seed TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    continent TEXT NOT NULL,
    game_mode TEXT NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE friend_challenges ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (so players can submit challenges without an account)
CREATE POLICY "Allow anonymous inserts" ON friend_challenges
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow anonymous reads
CREATE POLICY "Allow anonymous reads" ON friend_challenges
    FOR SELECT
    TO public
    USING (true);
