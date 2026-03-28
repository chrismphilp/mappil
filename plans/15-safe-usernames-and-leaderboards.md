# Safe Usernames And Leaderboards Plan

**Recommendation:** Fix offensive username handling in three layers: validate and normalize names in the app, enforce the same policy at a server-owned write boundary, and clean up already-stored names on leaderboard and friend challenge surfaces.

**Why this approach:** Mappil currently stores usernames locally in `src/lib/playerProfileStorage.ts`, lets players edit them in `src/components/settings/SettingsPanel.tsx` and `src/components/game/GameCompleteModal.tsx`, and sends them straight into `scores` and `friend_challenges` through `src/lib/leaderboard.ts` and `src/lib/friendChallenge.ts`. Supabase policies in `supabase/schema.sql` allow anonymous inserts with `WITH CHECK (true)`, so any client-only profanity filter would be trivial to bypass.

**Primary v1 goal:** Prevent obviously offensive or evasive usernames from being saved locally, submitted to shared data, or displayed on leaderboard and friend challenge surfaces without adding a full account system.

**Scope rule for v1:** Keep the current local-first anonymous identity model. Do not add auth, profile history, or a heavyweight moderation service just to make usernames safe.

---

## 1. Current State

### What already exists
- `src/components/settings/SettingsPanel.tsx` lets players save a username locally
- `src/components/game/GameCompleteModal.tsx` reuses that username for score submission and friend challenge sharing
- `src/lib/playerProfileStorage.ts` trims the name before persisting it locally
- `src/lib/leaderboard.ts` inserts `username` directly into `scores`
- `src/lib/friendChallenge.ts` inserts `created_by_username` directly into `friend_challenges`
- `supabase/schema.sql` exposes anonymous insert policies for both tables

### What is missing
- no offensive-name detection beyond length checks
- no normalization for zero-width characters, repeated separators, or basic leetspeak evasion
- no server-side enforcement at the actual write boundary
- no cleanup path for offensive names that are already in Supabase
- no shared rule contract between settings, score submission, and friend challenge creation

### Consequence if left as-is
Players can save an offensive username locally, submit it to the leaderboard, and bypass any future client-only validation by calling the public insert path directly.

---

## 2. Product Policy

### A. Username rules for v1

Accept usernames that are:
- 3 to 20 visible characters
- composed of letters or numbers in supported scripts plus a small set of separators such as spaces, `_`, and `-`
- free of control characters, zero-width characters, and repeated punctuation spam

Reject usernames that:
- match blocked terms or patterns after normalization
- rely on separator stuffing to disguise blocked words
- use basic leetspeak substitutions to evade blocked words
- are empty after normalization

### B. Normalization contract

#### [NEW] shared username moderation helper

Introduce one canonical normalization pipeline, used everywhere a username is read or written:
- trim leading and trailing whitespace
- collapse repeated internal whitespace
- remove invisible characters
- normalize Unicode consistently
- lowercase for comparison
- build a moderation key that strips separators and folds basic character substitutions

The app may keep the display form the player typed if it is approved, but moderation decisions should always run on the normalized comparison form.

### C. Rejection behavior

If a name fails moderation:
- settings should refuse to save it
- score submission should fail before the leaderboard write happens
- friend challenge creation should fail before the challenge row is created
- leaderboard and challenge surfaces should never render the rejected raw string

### D. Blank-name behavior

Keep blank usernames allowed for local play, but require an approved username before:
- submitting a score
- creating a friend challenge

This preserves the no-signup flow while still protecting public surfaces.

---

## 3. Recommended Architecture

### A. Shared client validation

#### [NEW] `src/lib/usernameModeration.ts`

Create a focused helper that exports:
- `normalizeUsernameInput()`
- `buildUsernameModerationKey()`
- `validateUsername()`
- structured result codes such as:
  - `too_short`
  - `too_long`
  - `invalid_chars`
  - `blocked`

This helper should be the only place that knows the username rules on the client.

### B. Local profile hardening

#### [MODIFY] `src/lib/playerProfileStorage.ts`
#### [MODIFY] `src/hooks/usePlayerProfile.ts`

Update local profile behavior so that:
- `updatePlayerUsername()` validates before persisting
- `loadPlayerProfile()` sanitizes legacy local usernames against the new policy
- a once-valid username that now fails the rules is cleared or replaced with an empty string on load

This closes the current gap where an offensive name can live indefinitely in local storage and be retried later.

### C. Settings and completion UX

#### [MODIFY] `src/components/settings/SettingsPanel.tsx`
#### [MODIFY] `src/components/game/GameCompleteModal.tsx`

Replace the current length-only alerts with inline validation states:
- show why a name is rejected
- disable save or submit actions while invalid
- keep the error copy short and direct

Do not silently rewrite offensive names. Reject them and ask for a new one.

### D. Server-owned write boundary

#### [NEW] `supabase/functions/submit-score/index.ts`
#### [NEW] `supabase/functions/create-friend-challenge/index.ts`
#### [NEW] `supabase/functions/_shared/usernameModeration.ts`

Move public writes behind Supabase Edge Functions or an equivalent server-owned boundary:
- the function validates the username
- the function inserts rows with the service role only after validation passes
- the client receives a clear error code when moderation rejects the name

This is the core security change. Without it, direct table inserts remain a bypass path.

### E. Lock down direct public inserts

#### [MODIFY] `supabase/schema.sql`
#### [NEW] migration to update RLS policies

After the function path exists:
- remove anonymous direct insert access to `scores`
- remove anonymous direct insert access to `friend_challenges`
- keep anonymous reads for leaderboard and challenge viewing

The app should no longer write shared rows straight from the browser.

