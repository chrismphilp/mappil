# Personal Bests And Player Profile Plan

**Recommendation:** Treat this as a phase-two plan. Mappil already has a local-first player profile foundation, so the next pass should harden that storage, expose it in a dedicated progress surface, and defer mastery and cloud sync until the app collects the right data.

**Why this change:** The current codebase already ships stable local player IDs, ruleset-specific personal best tracking, recent run storage, completion-screen PB badges, a settings snapshot, and leaderboard submission with `player_id`. The plan should stop describing those as future work and instead focus on the real remaining gaps.

**Primary goal:** Make existing personal progress visible, trustworthy, and easy to revisit.

**Scope rule for this phase:** No auth system, no cloud merge logic, and no region-level mastery features until the necessary data exists.

---

## 1. Current State

### Already shipped
- [EXISTS] `src/types/profile.types.ts`
- [EXISTS] `src/lib/playerProfileStorage.ts`
- [EXISTS] `src/hooks/usePlayerProfile.ts`
- [EXISTS] `src/components/game/GameCompleteModal.tsx` records completed runs, shows PB and tied-PB badges, and compares against the previous best score
- [EXISTS] `src/components/settings/SettingsPanel.tsx` exposes username, a compact progress snapshot, favorite ruleset, and clear local progress
- [EXISTS] `src/lib/leaderboard.ts` accepts `player_id` and uses it when collapsing repeat attempts

### Real remaining gaps
- no dedicated profile screen or panel for browsing personal bests and recent runs
- no detailed per-ruleset view beyond the compact settings snapshot
- no migration version or explicit upgrade path for local profile data
- no automated coverage for profile storage, ruleset keying, or PB comparison logic
- no telemetry path for validating whether profile features improve replay behavior
- no region-level attempt data, so mastery-by-country claims are not currently implementable

### Consequence if left as-is
The foundation exists, but most of it stays invisible after the completion modal disappears. Players get a momentary PB celebration, not an ongoing sense of progress.

---

## 2. Revised Recommendation

### Phase focus
1. harden local profile storage
2. expose the stored progress in a real profile surface
3. improve post-run comparisons and replay prompts
4. defer mastery instrumentation and cloud sync until the local feature proves useful

### What the profile should answer
- what am I improving at
- what is my best ruleset right now
- what should I replay next
- how recently have I been active

---

## 3. Product Design

### A. Dedicated profile surface

#### [NEW] `src/components/profile/ProfilePanel.tsx`

Build a lightweight profile panel or modal that opens from settings first. It should show:
- player summary
- recent runs
- ruleset personal best cards
- favorite ruleset
- last played timestamp
- clear local progress action

Keep it focused on progress, not social identity.

### B. Entry points

#### [MODIFY] `src/components/settings/SettingsPanel.tsx`

Turn the current snapshot into a launch point:
- add a `View Profile` action
- keep the compact stats visible in settings
- move dense history and ruleset cards into the profile panel

#### [MODIFY] `src/components/game/GameCompleteModal.tsx`

Add a low-friction path from a completed run into the profile panel, especially when the player sets or ties a PB.

### C. Better post-run comparison

The current modal compares only score against the previous local best. Expand this to show concise deltas for the active ruleset:
- score vs previous best
- errors vs cleanest prior run
- streak vs prior best streak
- clean-clear time vs prior fastest clean clear when relevant

Do not overload the modal. One compact comparison card is enough.

---

## 4. Technical Design

### A. Harden the profile model

#### [MODIFY] `src/types/profile.types.ts`

Add explicit versioning to the stored profile model, for example:

```ts
interface PlayerProfile {
  version: 1;
  // existing fields...
}
```

This gives future schema changes a safe migration path instead of silent reset-or-hope behavior.

### B. Add migration and sanitization paths

#### [MODIFY] `src/lib/playerProfileStorage.ts`

Responsibilities for the next pass:
- migrate older profile shapes forward
- sanitize corrupted or partial local data without losing a valid `playerId`
- keep storage bounded
- centralize profile load behavior so all surfaces read the same normalized state
- optionally listen for `storage` events later if cross-tab consistency matters

