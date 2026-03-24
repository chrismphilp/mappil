-- Migration: Create friend_challenges table

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
