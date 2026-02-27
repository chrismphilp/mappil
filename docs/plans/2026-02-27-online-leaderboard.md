# Online Leaderboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a global leaderboard where players submit scores to Supabase after completing a game, viewable via a leaderboard modal.

**Architecture:** Supabase Postgres with RLS for insert/select only. No auth — just a freeform username. Timer tracks game duration from first action to completion. Leaderboard UI as a modal accessible from a button next to settings.

**Tech Stack:** Supabase JS client, React 18, TypeScript, Framer Motion, Tailwind CSS

---

### Task 1: Install Supabase and create client

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.local` (gitignored, user fills in)
- Modify: `.gitignore`

**Step 1: Install dependency**

Run: `npm install @supabase/supabase-js`

**Step 2: Create Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 3: Add `.env.local` template**

Create `.env.local`:

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

Ensure `.env.local` is in `.gitignore` (Create React App already gitignores it, but verify).

**Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/lib/supabase.ts .env.local
git commit -m "feat: add Supabase client setup"
```

---

### Task 2: Create leaderboard API functions

**Files:**
- Create: `src/lib/leaderboard.ts`

**Step 1: Create the leaderboard module**

Create `src/lib/leaderboard.ts`:

```ts
import { supabase } from './supabase';

export interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  errors: number;
  best_streak: number;
  total_regions: number;
  difficulty: string;
  continent: string;
  duration_secs: number;
  created_at: string;
}

export interface SubmitScoreParams {
  username: string;
  score: number;
  errors: number;
  best_streak: number;
  total_regions: number;
  difficulty: string;
  continent: string;
  duration_secs: number;
}

export async function submitScore(params: SubmitScoreParams): Promise<void> {
  const { error } = await supabase.from('scores').insert(params);
  if (error) throw new Error(error.message);
}

export async function fetchLeaderboard(
  difficulty?: string,
  continent?: string,
): Promise<ScoreEntry[]> {
  let query = supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .order('errors', { ascending: true })
    .order('duration_secs', { ascending: true })
    .limit(20);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  if (continent) {
    query = query.eq('continent', continent);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ScoreEntry[];
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/leaderboard.ts
git commit -m "feat: add leaderboard submit and fetch functions"
```

---

### Task 3: Add game timer to state

**Files:**
- Modify: `src/types/game.types.ts:9-24` (GameState interface)
- Modify: `src/hooks/useGameState.ts:9-28` (buildInitialState), `src/hooks/useGameState.ts:67-146` (reducer)

**Step 1: Add `startTime` to GameState**

In `src/types/game.types.ts`, add to the `GameState` interface after `skippedRegion`:

```ts
  startTime: number | null;
```

**Step 2: Initialize `startTime` as null in `buildInitialState`**

In `src/hooks/useGameState.ts`, add `startTime: null` to the return object in `buildInitialState` (after `skippedRegion: null`).

**Step 3: Set `startTime` on first action in reducer**

In the reducer's `SELECT_REGION` case (at the top, before any logic), add:

```ts
const withTimer = state.startTime === null ? { ...state, startTime: Date.now() } : state;
```

Then use `withTimer` instead of `state` throughout that case.

Do the same at the top of `skipCurrentRegion`:

```ts
const withTimer = state.startTime === null ? { ...state, startTime: Date.now() } : state;
```

Then use `withTimer` instead of `state` throughout `skipCurrentRegion`.

**Step 4: Expose `durationSecs` from hook**

In `useGameState`, after the `progress` computation, add:

```ts
const durationSecs = state.startTime !== null && state.gameOver
  ? Math.floor((Date.now() - state.startTime) / 1000)
  : 0;
```

Add `durationSecs` to the return object.

**Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/types/game.types.ts src/hooks/useGameState.ts
git commit -m "feat: add game timer tracking from first action to completion"
```

---

### Task 4: Add score submission to GameCompleteModal

**Files:**
- Modify: `src/components/GameCompleteModal.tsx`
- Modify: `src/components/GameContent.tsx:66-73`

**Step 1: Update GameCompleteModal**

Replace the entire `GameCompleteModal` component. New props: add `difficulty`, `continent`, `durationSecs`. Add local state for username input, submission status, and leaderboard open flag.

```tsx
import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { submitScore } from '../lib/leaderboard';

interface GameCompleteModalProps {
  open: boolean;
  score: number;
  errors: number;
  bestStreak: number;
  totalRegions: number;
  difficulty: string;
  continent: string;
  durationSecs: number;
  onPlayAgain: () => void;
}

const STORAGE_KEY = 'mappil_username';

