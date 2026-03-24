# Gamification And Replayability Plan

**Recommendation:** Build Mappil’s game feel around three layered loops: a juicier moment-to-moment run, stronger post-run replay hooks, and lightweight long-term progression that rewards mastery without turning the product into a grind.

**Why this approach:** The current experience already has a solid base in `src/hooks/useGameState.ts`: score, errors, streaks, quick/full modes, continent filters, feedback overlays, confetti, and leaderboard submission. What it lacks is a deeper reason to immediately start another run, experiment with different rule sets, or keep returning over days and weeks.

**Primary goal:** Make each run feel more exciting while giving players clear reasons to replay right away and come back later.

**Scope rule for v1:** Prioritize replay loops, variety, and positive progression. Avoid manipulative retention mechanics, hard monetization hooks, or complex currencies.

---

## 1. Current Baseline

### What Mappil already has
- point scoring for correct answers
- error tracking
- current streak and best streak
- quick play and full game modes
- continent filters
- visual feedback for correct, wrong, and skipped answers
- end-of-run summary and leaderboard submission

### What feels thin today
- score is mostly linear, so great play does not feel much different from merely correct play
- a run ends without a strong “one more game” prompt beyond `Play Again`
- the leaderboard is useful but narrow; it does not create daily reasons to return
- there is no persistent player progression besides remembered username
- there are no achievements, quests, unlocks, personal best surfaces, or rotating challenges
- there is limited mode variety beyond quick vs full and difficulty/continent selection

### Likely consequence
The game can be satisfying once, but replayability depends too heavily on intrinsic geography interest rather than product-driven reward loops.

---

## 2. Product Direction

### Chosen design direction
Make Mappil feel like:
- a fast skill game
- a mastery tracker
- a daily challenge habit

The experience should reward improvement and curiosity, not repetition for repetition’s sake.

### Core principle
Replayability should come from:
- chasing better execution
- trying different constraints
- building visible mastery over time

Not from artificial timers, intrusive notifications, or pay-to-progress systems.

---

## 3. Layer 1: Make Each Run More Fun

### A. Richer scoring

#### [MODIFY] `src/hooks/useGameState.ts`

Expand scoring beyond flat correctness.

Recommended additions:
- streak bonus
- speed bonus
- no-skip bonus
- perfect-region bonus for getting a region without errors
- flawless-run bonus at game end

Example scoring direction:
- base points for a correct answer
- multiplicative or additive bonus for consecutive perfect answers
- reduced reward when a correct answer follows one or more misses on the same target

This makes strong play feel meaningfully different from barely passing.

### B. Bigger streak states

#### [MODIFY] `src/components/HUD.tsx`
#### [MODIFY] `src/components/FeedbackOverlay.tsx`

Turn streaks into more visible game states, not just a number.

Recommended thresholds:
- warm streak
- hot streak
- on fire
- legendary

Each threshold can introduce:
- stronger HUD treatment
- slightly richer feedback copy
- more celebratory particles or motion

### C. Better answer feedback

#### [MODIFY] `src/components/FeedbackOverlay.tsx`

Add more playful, varied micro-feedback:
- rotating positive copy for streak moments
- stronger “clutch” feedback for last-attempt saves
- gentler but clearer failure feedback on skips

Keep it fast. The game should stay snappy.

### D. Stronger completion ceremony

#### [MODIFY] `src/components/GameCompleteModal.tsx`

The end-of-run screen should feel like a reward moment, not just a score form.

Add:
- run grade or rank
- breakdown of earned bonuses
- highlight callout such as `New Best Streak`
- clear rematch CTA
- clear “try a harder/faster variant” CTA

---

## 4. Layer 2: Immediate Replay Hooks

### A. Personal best chasing

#### [NEW] local run-history storage

Persist personal records locally first:
- highest score by ruleset
- lowest errors by ruleset
- fastest perfect run by ruleset
- best streak by ruleset

Recommended ruleset key:
- continent
- difficulty
- game mode
- challenge mode if added later

Expose this in:
- `GameCompleteModal`
- leaderboard entry surfaces
- settings panel or a small profile panel

### B. “One more run” prompts

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Replace the single generic replay button with high-context replay actions such as:
- `Beat your best`
- `Run it back`
- `Try Hard Mode`
- `Play Europe Quick`

These should be generated from the player’s last performance and nearby difficulty or mode options.

### C. Near-term challenge cards

#### [NEW] `src/components/NextChallengeCard.tsx`

At the end of a run, propose one immediate next challenge:
- same ruleset, fewer errors
- harder difficulty
- full game instead of quick play
- a different continent
- no-skip challenge

This should be one tap into the next run, not a separate menu hunt.

### D. Run variety

#### [MODIFY] `src/types/game.types.ts`
#### [MODIFY] `src/hooks/useGameState.ts`

Add a few high-signal challenge variants rather than many weak ones.

Recommended first set:
- `No Skip`
- `Time Attack`
- `Survival` or limited-lives mode
- `Streak Rush` where combo play matters more

Do not ship too many variants at once. Three or four good ones are enough for v1.

---

## 5. Layer 3: Long-Term Progression

### A. Achievement system

#### [NEW] achievements model

Introduce achievements that reward different kinds of play:
- first full clear
- perfect quick play
- continent mastery
- long streak milestones
- no-skip wins
- high-speed clears

Keep achievements concrete and readable. Avoid hidden grind goals in the first pass.

### B. Mastery collection

#### [NEW] player mastery tracking

Track learning and mastery over time, not just raw scores.

