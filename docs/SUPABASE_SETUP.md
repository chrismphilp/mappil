# Supabase Setup

## 1. Create a Supabase project

Go to https://supabase.com and create a new project.

## 2. Run the SQL setup

Open the SQL Editor in your Supabase dashboard and run:

```sql
-- Create scores table
create table scores (
  id uuid default gen_random_uuid() primary key,
  username text not null check (char_length(username) between 3 and 20),
  score int not null,
  errors int not null,
  best_streak int not null,
  total_regions int not null,
  difficulty text not null,
  continent text not null,
  duration_secs int not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table scores enable row level security;

-- Allow anyone to read
create policy "Public read" on scores for select using (true);

-- Allow anyone to insert
create policy "Public insert" on scores for insert with check (true);

-- Index for leaderboard queries
create index scores_leaderboard_idx on scores (difficulty, continent, score desc, errors asc, duration_secs asc);
```

## 3. Configure environment variables

Copy your project URL and anon key from Settings > API in the Supabase dashboard.

Fill in `.env.local`:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```
