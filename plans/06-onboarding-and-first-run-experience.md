# Onboarding And First-Run Experience Plan

**Recommendation:** Add a lightweight first-run onboarding layer that teaches the interaction model in under a minute, then gets out of the way. The first session should feel guided, not gated.

**Why this approach:** Mappil currently drops users directly from `src/App.tsx` into the live game once the GeoJSON and globe have loaded. There is no first-run state, no tutorial memory, no “how do I play?” surface, and no guided first success. For players who do not immediately understand that they should tap the correct region on the globe, the product risks feeling harder and less rewarding than it actually is.

**Primary v1 goal:** Make a brand-new user understand the core loop and get their first satisfying correct answer quickly.

**Scope rule for v1:** Teach the core interaction, explain the basic UI, and celebrate the first success. Do not turn onboarding into a long multi-screen product tour.

---

## 1. Current Gap Snapshot

### What happens today
- `src/App.tsx` loads GeoJSON and the globe, then renders the full game immediately
- `src/components/GameContent.tsx` opens directly into the live session
- `src/components/HUD.tsx` shows the target region and stats, but does not explain the rules
- `src/components/SettingsPanel.tsx` exposes difficulty, continent, and mode, but there is no guidance on what a new player should choose
- the only persisted first-run state in the app today is the username in `src/components/GameCompleteModal.tsx`

### What is missing
- no welcome state
- no interaction tutorial
- no explanation of drag, tap, skip, or streaks
- no first-run defaults tailored for confidence-building
- no way to reopen onboarding later

### Likely consequence
Some users will bounce before they get to the fun part because the first experience assumes too much product intuition.

---

## 2. Recommendation

### Chosen implementation
Use a three-part onboarding flow:
- a short welcome card
- a guided micro-tutorial with a curated first success
- a brief post-tutorial handoff into normal play

### Why not a full tutorial level first
Do not build a long scripted mode with special assets and many steps. Mappil is still a quick game. The first-run flow should teach enough to reduce confusion, then hand users into the real product fast.

### Why not just add explanatory text
A paragraph alone is weaker than guided interaction. New players need one or two successful actions, not only instructions.

---

## 3. Onboarding Experience Design

### A. Welcome card

#### [NEW] `src/components/onboarding/WelcomeOverlay.tsx`

Show this only for first-time players.

Recommended contents:
- what the game is
- the core action: “Find the named region and tap it on the globe”
- one short line on dragging to rotate and pinch or scroll to zoom
- a clear primary CTA such as `Start Tutorial`
- a secondary CTA such as `Skip`

Keep the copy short. This should feel like an invitation, not a manual.

### B. Guided micro-tutorial

#### [NEW] `src/components/onboarding/OnboardingOverlay.tsx`

Run a short, structured tutorial with 3 to 4 steps:
1. orient the player to the HUD and target name
2. teach drag or rotate interaction
3. guide one easy region tap
4. explain skip and mistakes briefly

### C. First-success moment

The tutorial should guarantee an early win.

Recommended first guided targets:
- Brazil
- Australia
- Canada

These are large regions that are easier to hit than small countries or dense clusters.

### D. Handoff to real play

After the tutorial:
- start a real quick-play run
- default to `World`, `Easy`, `Quick Play`
- optionally keep a small hint card visible for the first few turns

The first real run should feel like a continuation of learning, not a sudden difficulty cliff.

---

## 4. Technical Design

### A. First-run state persistence

#### [NEW] `src/lib/onboarding.ts`

Add small storage helpers around onboarding flags.

Recommended keys:
- `mappil_onboarding_seen_v1`
- `mappil_onboarding_completed_v1`
- `mappil_onboarding_skipped_v1`

Keep versioning in the key name so onboarding can be refreshed later if the flow changes materially.

### B. Onboarding state hook

#### [NEW] `src/hooks/useOnboardingState.ts`

Responsibilities:
- detect whether onboarding should show
- expose `start`, `skip`, `complete`, and `replay` actions
- handle first-run persistence cleanly

### C. Tutorial-aware game setup

#### [MODIFY] `src/hooks/useGameState.ts`

Allow the game state hook to accept an optional initial configuration rather than always building from the current defaults alone.

Recommended direction:

```ts
interface GameConfig {
  difficulty?: Difficulty;
  continent?: ContinentFilter;
  gameMode?: GameMode;
  scriptedRegions?: string[];
  tutorialMode?: boolean;
}
```

This lets the tutorial run a small curated sequence before handing off to normal random selection.

### D. Globe hints for onboarding

#### [MODIFY] `src/components/Globe.tsx`