Recommended concepts:
- regions answered correctly on first try
- regions frequently missed
- continent completion percentages
- mastery tiers such as bronze, silver, gold

This fits Mappil’s educational value while giving return visits a purpose.

### C. Player level or title

#### [NEW] lightweight progression profile

Add a simple profile progression layer based on earned XP or completed achievements.

Keep it lightweight:
- level number
- title
- optional badge or accent unlock

Avoid complex currencies, shops, or multi-resource systems.

### D. Streak cadence outside a single run

#### [NEW] return-play system

Add a soft return loop:
- daily challenge streak
- “played today” streak
- weekly target such as completing three different continent runs

This should reward consistency without punishing missed days too harshly.

---

## 6. Daily And Rotating Content

### A. Daily challenge

#### [NEW] seeded daily challenge system

Create one shared daily run with fixed rules for everyone on a given date.

Recommended properties:
- deterministic seed
- one continent or world ruleset
- fixed difficulty and mode
- dedicated daily leaderboard

This creates a reason to return that is social and comparable.

### B. Weekly spotlight

Add a simple weekly featured challenge such as:
- `Africa Accuracy Week`
- `Hard Mode Sprint`
- `No Skip World Quick`

This can initially be a configured ruleset, not a heavy live-ops system.

### C. Rotating modifiers

Use occasional modifiers to keep familiar content fresh:
- shorter timer windows
- streak-heavy scoring
- sudden-death mistakes
- reverse order or themed region sets if supported later

Do not let modifiers overwhelm the core learning loop.

---

## 7. Social And Competitive Loops

### A. Better leaderboard structure

#### [MODIFY] `src/lib/leaderboard.ts`
#### [MODIFY] `src/components/LeaderboardModal.tsx`

Split leaderboards by meaningful contexts:
- all-time
- daily
- friends or personal-nearby if added later
- challenge-mode specific boards

Also surface the player’s position even if they are outside the visible top list.

### B. Shareable results

#### [NEW] result share surface

Add a share action from the completion screen with a compact summary:
- score
- difficulty
- continent
- streak or perfect status
- daily challenge result if relevant

This supports discoverability and replay without requiring a full social graph.

### C. Friendly rivalry

Longer term, consider lightweight friend comparisons:
- “beat your best friend’s Europe run”
- “you moved up 4 places today”

Do not block the first gamification release on account systems for this.

---

## 8. Technical Design

### A. Data model additions

Recommended new storage concepts:
- `run_history`
- `player_profiles`
- `player_achievements`
- `daily_challenges`
- `daily_challenge_attempts`

Use local storage for the first personal-best layer if you want fast iteration, then move selected data to Supabase when cross-device persistence matters.

### B. Ruleset identity

Create a normalized ruleset identifier that includes:
- difficulty
- continent
- game mode
- challenge modifier
- daily challenge id when applicable

This is important for:
- fair leaderboards
- personal bests
- achievements
- analytics

### C. Event instrumentation

Add analytics events for:
- run started
- run completed
- run abandoned
- challenge accepted
- achievement earned
- replay CTA clicked

Without this, it will be hard to tell which loops actually improve replayability.

---

## 9. UX Guardrails

### Keep the loop short
The best replay lever is low friction.

Hard rule:
- a player should be able to finish a run and start the next one in one or two taps

### Do not bury the game under systems
Achievements and progression should support the core quiz, not distract from it.

Avoid:
- popups after every action
- too many currencies
- mandatory tutorials for simple systems
- dark-pattern retention mechanics

### Respect the educational angle
Gamification should reinforce geography learning.

Good examples:
- mastery progress
- challenge variety
- continent milestones

Weaker examples:
- arbitrary loot systems with no relation to play quality

---

## 10. Suggested Release Order

### Phase 1: Stronger run juice
- richer scoring
- streak states
- improved completion ceremony
- personal best tracking

### Phase 2: Replay and variety
- next challenge CTA
- challenge variants
- daily challenge
- daily leaderboard

### Phase 3: Long-term progression
- achievements
- mastery tracking
- profile level or title
- weekly cadence systems

This keeps the first release focused on fun and immediate replay before building larger persistence systems.

---

## 11. Verification

### Product checks
- players can clearly understand why a run score is high or low
- a great run feels materially more exciting than an average run
- the completion screen gives a strong reason to replay
- players can see personal improvement over time
- there is at least one compelling reason to return tomorrow

### Analytics success signals
Track:
- runs per session
- replay-button click rate
- percentage of users starting a second run
- daily challenge participation
- returning players over 7 and 30 days
- achievement earn rate

### UX checks
- new systems remain understandable on first use
- the game stays fast
- extra feedback does not become noisy or slow

---

## 12. Risks And Mitigations

### Risk: too many systems dilute the core quiz
Mitigation: ship in phases and keep the first release focused on scoring, replay prompts, and one or two new challenge loops.

### Risk: progression feels grindy rather than fun
Mitigation: reward quality, mastery, and variety of play more than raw volume.

### Risk: social comparison discourages weaker players
Mitigation: emphasize personal bests and achievements alongside leaderboards.

### Risk: feature scope expands too quickly
Mitigation: keep v1 local-first where possible, especially for personal bests and achievement surfaces.

---

## 13. Exit Criteria

This plan is complete when:
- each run has more expressive scoring and feedback
- the end-of-run flow gives a clear replay reason
- Mappil supports at least one strong recurring reason to return, such as a daily challenge
- players can track personal improvement across sessions
- the game feels more joyful and replayable without becoming cluttered or manipulative
