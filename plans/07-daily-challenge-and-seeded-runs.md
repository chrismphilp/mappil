# Daily Challenge And Seeded Runs Plan

**Recommendation:** Add a deterministic seeded-run system that can power a shared daily challenge, fair challenge-specific leaderboards, and repeatable challenge links without replacing the current free-play modes.

**Why this approach:** Mappil’s current run generation in `src/hooks/useGameState.ts` relies on `Math.random()` and local shuffle order. That is fine for ordinary quick play, but it is not good enough for a shared challenge experience because the exact region sequence, first prompt, and quick-play subset differ per user. A daily challenge needs all players to see the same run under the same rules.

**Primary v1 goal:** Ship one shared daily challenge per day that is identical for every player and has its own leaderboard.

**Scope rule for v1:** Start with one deterministic daily challenge flow. Do not block on broader live-ops tooling or a full challenge CMS.

---

## 1. Current Gap Snapshot

### What exists today
- `useGameState.ts` randomly picks and shuffles regions with `Math.random()`
- quick play uses a random 10-region slice from the available pool
- `src/lib/leaderboard.ts` stores and filters scores only by `difficulty`, `continent`, and `game_mode`
- there is no ruleset id, run seed, or challenge identifier in the score model

### What is missing
- deterministic run generation
- a challenge id that can be compared fairly across players
- a daily challenge entry point in the UI
- a challenge-specific leaderboard
- any concept of “today’s run”

### Likely consequence
Any daily challenge added on top of the current logic would be socially weak or unfair because players would not actually be playing the same run.

---

## 2. Recommendation

### Chosen implementation
Introduce a seeded-run layer that can generate identical runs from:
- a stable dataset id
- a stable ruleset
- a seed string

Then use that seeded-run layer to create:
- one daily challenge keyed by date
- a dedicated daily challenge leaderboard
- optional shareable challenge URLs later

### Why deterministic seeding matters
The daily challenge should mean:
- same region pool
- same order
- same scoring rules
- same mode

Not merely “some run on the same day.”

### Why not rebuild all runs around seeds immediately
Do not convert every normal session into a strict seeded challenge. Keep free play flexible. Add determinism where fairness and repeatability matter.

---

## 3. Daily Challenge Product Design

### A. Daily challenge definition
Each challenge should have:
- a canonical challenge id
- a seed
- a dataset or content pack
- a difficulty
- a continent or filter
- a game mode
- optional modifier

Recommended challenge id format:

```text
daily:2026-03-24
```

Use a date string as part of the canonical id for clarity and auditability.

### B. Daily challenge timing
For fairness, use a single global rollover time.

Recommended v1 rule:
- new challenge starts at `00:00 UTC`

This is simpler than local-time rollovers and avoids ambiguity across players.

### C. Challenge surface

#### [NEW] `src/components/DailyChallengeCard.tsx`

Expose the daily challenge in:
- the home or first-view shell once that exists
- settings or a challenge entry point
- the completion screen when a player finishes a normal run

The challenge needs to be easy to find without hiding normal play.

---

## 4. Technical Design

### A. Seeded random generator

#### [NEW] `src/lib/seededRandom.ts`

Add a small deterministic PRNG helper rather than relying on `Math.random()`.

Responsibilities:
- derive a numeric seed from a string
- generate repeatable pseudo-random values
- provide deterministic `shuffle` and `pick` helpers

Keep this internal and dependency-light. A tiny utility is enough for v1.

### B. Seeded run config

#### [MODIFY] `src/hooks/useGameState.ts`

Refactor run initialization so it can work in two modes:
- free play: current random behavior
- seeded challenge: deterministic behavior from an explicit config

Recommended configuration shape:

```ts
interface RunConfig {
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  seed?: string;
  isDailyChallenge?: boolean;
}
```

### C. Deterministic quick-play subset
For seeded quick play:
- derive the region subset from the seeded shuffle
- derive the first prompt from the same seeded order
- never use plain `Math.random()` once a seed exists

### D. Daily challenge resolver

#### [NEW] `src/lib/dailyChallenge.ts`

Responsibilities:
- resolve the active challenge for the current UTC date
- return its config and seed
- expose helpers for challenge labels and shareable links

Recommended v1 generation strategy:
- derive rules from the date
- rotate through continents and difficulty bands
- keep rules simple and transparent

Example direction:
- Mondays: Europe Quick Easy
- Tuesdays: World Quick Medium
- Wednesdays: Africa Full Easy

Keep the pattern varied but not chaotic.

### E. Game shell integration

