# Seeded Shareable Friend Challenges Plan

**Recommendation:** Build a shareable friend-challenge layer on top of the seeded-run foundation, so any player can generate a deterministic run, share a simple link, and challenge friends on the exact same sequence under the exact same rules.

**Why this approach:** The daily challenge plan in `plans/07-daily-challenge-and-seeded-runs.md` covers shared seeded runs by date, but replayability and social spread also need person-to-person challenge flows. Mappil already has the core ingredients for this direction: a competitive leaderboard surface, rulesets in `src/types/game.types.ts`, and a run-generation path in `src/hooks/useGameState.ts` that can be made deterministic. What is missing is a product wrapper for “I just played this, now beat me.”

**Primary v1 goal:** Let a player generate and share a deterministic challenge link that opens the exact same run for a friend.

**Scope rule for v1:** Start with simple shareable links and challenge metadata. Do not block on a full friends graph, messaging layer, or authenticated social system.

---

## 1. Product Direction

### Core use case
The loop should be:
1. a player finishes or configures a run
2. the app generates a stable challenge link
3. the player sends it to a friend
4. the friend opens the link and plays the exact same run
5. both scores can be compared fairly

### Why this matters
Friend challenges create:
- replayability
- word-of-mouth distribution
- higher-stakes rematches
- more emotionally meaningful competition than a generic global leaderboard

### Why not wait for accounts
Do not block this on user accounts or a social graph. A good challenge-link system can work with usernames and anonymous local identity first.

---

## 2. Relationship To Existing Plans

### Dependency on seeded-run work
This plan depends on the deterministic run generation described in [07-daily-challenge-and-seeded-runs.md](/Users/christopherph/personal/mappil/plans/07-daily-challenge-and-seeded-runs.md).

### Dependency on profile work
This plan benefits from the local player identity and personal progress model described in [08-personal-bests-and-player-profile.md](/Users/christopherph/personal/mappil/plans/08-personal-bests-and-player-profile.md), but it should not be blocked on full profile UI.

### Dependency on SEO/discoverability work
Friend challenges can eventually support discoverability and sharing, but the first version is primarily a retention and social replay feature, not an SEO feature.

---

## 3. Challenge Model

### A. What a shareable challenge must include
A friend challenge needs a canonical challenge payload containing:
- `challengeId`
- `seed`
- `mapPack`
- `difficulty`
- `continent`
- `gameMode`
- optional `promptMode`
- optional modifier or challenge type
- `createdByPlayerId` or creator username

### B. Challenge identity

Recommended format:

```text
friend:<short-id>
```

Example:

```text
friend:8K4Q2M
```

Keep the public-facing id short and shareable even if a richer payload exists behind it.

### C. Fairness rule
Two players are only comparable if they share:
- the same seed
- the same content pack
- the same scoring rules
- the same allowed actions

The system must treat these values as part of the challenge identity, not optional display metadata.

---

## 4. Sharing Approaches

### A. Recommended v1: self-contained share links

Use a link that fully encodes the challenge or references a stored challenge id.

Two viable patterns:

#### Option 1: encoded URL parameters

```text
/play?seed=abc123&continent=europe&difficulty=medium&mode=quick&challenge=friend:8K4Q2M
```

#### Option 2: stored challenge record

```text
/challenge/friend:8K4Q2M
```

### Recommended choice
Prefer stored challenge records for cleaner links and more flexibility.

Why:
- better for shareability
- easier to evolve the payload later
- easier to add creator attribution and replay stats
- easier to prevent malformed client-generated URLs from becoming canonical

### B. Fallback capability
Even if stored challenge records are preferred, keep the core run resolver compatible with raw seeded query params so the system remains debuggable and locally testable.

---

## 5. Product UX

### A. Challenge creation moments

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Add a post-run action such as:
- `Challenge a Friend`

This should be one of the highest-priority calls to action after a satisfying run.

### B. Pre-run challenge creation

