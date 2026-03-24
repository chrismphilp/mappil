# Gamification And Replayability Plan

**Recommendation:** Build Mappil's replayability around improving the loops that already exist: make each run feel more expressive, make the end-of-run flow smarter, and add local-first progress systems that reward mastery without turning the game into a grind.

**Why this approach:** The current product is no longer starting from zero. It already has core run stats, quick/full modes, continent filters, seeded runs, a daily challenge flow, friend challenges, feedback overlays, challenge sharing, and leaderboard submission. What it still lacks is a stronger reason to immediately run again, clearer proof of personal improvement, and a few foundational data models that make future challenge modes and progression systems coherent.

**Primary goal:** Increase repeat runs per session and repeat visits over time by improving the quality of existing loops before adding more systems.

**Scope rule for v1:** Build on the shipped daily/friend challenge infrastructure. Do not add heavy live-ops tooling, multiple new modifiers at once, or progression systems that require account auth.

---

## 1. Current Product Baseline

### What already exists
- point scoring for correct answers
- error tracking
- current streak and best streak
- quick play and full game modes
- continent filters
- visual feedback for correct, wrong, and skipped answers
- end-of-run summary and leaderboard submission
- deterministic seeded runs for challenge flows
- a shared daily challenge entry point and daily leaderboard mode
- friend challenge creation, challenge links, and rematch-style sharing

### What still feels thin
- score is still mostly linear, so strong play does not feel sufficiently different from merely finishing
- the completion modal is still mostly a score-submission form with one generic replay action
- there is no stable local player identity or local-first personal best layer
- leaderboard behavior is attempt-based, not best-attempt-per-player
- challenge variety is still limited; daily and friend challenge are wrappers around the same underlying free-play rules
- there is no analytics sink defined for measuring whether replay loops actually improve retention

### Likely consequence
Mappil already supports challenge entry points, but the reward loop around them is still shallow. Players can try a daily or friend run, yet the product does not do enough to turn one completed run into a second run or a longer-term habit.

---

## 2. Role Of This Plan

This document is an umbrella strategy and sequencing plan, not a replacement for the more focused implementation plans that already exist.

Related plans:
- [Daily Challenge And Seeded Runs](./completed/07-daily-challenge-and-seeded-runs.md)
- [Personal Bests And Player Profile](./08-personal-bests-and-player-profile.md)
- [Additional Map Modes And Content Expansion](./09-additional-map-modes-and-content-expansion.md)

This plan should coordinate:
- what to improve first
- which prerequisites unlock later systems
- which already-shipped features should be improved instead of rebuilt

---

## 3. Product Direction

### Chosen design direction
Make Mappil feel like:
- a fast skill game
- a personal mastery tracker
- a lightweight shared challenge habit

### Core principle
Replayability should come from:
- chasing better execution
- seeing personal improvement clearly
- trying a small number of meaningful constraints

Not from:
- manipulative streak penalties
- intrusive notifications
- currencies, loot systems, or monetization hooks

---

## 4. Phase 0: Cross-Cutting Prerequisites

These are the foundations that should move ahead of most new gamification features.

### A. Canonical ruleset identity

#### [NEW] ruleset identity helper

Create one normalized ruleset identifier used everywhere the product needs to compare runs fairly.

Recommended fields:
- difficulty
- continent
- game mode
- challenge source such as free play, daily, or friend
- gameplay modifier if present
- challenge id when applicable

This identifier should back:
- personal best storage
- leaderboard partitioning
- achievement conditions
- replay CTA generation
- analytics

### B. Stable local player identity

#### [NEW] local player id

Persist a stable local `playerId` separate from the display username.

Use it to support:
- local profile history
- best-attempt comparisons
- future nearby-player or cloud-sync features

Do not rely on username alone for identity-sensitive features.

### C. Canonical score model and breakdown

#### [MODIFY] `src/hooks/game/useGameState.ts`
#### [MODIFY] `src/types/game.types.ts`

Before adding more bonuses or modifiers, define a structured score model.

Recommended direction:
- track base score separately from bonus score
- track why points were earned
- store enough breakdown data to explain the final score in the completion modal

