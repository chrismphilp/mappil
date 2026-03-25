# Leaderboard Design And Delight Plan

**Recommendation:** Redesign Mappil's leaderboard around three ideas: celebrate the top of the board, orient the current player instantly, and make each board feel mode-aware rather than generic.

**Why this approach:** The current leaderboard in `src/components/leaderboard/LeaderboardModal.tsx` is functionally solid, but visually flat. It already supports best-attempt-per-player ranking, current-player highlighting, free-play filtering, daily/friend challenge modes, and fallback positioning. What it lacks is drama, hierarchy, and personality. Right now it reads more like a ranked list in a settings panel than a destination players want to inspect after a run.

**Primary v1 goal:** Make the leaderboard feel rewarding, readable, and distinct across free play, daily, and friend challenge contexts without requiring a new backend model.

**Scope rule for v1:** Use the current `scores` schema and ranking logic in `src/lib/leaderboard.ts`. Do not add auth, avatars, or a large new social system just to improve the board presentation.

---

## 1. Current Product Baseline

### What already works
- leaderboard ranking already collapses to best visible attempt per player
- the current player can be identified via `player_id`
- daily and friend challenge boards already share the same fetch path
- the modal supports free-play filters for mode, difficulty, and continent
- rows already surface the core ranking stats:
  - score
  - errors
  - duration
  - best streak

### What feels thin today
- the modal header is generic and does not make the board feel special
- the top three entries are barely differentiated from the rest
- filter controls look utilitarian and visually compete with the content
- the current-player summary duplicates row information without adding much context
- all board types look almost identical even though daily, friend, and free-play boards have different emotional roles
- loading, empty, and error states are serviceable but not memorable

### Likely consequence
Players can use the leaderboard, but the board does not yet heighten the feeling of competition or reward the curiosity of checking how a run compares.

---

## 2. Product Direction

### Chosen design direction
Make the leaderboard feel like:
- an arcade score board
- a lightweight social proof surface
- a fast comparison tool for “how did I do?”

### Core principles
- celebrate rank without adding clutter
- make “you” easy to locate immediately
- surface tie-break-relevant stats more clearly
- let board context change the mood:
  - daily should feel like a live event
  - friend challenge should feel like a duel board
  - free play should feel like a ruleset ladder

### Avoid
- fake “fun” through noisy gimmicks
- over-animating every row
- introducing visual flair that slows scanning
- making the board depend on user accounts or profile photos

---

## 3. Layer 1: Fix Information Hierarchy

### A. Stronger board hero

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Replace the current plain title block with a more expressive board header.

Recommended content:
- board title
- a small board type badge:
  - `Daily Sprint`
  - `Friend Showdown`
  - `World Ladder`
- a short subtitle describing the ruleset or board context
- player count summary

Why this matters:
- the board should feel like a destination, not just a modal shell
- daily and friend boards should stop feeling visually interchangeable

### B. Better filter controls

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`
#### [OPTIONAL NEW] `src/components/leaderboard/LeaderboardFilters.tsx`

The current `<select>` controls are compact but visually dead.

Recommended v1 direction:
- replace plain selects with segmented pills or elevated chips
- keep the current three dimensions:
  - mode
  - difficulty
  - region
- collapse filters on smaller screens if needed, but keep the active ruleset visible

For challenge boards:
- hide free-play filters entirely
- replace them with a locked board context pill such as:
  - `Daily Seed`
  - `Friend Challenge`

### C. Rebuild the current-player block

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

The existing `Your Best` card is useful, but not yet informative enough.

Recommended v1 direction:
- keep a dedicated player summary near the top
- show:
  - current rank
  - score
  - errors
  - streak
  - time
- add one extra competitive signal:
  - points needed to pass the player above
  - or a simple “Top 10”, “Top 25%”, or “Unranked” style state

If the current player already appears in the visible list:
- keep the summary card smaller and more concise
- avoid repeating the exact same information verbatim

---

## 4. Layer 2: Make The Board More Fun

### A. Give the top three real ceremony

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`
#### [OPTIONAL NEW] `src/components/leaderboard/LeaderboardPodium.tsx`

Right now ranks 1, 2, and 3 only get slightly different circles. That is not enough.

Recommended v1 direction:
- give the top 3 a dedicated podium section
- use gold, silver, and bronze styling
- make score the dominant number
- keep secondary stats visible as small chips:
  - time
  - streak
  - errors

Mobile direction:
- stacked podium cards

Desktop direction:
- slightly asymmetric podium layout if it still fits the modal cleanly

### B. More expressive row cards

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Below the podium, each entry row should feel more like a score card than a list item.

Recommended row structure:
- rank badge
- username and `You` tag
- a compact stat line using chips instead of a single muted sentence
- score block on the right with stronger hierarchy

Recommended visual improvements:
- subtle tier accents for top 10
- stronger current-player border and glow
- clearer typography contrast between primary and secondary stats

