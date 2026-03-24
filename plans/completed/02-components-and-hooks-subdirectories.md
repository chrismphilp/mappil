# Components And Hooks Subdirectories Plan

**Recommendation:** Reorganize `src/components` and `src/hooks` into shallow, domain-based subdirectories in one mechanical refactor, without changing runtime behavior, component APIs, or game logic.

**Why this approach:** `src/components` is currently a single flat folder with 14 files, while `src/hooks` has a single large `useGameState.ts`. The code already exposes natural clusters around gameplay, settings, leaderboard, globe, and app bootstrapping. A shallow folder split improves discoverability without introducing the overhead of a full feature-folder rewrite.

**Primary goal:** Make component ownership and navigation clearer now, while creating room for new files so `src/components` does not continue to grow as a flat list.

**Scope rule for v1:** Move files and update imports only. Do not combine this refactor with behavior changes, hook decomposition, import alias work, or new barrel-file conventions.

---

## 1. Recommendation

### Chosen structure
Use one level of domain-based nesting under both directories.

Recommended target structure:

```text
src/
  components/
    app/
      LoadingOverlay.tsx
    game/
      FeedbackOverlay.tsx
      GameCompleteModal.tsx
      GameContent.tsx
      HUD.tsx
      ProgressBar.tsx
      ScoreCounter.tsx
      StreakIndicator.tsx
    globe/
      Globe.tsx
    leaderboard/
      LeaderboardButton.tsx
      LeaderboardModal.tsx
    settings/
      OptionSelector.tsx
      SettingsButton.tsx
      SettingsPanel.tsx
  hooks/
    game/
      useGameState.ts
```

### Why shallow folders
Do not create a folder per component and do not introduce multiple nested layers such as `game/hud/display/`. The repo is still small enough that one domain level is the right tradeoff.

### Why not a full feature-folder migration
Do not move `data`, `lib`, and `types` into matching feature areas in this pass. That would turn a simple organizational cleanup into a broader architectural change and make regressions harder to isolate.

---

## 2. Exact Move Plan

### Components

#### App bootstrap
- `src/components/LoadingOverlay.tsx` -> `src/components/app/LoadingOverlay.tsx`

#### Gameplay shell and HUD
- `src/components/GameContent.tsx` -> `src/components/game/GameContent.tsx`
- `src/components/HUD.tsx` -> `src/components/game/HUD.tsx`
- `src/components/FeedbackOverlay.tsx` -> `src/components/game/FeedbackOverlay.tsx`
- `src/components/GameCompleteModal.tsx` -> `src/components/game/GameCompleteModal.tsx`
- `src/components/ProgressBar.tsx` -> `src/components/game/ProgressBar.tsx`
- `src/components/ScoreCounter.tsx` -> `src/components/game/ScoreCounter.tsx`
- `src/components/StreakIndicator.tsx` -> `src/components/game/StreakIndicator.tsx`

#### Globe
- `src/components/Globe.tsx` -> `src/components/globe/Globe.tsx`

#### Settings
- `src/components/SettingsButton.tsx` -> `src/components/settings/SettingsButton.tsx`
- `src/components/SettingsPanel.tsx` -> `src/components/settings/SettingsPanel.tsx`
- `src/components/OptionSelector.tsx` -> `src/components/settings/OptionSelector.tsx`

#### Leaderboard
- `src/components/LeaderboardButton.tsx` -> `src/components/leaderboard/LeaderboardButton.tsx`
- `src/components/LeaderboardModal.tsx` -> `src/components/leaderboard/LeaderboardModal.tsx`

### Hooks
- `src/hooks/useGameState.ts` -> `src/hooks/game/useGameState.ts`

### Scope boundary
Keep `Globe.tsx` and `useGameState.ts` intact as files during this pass even though they are relatively large. This plan is about directory structure, not internal file splitting.

---

## 3. Import Strategy

### Direct imports only
Continue using direct file imports after the move.