Guardrails:
- prefer additive bonuses over opaque multiplicative stacks
- cap streak-related bonuses
- ensure players can understand why two runs ranked differently

### D. Best-attempt policy

#### [MODIFY] leaderboard and profile surfaces

Decide explicitly how Mappil treats repeated attempts.

Recommended v1 rule:
- store all attempts if useful
- display only the best visible attempt per `playerId` per ruleset or challenge in competitive surfaces

This matters for:
- daily challenge fairness
- future personal-nearby boards
- friend challenge comparisons

### E. Analytics sink decision

#### [DECIDE] analytics destination before instrumentation

Do not add event calls until there is a defined place for them to go.

Choose one of:
- a lightweight analytics provider
- a custom event endpoint
- an explicit defer decision for analytics work

Without this decision, instrumentation tasks create noise without learning value.

---

## 5. Layer 1: Make Each Run Feel Better

### A. Richer scoring

#### [MODIFY] `src/hooks/game/useGameState.ts`

Expand scoring beyond flat correctness, but keep it legible.

Recommended additions:
- first-try bonus
- capped streak bonus
- reduced reward after one or more misses on the same target
- no-skip end bonus
- flawless-run end bonus

Avoid:
- large hidden multipliers
- time bonuses that are not surfaced clearly
- bonus rules that make the leaderboard feel arbitrary

### B. Bigger streak states

#### [MODIFY] `src/components/game/HUD.tsx`
#### [MODIFY] `src/components/game/FeedbackOverlay.tsx`

Turn streaks into visible game states rather than just one stat.

Recommended thresholds:
- warm
- hot
- on fire
- legendary

Each threshold can add:
- stronger HUD treatment
- richer overlay copy
- more pronounced particles or motion

### C. Better answer feedback

#### [MODIFY] `src/components/game/FeedbackOverlay.tsx`

Add more expressive but still fast feedback:
- rotating positive copy during streak states
- special feedback for first-try answers
- special feedback for third-attempt saves
- clearer and less harsh skip messaging

Keep the game snappy. Feedback should support pace, not interrupt it.

### D. Stronger completion ceremony

#### [MODIFY] `src/components/game/GameCompleteModal.tsx`

The end-of-run flow should celebrate the run first and ask for submission second.

Add:
- run grade or rank
- score breakdown
- highlight callouts such as `New Best Score` or `Best Streak Tied`
- replay CTA based on what the player should do next
- challenge-aware CTAs for daily and friend runs

---

## 6. Layer 2: Immediate Replay Hooks

### A. Local-first personal best chasing

#### [FOLLOW] [Personal Bests And Player Profile](./08-personal-bests-and-player-profile.md)

Persist personal records by normalized ruleset:
- highest score
- fewest errors
- fastest clean clear
- best streak

Expose them in:
- `GameCompleteModal`
- leaderboard context hints
- a lightweight profile or settings surface

### B. Smart replay CTAs

#### [MODIFY] `src/components/game/GameCompleteModal.tsx`

Replace the single generic replay button with contextual actions such as:
- `Beat your best`
- `Run it back`
- `Try Hard Mode`
- `Play today's challenge`
- `Rematch this friend challenge`

These should be generated from:
- the player's last result
- their local best for the ruleset
- nearby ruleset variants
- whether the run was free play, daily, or friend challenge

### C. One immediate next challenge suggestion

#### [NEW] inline next-challenge suggestion

At the end of a run, propose one next step:
- same ruleset with fewer errors
- a harder difficulty
- a full game instead of quick play
- the daily challenge if they just played free play

Keep this as a lightweight inline surface inside the completion flow. Do not make players navigate a second menu.

### D. Only one new modifier in the first pass

#### [FOLLOW] [Additional Map Modes And Content Expansion](./09-additional-map-modes-and-content-expansion.md)

Do not ship several new gameplay variants at once.

Recommended first modifier:
- `Streak Rush`

Why this first:
- it builds on the scoring model rather than requiring heavy new game-over logic
- it creates replay variety without rewriting skip, lives, or timer systems

Defer until later:
- `Time Attack`
- `Survival`
- `No Skip` if it requires breaking the current third-strike skip flow

---

## 7. Improve Existing Daily And Social Loops