#### [MODIFY] `src/components/SettingsPanel.tsx`

Optionally allow a player to create a friend challenge from the currently selected ruleset before they even start playing.

Example CTA:
- `Create Challenge Link`

This is useful for intentionally setting up a duel rather than only sharing completed runs.

### C. Challenge landing experience

#### [NEW] `src/components/FriendChallengeCard.tsx`

When someone opens a challenge link, show:
- who created the challenge
- what the rules are
- what map pack and mode they will play
- a clear CTA such as `Accept Challenge`

Do not drop the recipient straight into the run without context.

### D. Post-run comparison

At the end of a challenged run, show:
- your score
- the challenge creator’s score if available
- whether you beat them
- whether you tied
- a CTA to rematch or create a counter-challenge

This is the emotional core of the feature.

---

## 6. Technical Design

### A. Challenge resolver

#### [NEW] `src/lib/friendChallenge.ts`

Responsibilities:
- create challenge payloads
- store or resolve challenge records
- normalize rule config
- generate shareable URLs
- validate challenge data before starting a run

### B. Game-state integration

#### [MODIFY] `src/hooks/useGameState.ts`

Extend the seeded-run config so it can represent friend challenges explicitly.

Recommended extension:

```ts
interface RunConfig {
  difficulty: Difficulty;
  continent: ContinentFilter;
  gameMode: GameMode;
  challengeId?: string;
  challengeType?: 'daily' | 'friend';
  seed?: string;
  mapPack?: string;
  promptMode?: string;
}
```

### C. Route handling

#### [MODIFY] app routing shell once route work exists

Support a dedicated challenge entry path such as:
- `/challenge/:challengeId`

If the routing/SEO plan has not landed yet, support query-param entry in the current app shell first.

### D. URL safety
Challenge resolution should validate:
- supported ruleset values
- known map packs
- known prompt modes
- seed presence

If invalid, show a graceful “challenge unavailable” state instead of failing into broken gameplay.

---

## 7. Backend And Storage Direction

### A. Recommended v1: store challenge records in Supabase

Add a `friend_challenges` table containing:
- `id`
- `created_at`
- `created_by_player_id`
- `created_by_username`
- `seed`
- `map_pack`
- `difficulty`
- `continent`
- `game_mode`
- `prompt_mode`
- optional `modifier`
- optional `expires_at`

### B. Score linkage

#### [MODIFY] `src/lib/leaderboard.ts`

Extend score submission so a run can be linked to:
- `challenge_id`
- `challenge_type = 'friend'`

This enables fair comparison within the specific challenge context.

### C. Expiry policy
Define whether friend challenges expire.

Recommended v1:
- do not expire challenge links immediately
- optionally mark very old ones as archived later

This makes sharing simpler and reduces surprise.

---

## 8. Comparison Rules

### A. Scoring comparison
Use the same ranking logic already implied in the leaderboard:
- higher score wins
- fewer errors breaks ties
- lower duration breaks remaining ties

### B. Best-attempt rule
If a player replays the same friend challenge:
- store all attempts if useful
- compare and display the best valid attempt per player

This keeps the challenge fun without letting raw volume dominate the outcome.

### C. Creator visibility
If the challenge creator has not played the challenge under the stored seed yet, decide whether the link can still be shared.

Recommended v1:
- allow both creation paths
- if the creator shares from a completed run, show their benchmark
- if they share from settings before playing, show the challenge without an initial score to beat

---

## 9. Share UX

### A. Native share first

#### [NEW] `src/lib/share.ts`

Use the Web Share API where available, with clipboard fallback.

Recommended payload:
- challenge title
- short description
- shareable URL

### B. Share copy examples
Examples:
- `I scored 9/10 on this Mappil Europe challenge. Beat me.`
- `Try this seeded world map run and see if you can top my score.`

Keep the copy concise and score-forward.

### C. Social preview support
Longer term, share links should resolve to a page with:
- challenge title
- creator name
- ruleset summary
- social preview image