### C. Add lightweight stat badges

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Use existing stats to create small, readable labels without changing the database.

Examples:
- `Clean` for very low-error runs
- `Hot Streak` for standout streaks
- `Fast` for unusually short clears

Guardrail:
- use at most one or two badges per row
- do not create badge soup

### D. Make the board context-themed

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Use slightly different accent treatments for each board type:
- daily:
  - amber or sunrise tones
  - more event-like header copy
- friend:
  - purple or duel-style accents
  - stronger “head-to-head” framing
- free play:
  - cyan or emerald ladder treatment
  - clearer ruleset emphasis

This should be tonal, not a full redesign for each mode.

---

## 5. Layer 3: Improve Competitive Clarity

### A. Explain ranking logic more clearly

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

The board currently says “Best attempt per player is shown,” which is helpful but incomplete.

Add a clearer fairness note such as:
- ranked by score
- ties broken by fewer errors, then faster time, then better streak

This can live in:
- a footer note
- a small info line under the header

### B. Show the gap to the next rank

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`
#### [OPTIONAL MODIFY] `src/lib/leaderboard.ts`

The most motivating leaderboard question is often not “Who is #1?” but “What do I need to pass the next person?”

Recommended v1 direction:
- calculate a small gap summary for the current player
- if score is the only thing needed, say that directly
- if the tie-break makes it less simple, show a more generic message such as:
  - `Tied on score, fewer errors would move you up`

This can likely be derived client-side from existing results.

### C. Improve out-of-range player positioning

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

The current “Your Position” section works, but it should feel more intentional.

Recommended direction:
- keep a separator when the player sits outside the visible top entries
- label it as a pinned placement card rather than another repeated row
- make it obvious that the player is still ranked even if not in the visible top list

---

## 6. Layer 4: Better States And Motion

### A. More polished loading state

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Replace the plain “Loading leaderboard...” text with a lightweight skeleton treatment.

Recommended direction:
- 3-5 placeholder rows
- subtle shimmer or opacity pulsing
- respect reduced-motion preferences

### B. Better empty-state design

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

The empty board should feel inviting, not just absent.

Recommended copy direction:
- encourage the player to be first
- mention the active ruleset or challenge context

Recommended UI direction:
- add one small visual motif:
  - faded rank markers
  - soft starfield accent
  - subtle trophy outline

### C. Use targeted motion, not constant motion

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

Recommended motion:
- podium cards reveal first
- row list staggers in quickly
- current-player card gets a soft intro accent

Avoid:
- continuous animations on every row
- busy hover effects on mobile

---

## 7. Implementation Structure

### Recommended component split

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`

The current file is still manageable, but the redesign will be cleaner if split into focused pieces.

Recommended subcomponents:
- `LeaderboardHeader`
- `LeaderboardFilters`
- `LeaderboardPodium`
- `LeaderboardRow`
- `LeaderboardPlayerSummary`

Benefits:
- easier visual iteration
- easier challenge-mode theming
- easier reuse of row and podium logic

### Data-layer impact

#### [KEEP / MINOR MODIFY] `src/lib/leaderboard.ts`

The data layer is already strong enough for v1.

No schema change should be required to ship:
- podium
- row redesign
- current-player summary
- gap messaging
- themed board variants

Optional helper additions:
- derived next-rank gap calculation
- rank tier metadata

---

## 8. Recommended Delivery Order

### Phase 1: Visual hierarchy and top-of-board polish
- redesign modal header
- replace filter selects
- add podium for top 3
- restyle rows

### Phase 2: Player orientation and competitive context
- rebuild `Your Best` into a better current-player summary
- add gap-to-next-rank messaging
- improve pinned player position treatment
- explain tie-break logic

### Phase 3: Delight and state polish
- add board-type accent themes
- improve loading and empty states
- add subtle reveal motion
- add lightweight row badges

---

## 9. Success Criteria

The redesign is successful if:
- the top 3 are visually distinct at a glance
- a player can find their own standing within two seconds
- daily, friend, and free-play boards feel related but not identical
- the leaderboard feels rewarding to open even after a mediocre run
- the board remains clean and readable on mobile
- no backend migration is required for the first pass

---

## 10. File Impact Summary

### Primary files
- [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`
- [OPTIONAL MODIFY] `src/lib/leaderboard.ts`

### Likely new UI files
- [NEW] `src/components/leaderboard/LeaderboardHeader.tsx`
- [NEW] `src/components/leaderboard/LeaderboardFilters.tsx`
- [NEW] `src/components/leaderboard/LeaderboardPodium.tsx`
- [NEW] `src/components/leaderboard/LeaderboardRow.tsx`
- [NEW] `src/components/leaderboard/LeaderboardPlayerSummary.tsx`

### Related plans
- [Gamification And Replayability](./05-gamification-and-replayability.md)
- [Personal Bests And Player Profile](./08-personal-bests-and-player-profile.md)