### A. Daily challenge improvements

#### [FOLLOW] [Daily Challenge And Seeded Runs](./completed/07-daily-challenge-and-seeded-runs.md)

The daily challenge already exists. Improve it instead of rebuilding it.

Recommended improvements:
- surface the player's best daily result
- show a clearer daily completion callout in the end screen
- add a direct CTA to view the daily leaderboard after submission
- consider rotating rules over time instead of keeping the same fixed daily rules forever

### B. Friend challenge improvements

#### [MODIFY] friend challenge completion and share flow

Improve the current friend loop with:
- clearer rematch language
- result sharing that emphasizes score, streak, and ruleset
- best-attempt comparison between the sharer and recipient once player identity exists

### C. Better leaderboard structure

#### [MODIFY] `src/lib/leaderboard.ts`
#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Improve the leaderboard around existing contexts:
- free play
- daily challenge
- friend challenge
- modifier-specific boards later

Also add:
- the player's own visible position even if outside the top list
- `your best` or `your rank` context once local player identity exists

---

## 8. Long-Term Progression

These systems should come after personal bests and score explainability are working well.

### A. Achievement system

#### [NEW] achievements model

Introduce achievements that reward quality and variety:
- first full clear
- perfect quick play
- continent mastery milestones
- long streak milestones
- modifier-specific wins later

Keep the list small and readable in the first version.

### B. Mastery collection

#### [NEW] mastery tracking

Track learning-oriented progress over time:
- first-try accuracy by region
- regions frequently missed
- continent completion comfort
- mastery tiers

This is one of the strongest fits with Mappil's educational angle.

### C. Player level or title is optional, not foundational

#### [OPTIONAL] lightweight progression profile

Only add a level or title system if:
- achievements are landing well
- profile progress already feels meaningful

Do not force an XP system into v1 just because it is common in games.

### D. Soft return cadence

#### [LATER] return-play system

After daily challenge and profile basics are solid, consider:
- daily challenge streak
- played-this-week goals
- complete-three-continents style weekly goals

Reward consistency without harsh resets or guilt mechanics.

---

## 9. Revised Release Order

### Phase 0: Foundations
- canonical ruleset identity
- local player id
- score breakdown model
- best-attempt policy
- analytics sink decision

### Phase 1: Stronger run juice
- richer scoring
- streak states
- better feedback
- improved completion ceremony
- personal best tracking

### Phase 2: Replay and challenge quality
- smart replay CTA
- one next-challenge suggestion
- one new modifier built on the score model
- daily and friend challenge improvements
- leaderboard best-attempt behavior

### Phase 3: Long-term progression
- achievements
- mastery tracking
- optional profile title or level
- soft cadence systems

This keeps the first release focused on the parts most likely to increase replays quickly while avoiding duplicated work on systems that are already present.

---

## 10. Verification

### Product checks
- players can explain why a run scored highly
- the completion screen gives at least one compelling next action
- local personal improvement is visible after the first few sessions
- daily and friend challenge flows feel more rewarding without becoming noisy

### Success signals
- runs per session
- replay CTA click-through rate
- percentage of players who start a second run
- daily challenge participation and repeat participation
- personal-best earn rate

### UX checks
- new feedback remains fast
- the game still feels readable on first use
- added progression surfaces do not bury the core quiz

---

## 11. Risks And Mitigations

### Risk: too many systems dilute the core quiz
Mitigation: keep v1 focused on scoring clarity, replay prompts, and personal bests before broader progression layers.

### Risk: challenge variants sprawl before the rules are modeled well
Mitigation: ship one modifier only after the ruleset and scoring foundations exist.

### Risk: social comparison discourages weaker players
Mitigation: emphasize personal bests and mastery progress alongside public boards.

### Risk: instrumentation is started without a measurement plan
Mitigation: choose an analytics sink first or defer analytics work explicitly.

---

## 12. Exit Criteria

This plan is complete when:
- each run has clearer and more expressive scoring
- the end-of-run flow gives a context-aware reason to replay
- Mappil shows personal improvement across sessions
- existing daily and friend challenge loops feel stronger than they do today
- the game feels more replayable without becoming cluttered or grindy