#### [MODIFY] `src/components/GameContent.tsx`

Allow GameContent to start either:
- a normal run
- a daily challenge run with a passed config

This should remain one game shell. The challenge system should inject config, not fork the gameplay path.

---

## 5. Leaderboard Changes

### A. Score model expansion

#### [MODIFY] `src/lib/leaderboard.ts`

Extend score submission and query filtering to include:
- `challenge_id`
- `seed`
- `map_pack` or dataset id
- optional modifier or challenge mode
- a marker for `is_daily_challenge`

### B. Data storage direction

Recommended options:
- extend the existing `scores` table with challenge metadata, or
- add a separate `challenge_scores` table if score semantics diverge later

For v1, extending the existing table is likely simpler if the schema stays coherent.

### C. Daily leaderboard behavior

The daily leaderboard should:
- show only scores for the active challenge id
- rank players under the same scoring rules
- expose the player’s own entry after submission

Do not mix daily challenge results into the generic all-time board.

---

## 6. UI And UX Flow

### A. Challenge entry points
Add entry points such as:
- `Play Daily Challenge`
- `Today’s Challenge`
- `Try the Shared Daily Run`

### B. In-run labeling

#### [MODIFY] `src/components/HUD.tsx`

When the player is in a daily challenge:
- show a subtle label in the HUD
- make the challenge feel distinct from ordinary quick play

### C. Completion screen treatment

#### [MODIFY] `src/components/GameCompleteModal.tsx`

When a daily challenge run ends:
- show the challenge id or human-readable daily label
- show whether the score was submitted to the daily leaderboard
- provide a CTA to view the daily board
- provide a CTA back to normal play

### D. Replay rules
Decide explicitly whether players can replay the daily challenge multiple times.

Recommended v1:
- allow replay
- record every valid score
- rank using the best score per player per challenge in the leaderboard query

This preserves fun and experimentation while preventing board spam from dominating display.

---

## 7. Seeded Runs Beyond Daily Challenge

### A. Shareable challenge links
Once seeded runs exist, Mappil can support links such as:

```text
/play?challenge=weekly-europe-sprint
/play?seed=abc123&continent=europe&difficulty=medium&mode=quick
```

### B. Weekly spotlight reuse
The same seeded-run infrastructure can later power:
- weekly challenges
- featured challenge cards
- friend-shared custom runs

### C. Testing benefit
Seeded runs also help QA because the same session can be reproduced reliably.

---

## 8. Analytics And Measurement

### Track challenge-specific events
Add events for:
- daily challenge viewed
- daily challenge started
- daily challenge completed
- daily challenge replayed
- daily leaderboard opened
- daily score submitted

### Primary success metrics
Track:
- daily challenge participation rate
- daily challenge completion rate
- repeat runs per challenge day
- next-day return rate
- percentage of players who open the daily leaderboard

---

## 9. Implementation Order

1. Add seeded random utilities.
2. Refactor run generation to support deterministic config.
3. Add daily challenge resolver keyed by exact UTC date.
4. Extend score submission schema and leaderboard filtering with challenge metadata.
5. Add daily challenge entry UI and HUD labeling.
6. Add daily challenge completion and leaderboard flows.
7. Instrument participation and replay analytics.

---

## 10. Verification

### Manual checks
- two clients loading the same challenge id receive the same region sequence
- the challenge rollover changes at `00:00 UTC`
- replaying a given challenge keeps the exact same run order
- the daily leaderboard shows only entries for that exact challenge id
- normal quick play still remains random and unaffected

### Regression focus
Pay particular attention to:
- accidental use of `Math.random()` in seeded paths
- challenge metadata missing from score submission
- ambiguity around challenge day boundaries
- daily challenge UI becoming too dominant over standard play

---

## 11. Risks And Mitigations

### Risk: seeded logic makes the game-state hook more complex
Mitigation: isolate deterministic generation helpers and keep run config explicit.

### Risk: daily challenges feel repetitive
Mitigation: rotate continent, mode, and difficulty intentionally and introduce modifiers later only after the base system works.

### Risk: leaderboard fairness is undermined by repeated submissions
Mitigation: store all attempts if useful, but display only the best valid result per player per challenge.

### Risk: timezone confusion around “today”
Mitigation: define the daily challenge against exact UTC date strings and reflect that consistently in code and copy.

---

## 12. Exit Criteria

This plan is complete when:
- Mappil can generate deterministic seeded runs
- a single shared daily challenge exists each day
- all players on a given day receive the same run
- daily challenge results are separated into a fair leaderboard
- the daily challenge becomes a clear reason to return