const GameCompleteModal: FC<GameCompleteModalProps> = ({
  open,
  score,
  errors,
  bestStreak,
  totalRegions,
  difficulty,
  continent,
  durationSecs,
  onPlayAgain,
}) => {
  const [username, setUsername] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset submission state when modal opens for a new game
  useEffect(() => {
    if (open) {
      setSubmitState('idle');
      setErrorMsg('');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'],
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setErrorMsg('Username must be 3-20 characters');
      return;
    }

    localStorage.setItem(STORAGE_KEY, trimmed);
    setSubmitState('submitting');
    setErrorMsg('');

    try {
      await submitScore({
        username: trimmed,
        score,
        errors,
        best_streak: bestStreak,
        total_regions: totalRegions,
        difficulty,
        continent,
        duration_secs: durationSecs,
      });
      setSubmitState('submitted');
    } catch (e: any) {
      setSubmitState('error');
      setErrorMsg(e.message ?? 'Failed to submit score');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-sm w-[90vw] text-center shadow-2xl"
          >
            <h2 className="text-3xl font-black text-white mb-2">Game Complete!</h2>
            <p className="text-slate-400 text-sm mb-6">
              You explored {totalRegions} countries
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{score}</div>
                <div className="text-xs text-slate-400 uppercase">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{errors}</div>
                <div className="text-xs text-slate-400 uppercase">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{bestStreak}</div>
                <div className="text-xs text-slate-400 uppercase">Best Streak</div>
              </div>
            </div>

            {/* Score submission */}
            {submitState !== 'submitted' && (
              <div className="mb-6">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  maxLength={20}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 mb-2"
                />
                {errorMsg && (
                  <p className="text-red-400 text-xs mb-2">{errorMsg}</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitState === 'submitting'}
                  className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium text-sm hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
                >
                  {submitState === 'submitting' ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
            )}

            {submitState === 'submitted' && (
              <p className="text-emerald-400 text-sm mb-6">Score submitted!</p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameCompleteModal;
```

**Step 2: Wire new props in GameContent**

In `src/components/GameContent.tsx`, destructure `durationSecs` from `useGameState()` and pass new props to `GameCompleteModal`:

```tsx
<GameCompleteModal
  open={state.gameOver}
  score={state.score}
  errors={state.errors}
  bestStreak={state.bestStreak}
  totalRegions={totalRegions}
  difficulty={state.difficulty}
  continent={state.continent}
  durationSecs={durationSecs}
  onPlayAgain={resetGame}
/>
```

**Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/GameCompleteModal.tsx src/components/GameContent.tsx
git commit -m "feat: add score submission UI to game complete modal"
```

---

### Task 5: Create LeaderboardModal and LeaderboardButton

**Files:**
- Create: `src/components/LeaderboardModal.tsx`
- Create: `src/components/LeaderboardButton.tsx`
- Modify: `src/components/GameContent.tsx`

**Step 1: Create LeaderboardButton**

Create `src/components/LeaderboardButton.tsx`:

```tsx
import { FC } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardButtonProps {
  onClick: () => void;
}

const LeaderboardButton: FC<LeaderboardButtonProps> = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="fixed bottom-6 left-20 z-30 w-12 h-12 rounded-full bg-slate-900/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 hover:text-white shadow-xl"
    aria-label="Leaderboard"
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  </motion.button>
);

export default LeaderboardButton;
```

**Step 2: Create LeaderboardModal**

Create `src/components/LeaderboardModal.tsx`:

```tsx
import { FC, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Difficulty, ContinentFilter } from '../types/game.types';
import { fetchLeaderboard, ScoreEntry } from '../lib/leaderboard';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  difficulty: Difficulty;
  continent: ContinentFilter;
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const LeaderboardModal: FC<LeaderboardModalProps> = ({
  open,
  onClose,
  difficulty,
  continent,
}) => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>(difficulty);
  const [filterContinent, setFilterContinent] = useState<string>(continent);

  useEffect(() => {
    if (!open) return;
    setFilterDifficulty(difficulty);
    setFilterContinent(continent);
  }, [open, difficulty, continent]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(
      filterDifficulty || undefined,
      filterContinent === 'World' ? undefined : filterContinent || undefined,
    )
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setEntries([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, filterDifficulty, filterContinent]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[480px] sm:max-h-[80vh] z-50 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select
                  value={filterContinent}
                  onChange={(e) => setFilterContinent(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="World">World</option>
                  <option value="Africa">Africa</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">N. America</option>
                  <option value="South America">S. America</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>

            {/* Scores list */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loading && (
                <p className="text-slate-500 text-sm text-center py-8">Loading...</p>
              )}

              {!loading && entries.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">No scores yet. Be the first!</p>
              )}

              {!loading && entries.length > 0 && (
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-300/20 text-slate-300' :
                        i === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-700/50 text-slate-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{entry.username}</div>
                        <div className="text-xs text-slate-500">
                          {formatDuration(entry.duration_secs)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{entry.score}/{entry.total_regions}</div>
                        <div className="text-xs text-slate-500">{entry.errors} err</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardModal;
```

**Step 3: Wire into GameContent**

In `src/components/GameContent.tsx`, add imports and state:

```tsx
import LeaderboardButton from './LeaderboardButton';
import LeaderboardModal from './LeaderboardModal';
```

Add `const [leaderboardOpen, setLeaderboardOpen] = useState(false);` alongside the existing `settingsOpen` state.

Add after the `<SettingsButton>`:

```tsx
<LeaderboardButton onClick={() => setLeaderboardOpen(true)} />

<LeaderboardModal
  open={leaderboardOpen}
  onClose={() => setLeaderboardOpen(false)}
  difficulty={state.difficulty}
  continent={state.continent}
/>
```

**Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/LeaderboardModal.tsx src/components/LeaderboardButton.tsx src/components/GameContent.tsx
git commit -m "feat: add leaderboard modal and button"
```

---

### Task 6: Supabase setup instructions

**Files:**
- Create: `docs/SUPABASE_SETUP.md`

**Step 1: Write setup guide**

Create `docs/SUPABASE_SETUP.md` with the SQL to run in the Supabase SQL editor:

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

Then fill in `.env.local` with the Supabase project URL and anon key from the Supabase dashboard.

**Step 2: Commit**

```bash
git add docs/SUPABASE_SETUP.md
git commit -m "docs: add Supabase setup instructions"
```

---

### Task 7: Final build verification

**Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Build**

Run: `npm run build`
Expected: Successful production build

**Step 3: Manual test checklist**

- [ ] Play a full game → Game Complete modal shows score submission
- [ ] Enter username → click Submit Score → shows "Submitted"
- [ ] Username persisted in localStorage for next game
- [ ] Trophy button opens leaderboard modal
- [ ] Leaderboard filters by difficulty and continent
- [ ] Timer shows correct duration in leaderboard entries
- [ ] Play Again resets the game and submission state

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: online leaderboard with Supabase"
```