Add optional tutorial-only affordances such as:
- a soft pulse or ring around the guided region
- temporary camera focus to the region during explanation
- optional dimming of non-relevant interaction during a single tutorial step

Do not let these affordances leak into the normal game mode.

### E. Game shell orchestration

#### [MODIFY] `src/components/GameContent.tsx`

GameContent should coordinate:
- whether onboarding is active
- whether the normal HUD is partially simplified during tutorial
- whether settings and leaderboard are temporarily de-emphasized

The normal game should still live in one place. The onboarding flow should wrap it, not fork the app into a separate mini-project.

---

## 5. UI Behavior During Onboarding

### Keep the interface simpler
During the tutorial:
- reduce visual noise in the HUD
- hide or mute leaderboard and settings entry points temporarily
- block irrelevant actions when needed for a given step

### Teach only the essentials
The first-run flow should explain:
- where the target name appears
- how to rotate the globe
- how to select the right region
- what happens on mistakes and skip

Do not explain every system on first load:
- advanced settings
- leaderboards in depth
- future achievements or profile systems

### Add a replayable help path
Users should be able to re-open the tutorial later from settings.

#### [MODIFY] `src/components/SettingsPanel.tsx`

Add an action such as:
- `Replay Tutorial`

This matters for returning users who skipped onboarding or came back after a long break.

---

## 6. Default First-Run Ruleset

### Recommended initial rules
Use:
- `Difficulty.EASY`
- `ContinentFilter.WORLD`
- `GameMode.QUICK`

### Why this ruleset
- `Easy` reduces the pool to larger-population countries, which is more forgiving
- `Quick Play` lowers commitment and shortens time-to-fun
- `World` feels broad and recognizable without requiring setup choices

### Avoid exposing choice too early
Do not force a brand-new player to pick difficulty and continent before they have even tapped a country once.

---

## 7. Nice-To-Have Post-Tutorial Aids

### A. Temporary training wheels
For the first real run after onboarding:
- keep tips subtle
- show one-line helper text if the user stalls
- fade help out once a few correct answers are logged

### B. Contextual empty-state hints
If the player makes several early errors:
- show a small reminder about drag, zoom, or skip
- avoid sounding punitive

### C. First-run celebration
The first correct tutorial tap and the first correct real tap should both feel rewarding.

Use:
- stronger feedback copy
- a slightly richer success animation than usual
- a fast transition into the next prompt

---

## 8. Analytics And Measurement

### Track the onboarding funnel
Add events for:
- onboarding shown
- onboarding started
- onboarding skipped
- tutorial step completed
- onboarding completed
- first correct answer
- first real run started
- first run completed

### Primary success metrics
Track:
- onboarding completion rate
- first correct answer rate
- time to first correct answer
- first session completion rate
- second run start rate

Without this instrumentation, it will be hard to judge whether onboarding actually improves the first-run experience.

---

## 9. Implementation Order

1. Add onboarding storage and state helpers.
2. Add a welcome overlay and first-run detection.
3. Extend `useGameState` to support scripted tutorial configuration.
4. Add tutorial overlay and step state.
5. Add tutorial-only globe hint affordances.
6. Add settings entry to replay the tutorial.
7. Instrument onboarding funnel events.

---

## 10. Verification

### Manual checks
- a first-time user sees the onboarding flow
- a returning user does not get forced back into onboarding
- a skipped tutorial stays skipped unless reopened manually
- the tutorial produces at least one easy successful tap
- the app hands off into a normal quick-play run cleanly
- the tutorial can be replayed from settings

### Regression focus
Pay particular attention to:
- tutorial state leaking into normal runs
- guided region highlighting persisting after onboarding
- onboarding flags becoming stuck in an incomplete state
- onboarding making the first-load path feel slower than it already is

---

## 11. Risks And Mitigations

### Risk: the tutorial feels too long
Mitigation: cap it at a few actions and let users skip at any time.

### Risk: the tutorial feels disconnected from the real game
Mitigation: run it inside the real game shell with the same globe and HUD.

### Risk: hinting the correct country makes the full game feel too different
Mitigation: use region hints only in tutorial mode and hand off quickly into standard play.

### Risk: onboarding state becomes hard to maintain as features grow
Mitigation: keep onboarding flow state isolated in a dedicated hook and storage helper.

---

## 12. Exit Criteria

This plan is complete when:
- first-time users get a guided introduction
- the tutorial teaches the core interaction in under a minute
- onboarding progress is remembered
- the tutorial can be replayed later
- first-session comprehension and early success are meaningfully improved
