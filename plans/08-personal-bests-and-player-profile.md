# Personal Bests And Player Profile Plan

**Recommendation:** Build a lightweight player profile that starts local-first and centers on personal improvement: best scores, best streaks, fastest clears, recent runs, and mastery progress by ruleset.

**Why this approach:** Mappil currently remembers only one piece of player identity locally: the username stored by `src/components/GameCompleteModal.tsx`. Everything else resets per session except what is visible on the global leaderboard. That means the app celebrates public competition more than private progress, even though personal improvement is one of the strongest reasons to replay a skill game and one of the best ways to keep weaker players engaged.

**Primary v1 goal:** Give every player a persistent sense of “my progress” even before a full account system exists.

**Scope rule for v1:** Keep the first version local-first, comprehensible, and useful. Do not block on authentication or social features.

---

## 1. Current Gap Snapshot

### What exists today
- `GameCompleteModal.tsx` stores `mappil_username` in localStorage
- `src/lib/leaderboard.ts` supports public score submission and retrieval
- the live game tracks run-level stats such as score, errors, best streak, and duration

### What is missing
- no personal bests by ruleset
- no persistent player profile
- no run history
- no mastery breakdown
- no “new best” comparisons at the end of a run
- no stable local player id separate from display username

### Likely consequence
Players who are not chasing the global leaderboard have little visible proof that they are improving over time.

---

## 2. Recommendation

### Chosen implementation
Ship a player profile in two layers:
- local-first personal progress storage
- optional cloud sync later through Supabase

### Why local-first
This app does not currently have a user account system. Local-first storage lets Mappil add meaningful persistent progress quickly without blocking on auth, profile merging, or cross-device identity.

### What the profile should optimize for
The profile should answer:
- what am I best at
- how have I improved
- what should I try next

Not merely:
- what username did I enter once

---

## 3. Profile Design

### A. Stable local player identity

#### [NEW] `src/lib/playerProfile.ts`

Generate and persist a stable local player id separate from the chosen username.

Recommended keys:
- `mappil_player_id`
- `mappil_username`
- `mappil_profile_v1`

This lets the app connect local run history to a durable client-side identity even if the display name changes later.

### B. Profile summary

The profile summary should include:
- username
- total runs played
- total regions found
- cumulative play time
- best overall streak
- favorite ruleset or most-played ruleset
- recent activity summary

### C. Ruleset-specific personal bests

Track bests by a normalized ruleset key containing:
- continent
- difficulty
- game mode
- challenge mode if present later
- map pack if multiple map datasets are added later

Recommended personal bests:
- highest score
- fewest errors
- fastest perfect run
- best streak
- longest no-skip streak or best no-skip completion

### D. Run history

Store recent runs with enough detail to show:
- date and time
- ruleset
- score
- errors
- best streak
- duration
- whether it was a personal best

Cap stored history to a reasonable recent limit in v1.

---

## 4. Technical Design

### A. Profile types

#### [NEW] `src/types/profile.types.ts`

Recommended model split:

```ts
interface PlayerProfile {
  playerId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  summary: PlayerSummary;
  personalBests: Record<string, RulesetBest>;
  recentRuns: RunRecord[];
}
```

Keep the model explicit rather than burying it in ad hoc localStorage blobs.

### B. Profile storage helpers

#### [NEW] `src/lib/playerProfileStorage.ts`

Responsibilities:
- load profile
- initialize a default profile
- update username
- append a completed run
- recompute personal bests and summary stats
- persist safely

### C. Profile hook

#### [NEW] `src/hooks/usePlayerProfile.ts`

Responsibilities:
- expose the current profile
- expose mutations like `recordRun`, `updateUsername`, and `clearProfile`
- memoize derived profile views for UI

### D. Completion integration

#### [MODIFY] `src/components/GameCompleteModal.tsx`

At the end of every run:
- compare results against the player’s ruleset-specific bests
- show `New Best` callouts
- record the run locally
- update username in the profile store if it changed

The completion screen should become the primary moment where personal progress is made visible.

### E. Leaderboard integration

#### [MODIFY] `src/lib/leaderboard.ts`

When scores are submitted, include the local player id if useful for future cloud syncing or nearby-player context.

This is optional for the first pass, but it is a good forward-compatible field to add early.

---

## 5. UI Surfaces

### A. Completion screen

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Add:
- `New Best Score`
- `Fastest Clear`
- `Best Streak Tied`
- comparison against previous personal best for the same ruleset