This is not required for the first in-app share flow, but it becomes important once the SEO and route plans land.

---

## 10. UI Surfaces

### A. Game complete modal

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Add:
- `Challenge a Friend`
- creator vs challenger comparison block when a run came from a friend link
- `Rematch`
- `Create Counter-Challenge`

### B. HUD labeling

#### [MODIFY] `src/components/HUD.tsx`

When inside a friend challenge, show a subtle badge such as:
- `Friend Challenge`

This helps the run feel distinct and explains why fairness matters.

### C. Settings panel

#### [MODIFY] `src/components/SettingsPanel.tsx`

Add:
- current ruleset summary
- `Create Challenge Link`
- maybe a quick explanation that the link preserves the exact run

### D. Optional challenge inbox later
Eventually, the player profile can show:
- sent challenges
- accepted challenges
- outstanding rematches

Do not block v1 on this.

---

## 11. Abuse And Integrity

### A. Client tampering risk
Seeded links are only fair if the resolved challenge metadata is authoritative.

Mitigation:
- prefer server-stored challenge records over client-only URLs
- validate supported rulesets server-side if score integrity matters

### B. Spam risk
If public sharing becomes common, challenge creation could be spammed.

Mitigation for v1:
- keep challenge creation lightweight
- rate-limit only if abuse appears
- avoid building heavy anti-spam systems before they are needed

### C. Invalid or deleted challenges
Provide graceful fallback UI for:
- challenge not found
- unsupported challenge version
- missing linked map pack

---

## 12. Analytics And Measurement

### Track the friend-challenge funnel
Add events for:
- challenge created
- share CTA clicked
- share completed
- challenge link opened
- challenge accepted
- challenge completed
- creator beaten
- rematch started

### Primary success metrics
Track:
- share rate after completed runs
- open-to-accept rate on challenge links
- completion rate for accepted friend challenges
- rematch rate
- number of additional sessions generated by friend challenges

This feature should be evaluated as both a replay loop and a distribution loop.

---

## 13. Implementation Order

1. Finish the seeded-run infrastructure from the daily challenge plan.
2. Add a friend-challenge payload model and resolver.
3. Support challenge-linked runs in `useGameState.ts`.
4. Add challenge record storage and score linkage in Supabase.
5. Add `Challenge a Friend` from `GameCompleteModal.tsx`.
6. Add challenge landing UI and accept flow.
7. Add post-run comparison and rematch actions.
8. Add native share and clipboard fallback.

---

## 14. Verification

### Manual checks
- a generated friend challenge link opens the exact same run on another device
- challenge metadata remains stable after page refresh
- a friend challenge run is clearly labeled in the UI
- score submission links to the correct `challenge_id`
- creator and challenger comparisons are correct after completion
- invalid challenge links fail gracefully

### Regression focus
Pay particular attention to:
- mismatches between shared rules and resolved rules
- accidental reuse of normal leaderboard views for friend-specific comparisons
- challenge links breaking when map-pack or prompt-mode support expands
- share flows being too hidden or too slow from the completion screen

---

## 15. Risks And Mitigations

### Risk: this duplicates the daily challenge concept
Mitigation: keep daily challenges system-driven and friend challenges user-created. They should share infrastructure, not product positioning.

### Risk: challenge setup becomes too complicated
Mitigation: make the default path one tap from the completion screen, with advanced configuration optional.

### Risk: social comparison discourages weaker players
Mitigation: emphasize fun rematches and personal bests alongside win/loss framing.

### Risk: backend storage is overkill too early
Mitigation: keep the data model minimal and start with a single `friend_challenges` table plus linked scores.

---

## 16. Exit Criteria

This plan is complete when:
- a player can create a shareable seeded challenge link
- a friend can open it and play the exact same run
- results are compared under identical rules
- the completion flow supports rematch or counter-challenge actions
- friend challenges create a clear replay and sharing loop without requiring a full social network