Examples:
- `src/App.tsx` should import from `./components/app/LoadingOverlay`
- `src/App.tsx` should import from `./components/game/GameContent`
- `src/components/game/GameContent.tsx` should import `useGameState` from `../../hooks/game/useGameState`
- `src/components/game/GameContent.tsx` should import `Globe` from `../globe/Globe`
- `src/components/settings/SettingsPanel.tsx` should import `OptionSelector` from `./OptionSelector`

### Do not add barrel files in v1
Avoid adding `index.ts` files during the same refactor. The current repo is small, and directory barrels would add an extra convention without materially reducing complexity yet.

### Do not add path aliases in v1
`tsconfig.json` currently does not define a `baseUrl` or aliases. Keep that unchanged for this refactor so there is only one source of movement: file paths.

---

## 4. Implementation Order

### Phase 1: Create target directories
Create:
- `src/components/app`
- `src/components/game`
- `src/components/globe`
- `src/components/leaderboard`
- `src/components/settings`
- `src/hooks/game`

### Phase 2: Move leaf components first
Move low-dependency leaf files before parent orchestrators:
- `ProgressBar.tsx`
- `ScoreCounter.tsx`
- `StreakIndicator.tsx`
- `OptionSelector.tsx`
- `SettingsButton.tsx`
- `LeaderboardButton.tsx`
- `LoadingOverlay.tsx`

This keeps import updates smaller and easier to validate incrementally.

### Phase 3: Move grouped parent components
Move:
- `SettingsPanel.tsx`
- `LeaderboardModal.tsx`
- `FeedbackOverlay.tsx`
- `GameCompleteModal.tsx`
- `HUD.tsx`
- `Globe.tsx`

### Phase 4: Move top-level gameplay state and shell
Move:
- `useGameState.ts`
- `GameContent.tsx`

These two are the most connected files, so they should move after the rest of the graph is already settled.

### Phase 5: Update root imports
Update `src/App.tsx` last after the moved files compile locally.

---

## 5. Technical Rules For The Refactor

### Preserve git history
Use `git mv` during implementation rather than delete-and-recreate moves where practical.

### Keep the refactor mechanical
Do not:
- rename components
- rename the hook
- change default exports to named exports
- change component props
- change game state logic

### Keep relative imports local and obvious
When two files live in the same new subdirectory, import them with `./...`.
When crossing domains, import them with the shortest correct relative path.

### Keep folder names semantic
Use domain names, not implementation names:
- `game`, not `misc`
- `settings`, not `controls`
- `leaderboard`, not `modal`

`modal` and `button` are presentation types, not ownership domains.

---

## 6. Verification

### Required checks
- run the TypeScript build via `npm run build`
- confirm `App.tsx` still loads the loading overlay and game content correctly
- confirm the globe still lazy-loads from the new path
- confirm settings and leaderboard panels still open
- confirm the game-complete flow still renders and submits scores

### Regression focus
Pay particular attention to:
- broken relative import paths after moving `GameContent.tsx`
- broken relative import paths after moving `useGameState.ts`
- any import from `../types/game.types`, `../data/maps`, or `../lib/leaderboard` that needs an extra `../`

---

## 7. Risks And Mitigations

### Risk: broken relative imports
Mitigation: move in phases and run a build immediately after the refactor rather than batching unrelated edits.

### Risk: over-structuring a still-small repo
Mitigation: keep the new hierarchy shallow and avoid empty placeholder folders.

### Risk: follow-up work becomes coupled to this refactor
Mitigation: explicitly defer file splitting, path aliases, and feature-folder migration to later changes.

### Risk: `useGameState.ts` still feels too large after the move
Mitigation: accept that for now. If it becomes harder to maintain, create a separate plan for splitting reducer logic and helpers after the directory reorg has landed cleanly.

---

## 8. Exit Criteria

This plan is complete when:
- `src/components` is organized into domain subdirectories
- `src/hooks` has a `game` subdirectory containing `useGameState.ts`
- all imports compile with the new paths
- the app behavior is unchanged
- the reorg remains a pure structure change rather than a mixed refactor