This is the highest-value place to surface progress because it arrives at the emotional peak of a run.

### B. Profile entry point

#### [NEW] `src/components/ProfileButton.tsx`
#### [NEW] `src/components/ProfilePanel.tsx`

Add a lightweight profile surface with:
- summary stats
- recent personal bests
- recent runs
- favorite modes or continents

This should feel more like a progress journal than a heavy account dashboard.

### C. Settings integration

#### [MODIFY] `src/components/SettingsPanel.tsx`

Settings should expose:
- current username
- view profile
- reset or clear local progress with a guarded confirmation

### D. HUD and leaderboard hints
Add small non-intrusive hints such as:
- “PB pace” indicators later
- “Your best: 8/10” in the leaderboard filter view

Do not overload the HUD in the first release.

---

## 6. Mastery Tracking

### A. Educational mastery layer
The profile should not stop at abstract score records.

Recommended mastery concepts:
- first-try correctness by region
- regions frequently missed
- continent-specific completion comfort
- consistency over recent runs

### B. Ruleset mastery cards
Show profile cards such as:
- `Europe Quick`
- `World Full Hard`
- `Africa Easy`

Each card can summarize:
- best score
- fastest clean clear
- total runs
- mastery tier

### C. Relationship to achievements
Keep the profile model compatible with later achievement work from the gamification plan, but do not block this plan on a full achievements system.

---

## 7. Cloud Sync Direction

### A. Local-first v1
The first implementation should work entirely without login.

### B. Optional Supabase-backed v2
Later, sync selected profile fields to Supabase:
- username
- summary stats
- personal bests
- key run milestones

Recommended cloud tables:
- `player_profiles`
- `player_personal_bests`
- `player_run_history`

### C. Merge strategy
If cloud sync is added later:
- local profile remains the source of truth until linked
- merge by local `player_id`
- prefer best-of-both-worlds logic for PBs

Avoid building this merge complexity into v1.

---

## 8. Data Retention And Privacy

### Keep local storage bounded
Do not store unlimited run history.

Recommended v1 guardrails:
- cap recent runs
- store aggregates rather than huge raw event logs
- allow users to reset local profile data

### Be clear about scope
If there is no login, make sure the UI implies:
- progress is on this device
- cloud sync is not guaranteed yet

This avoids false expectations.

---

## 9. Analytics And Measurement

### Track profile usage
Add events for:
- profile opened
- personal best achieved
- replay started after a PB comparison
- profile reset

### Primary success metrics
Track:
- percentage of runs that generate a visible PB comparison
- replay rate after a `New Best` moment
- profile open rate
- returning player rate after personal progress surfaces ship

---

## 10. Implementation Order

1. Add profile types and storage helpers.
2. Generate a stable local player id and migrate username handling into the profile layer.
3. Record completed runs and recompute ruleset-specific personal bests.
4. Surface PB comparisons in `GameCompleteModal.tsx`.
5. Add a lightweight profile panel and settings integration.
6. Add mastery summaries and richer progress cards.
7. Consider optional Supabase sync only after the local-first version proves useful.

---

## 11. Verification

### Manual checks
- the app creates a stable local player id once
- username changes persist across runs
- a completed run updates profile summary and history
- personal bests are tracked separately per ruleset
- the completion screen correctly detects new and tied personal bests
- local profile reset works without breaking normal play

### Regression focus
Pay particular attention to:
- corrupted local storage handling
- PB comparisons using the wrong ruleset key
- profile writes firing multiple times on one completed run
- performance issues from storing too much history in local storage

---

## 12. Risks And Mitigations

### Risk: the profile becomes too heavy for a small game
Mitigation: keep v1 centered on PBs, summary stats, and recent runs, not a full social account system.

### Risk: local-only progress disappoints players who switch devices
Mitigation: state clearly that profile progress is device-local in v1 and keep the model cloud-ready.

### Risk: progress surfaces overwhelm the completion flow
Mitigation: prioritize one or two high-signal PB callouts and a compact summary rather than a dense dashboard.

### Risk: ruleset identity gets messy as more modes are added
Mitigation: define one normalized ruleset key early and reuse it everywhere.

---

## 13. Exit Criteria

This plan is complete when:
- every player has a persistent local profile
- personal bests are tracked per ruleset
- run history and summary stats survive refreshes
- the completion screen clearly shows personal improvement
- players have a visible reason to chase their own progress, not only the public leaderboard