---

## 4. Data Model And Moderation Source Of Truth

### A. Blocked terms table

#### [NEW] migration for `blocked_usernames`

Add a moderation table that stores normalized blocked terms or patterns, for example:
- `term`
- `match_type`
- `severity`
- `notes`
- timestamps

Why use a table:
- updates do not require a full app redeploy
- the server path has one source of truth
- future tuning is easier than hard-coding scattered arrays

### B. Display-safe leaderboard fields

#### [MODIFY] `supabase/schema.sql`
#### [NEW] migration for display-name fields

Add display-safe fields so shared surfaces never depend on rendering the raw stored name:
- `scores.display_username`
- `scores.username_redacted`
- `friend_challenges.created_by_display_username`
- `friend_challenges.username_redacted`

For approved new writes:
- store the approved display name in both the raw and display fields if desired

For redacted legacy rows:
- keep leaderboard rendering on the display-safe field
- preserve enough internal identity to avoid collapsing unrelated historical entries together

This matters because `src/lib/leaderboard.ts` currently falls back to `legacy:${username}` when `player_id` is missing. A naive mass-replacement of old usernames with the same placeholder could merge unrelated legacy rows.

### C. Optional moderation logging

#### [OPTIONAL NEW] migration for `username_moderation_events`

If tuning data is needed, log:
- rule id
- surface such as `settings`, `submit_score`, or `friend_challenge`
- timestamp
- hashed or redacted candidate value

Do not log raw offensive strings unless there is a clear operational reason to keep them.

---

## 5. Shared Surface Changes

### A. Leaderboard submission

#### [MODIFY] `src/lib/leaderboard.ts`

Replace direct `supabase.from('scores').insert(...)` writes with a call to the new function. Also update the read types to use `display_username` for rendering.

### B. Friend challenge creation

#### [MODIFY] `src/lib/friendChallenge.ts`

Replace direct `friend_challenges` inserts with a call to the new function and read back `created_by_display_username` for UI surfaces.

### C. Leaderboard rendering

#### [MODIFY] `src/components/leaderboard/LeaderboardModal.tsx`
#### [MODIFY] `src/components/leaderboard/LeaderboardRow.tsx`
#### [MODIFY] `src/components/leaderboard/LeaderboardPodium.tsx`
#### [MODIFY] `src/components/leaderboard/leaderboardUtils.ts`

Read and display only the moderated display-safe username field. If a name was redacted:
- show a neutral fallback such as `Player`
- avoid exposing the original value in tooltips, aria labels, or helper text

### D. Friend challenge display

#### [MODIFY] challenge-related UI that renders creator names

Any friend challenge summary, landing copy, or share helper should use the display-safe creator name, not the raw stored value.

---

## 6. Existing Data Cleanup

### A. One-time moderation backfill

#### [NEW] migration or admin script for stored usernames

Run the new moderation rules across:
- `scores.username`
- `friend_challenges.created_by_username`

For rows that fail:
- set the display-safe field to a neutral fallback
- mark the row as redacted
- keep or transform the raw identity only as needed to preserve ranking behavior for legacy rows

### B. Local storage cleanup

When the app loads after this change:
- reject previously saved offensive usernames locally
- prompt the player to choose a new username before their next public submission

### C. Avoid half-fixed behavior

Do not ship client validation without the backfill. Otherwise old offensive names will still appear on shared surfaces and the app will look inconsistently moderated.

---

## 7. Implementation Order

1. Define the username policy and shared normalization contract.
2. Add `src/lib/usernameModeration.ts` and update local profile save and load paths.
3. Update settings and completion UI to use structured validation states instead of length-only alerts.
4. Add Supabase moderation tables and server-owned write functions.
5. Switch `submitScore()` and `createFriendChallenge()` to the new write boundary.
6. Remove anonymous direct insert policies from shared tables.
7. Backfill and redact existing offensive names already stored in Supabase.
8. Update leaderboard and challenge rendering to use display-safe fields only.
9. Add automated coverage for normalization, rejection, and migration-safe cleanup.

---

## 8. Verification

### Manual checks
- a clean username saves locally and submits successfully
- an offensive username is rejected in settings before save
- an offensive username is rejected in the completion modal before score submission
- direct browser access to public table inserts no longer works once RLS is tightened
- friend challenge creation fails cleanly for rejected usernames
- legacy offensive names no longer appear on leaderboard or challenge surfaces after backfill

### Automated checks
- normalization removes invisible characters and collapses separators as expected
- blocked words are caught even with basic leetspeak or separator evasion
- local profile loading clears or rejects newly invalid legacy usernames
- score submission rejects blocked usernames at the server boundary
- friend challenge creation rejects blocked usernames at the server boundary
- leaderboard rendering never surfaces the raw redacted value

---

## 9. Risks And Mitigations

### Risk: false positives block legitimate names
Mitigation: keep the rule set narrow for v1, normalize consistently, and store moderation rules centrally so they can be tuned quickly.

### Risk: client and server rules drift apart
Mitigation: share the moderation contract and fixtures, and make the server result authoritative.

### Risk: legacy leaderboard identity gets distorted during cleanup
Mitigation: separate display-safe fields from internal identity handling instead of mass-replacing every old username with the same fallback string.

### Risk: the fix only covers score submission but not friend challenges
Mitigation: treat `scores` and `friend_challenges` as the same username-moderation problem and move both behind the same server-owned policy.

---

## 10. Explicit Deferrals

Do not bundle this work with:
- a full account system
- user-reporting tools
- appeal flows
- ML-based moderation
- account-level suspensions

The immediate job is simpler: make public-facing usernames safe and enforce that rule where writes actually happen.