### C. Keep ruleset identity as the source of truth

#### [EXISTS] `src/lib/ruleset.ts`

Reuse the existing ruleset key builder everywhere. Do not let profile UI invent alternate grouping logic.

### D. Add test coverage

There is currently no automated test harness in the repo. Before expanding the profile feature further, add a lightweight test setup and cover:
- profile initialization
- migration of older stored payloads
- run recording idempotency by `runId`
- ruleset-specific PB separation
- tied PB handling
- corrupted localStorage recovery

---

## 5. UI Surfaces

### A. Profile panel contents

#### [NEW] `src/components/profile/ProfilePanel.tsx`

Recommended sections:
- summary header with username and totals
- recent runs list capped to the stored history limit
- ruleset PB cards sorted by most-played or most-recent
- latest PB badge strip or recent highlight
- empty state for first-time players

### B. Settings integration

#### [MODIFY] `src/components/settings/SettingsPanel.tsx`

The settings panel should remain the shallow surface:
- username editing
- current snapshot
- view profile
- clear progress
- gameplay options

### C. Completion flow

#### [MODIFY] `src/components/game/GameCompleteModal.tsx`

Keep the end-of-run experience focused on:
- PB badges
- one comparison card
- one replay recommendation
- optional link into the full profile view

### D. Avoid in-HUD expansion for now

Do not add PB pace or profile clutter to the live HUD in this phase. The game screen should stay focused on play.

---

## 6. Explicit Deferrals

### A. Region-level mastery

The current profile model stores aggregate counts, not per-region outcomes. Features like:
- frequently missed regions
- first-try correctness by country
- weakest map clusters

require new run instrumentation. Treat this as a later plan, not part of the current phase.

### B. Cloud sync

Supabase sync remains a later extension. Only revisit it after the local profile UI is in use and there is evidence that cross-device continuity matters.

### C. Analytics

There is no current analytics layer in the repo. Do not make telemetry a blocking dependency for the profile work. If analytics is introduced later, then track:
- profile opened
- PB achieved
- replay started from the completion modal
- progress reset

---

## 7. Implementation Order

1. Update the plan and treat the existing storage and profile foundation as shipped work.
2. Add profile versioning and migration or sanitization in `playerProfileStorage.ts`.
3. Introduce automated tests for profile storage, PB comparison, and ruleset separation.
4. Build a dedicated `ProfilePanel` using the existing `usePlayerProfile` data.
5. Add entry points from settings and the completion modal.
6. Expand the completion comparison card to show more than score when it helps the replay decision.
7. Reassess mastery instrumentation and cloud sync only after the above ships cleanly.

---

## 8. Verification

### Manual checks
- existing users keep their `playerId`, username, and valid local profile data after the migration change
- a run is recorded only once per `runId`
- ruleset PBs remain separated between free play, daily, and friend challenge variants
- the profile panel reflects new runs immediately
- clearing progress resets stats while preserving a stable local player ID
- the completion modal shows accurate deltas against the previous best ruleset record

### Automated checks
- profile load and migration
- PB and tied-PB computation
- recent-run capping
- corrupted storage fallback

---

## 9. Risks And Mitigations

### Risk: the plan keeps expanding into a full account system
Mitigation: keep this phase local-only and UI-focused.

### Risk: schema changes break existing local profiles
Mitigation: add a version field, migration path, and explicit tests before new UI surfaces rely on the data.

### Risk: mastery promises more insight than the data supports
Mitigation: defer per-region mastery until the game stores per-region outcomes.

### Risk: the profile UI becomes another settings dump
Mitigation: make the profile panel progress-first, with recent runs and ruleset cards as the primary content.

---

## 10. Exit Criteria

This phase is complete when:
- the plan matches the real codebase
- the local profile model is versioned and migration-safe
- profile logic has automated coverage
- players can open a dedicated profile surface to review recent runs and ruleset personal bests
- the completion screen helps players understand their next improvement target without becoming cluttered
