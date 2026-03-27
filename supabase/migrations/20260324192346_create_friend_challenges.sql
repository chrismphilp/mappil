-- Migration: Create friend_challenges table

CREATE TABLE IF NOT EXISTS friend_challenges (
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'friend_challenges'
          AND policyname = 'Allow anonymous inserts'
    ) THEN
        CREATE POLICY "Allow anonymous inserts" ON friend_challenges
            FOR INSERT
            TO public
            WITH CHECK (true);
    END IF;
END
$$;

-- Allow anonymous reads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'friend_challenges'
          AND policyname = 'Allow anonymous reads'
    ) THEN
        CREATE POLICY "Allow anonymous reads" ON friend_challenges
            FOR SELECT
            TO public
            USING (true);
    END IF;
END
$$;
