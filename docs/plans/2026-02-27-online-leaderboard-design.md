# Online Leaderboard Design

## Overview

Add a global leaderboard to Mappil where players submit scores with a username after completing a game. Backend powered by Supabase (Postgres + REST API). No authentication — just a freeform username stored in localStorage for reuse.

## Backend: Supabase

### `scores` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `username` | text | Player-chosen, 3-20 chars |
| `score` | int | Regions correctly found |
| `errors` | int | Total wrong guesses |
| `best_streak` | int | Longest consecutive correct run |
| `total_regions` | int | Total regions in the game |
| `difficulty` | text | Easy / Medium / Hard |
| `continent` | text | World / Africa / Asia / etc. |
| `duration_secs` | int | Seconds from first region to game complete |
| `created_at` | timestamptz | Auto-set by Supabase |

### Row Level Security

- `SELECT`: allowed for everyone (anon key)
- `INSERT`: allowed for everyone (anon key), rate-limited to 1 insert per IP per 30 seconds via a Postgres function
- `UPDATE` / `DELETE`: denied

### Rate Limiting

A Postgres function checks `created_at` of the most recent row matching the request IP (`current_setting('request.headers')::json->>'x-forwarded-for'`). If less than 30 seconds ago, the insert is rejected.

## Frontend Changes

### Game State: Add Timer

- Add `startTime: number | null` to `GameState`
- Set `startTime = Date.now()` on the first `SELECT_REGION` or `SKIP_REGION` action (not on game init, so the timer doesn't include idle time)
- Compute `duration_secs = Math.floor((Date.now() - startTime) / 1000)` at game completion

### GameCompleteModal: Score Submission

- New "Submit Score" button below existing stats
- Clicking reveals a username text input (pre-filled from localStorage if returning player)
- On submit: validate username (3-20 chars, alphanumeric + spaces), send to Supabase, show confirmation
- Button states: "Submit Score" -> "Submitting..." -> "Submitted"
- Store username in localStorage for next time

### Leaderboard Modal

- Accessible from a trophy/leaderboard icon button near the settings button
- Shows top 20 scores in a scrollable list
- Each row: rank, username, score/total, errors, best streak, duration, difficulty, continent
- Filterable by difficulty and continent (dropdown selectors at top)
- Default view: current game's difficulty + continent
- Data fetched from Supabase on open, with a simple loading state

### New Dependencies

- `@supabase/supabase-js` — Supabase client SDK

### Environment Variables

- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Files to Create/Modify

1. `src/lib/supabase.ts` — Supabase client init
2. `src/lib/leaderboard.ts` — `submitScore()` and `fetchLeaderboard()` functions
3. `src/types/game.types.ts` — Add `startTime` to `GameState`
4. `src/hooks/useGameState.ts` — Set `startTime` on first action, compute duration
5. `src/components/GameCompleteModal.tsx` — Add score submission UI
6. `src/components/LeaderboardModal.tsx` — New leaderboard display component
7. `src/components/LeaderboardButton.tsx` — Trophy icon button
8. `src/components/GameContent.tsx` — Wire leaderboard button and pass duration to modal
