# Bundle Size Reduction Plan

**Recommendation:** Reduce bundle size in four coordinated layers: restore a measurable baseline, shrink the initial route graph, lazy-load interaction-heavy overlays, and refactor world-map data into lighter runtime artifacts. Keep the live landing-page preview experience, but make it materially cheaper than the full `/play` experience.

**Why this approach:** The current Next.js app still mounts the live game preview across the landing surface, so the heavy game client is likely shipped to `/`, `/map-game`, and `/:quizId` routes. Within the game path, `GameContent` eagerly pulls in modal-heavy UI and animation dependencies that are only needed after user interaction. On top of that, the app still fetches a single large world geometry file, and static export currently ships both the optimized runtime GeoJSON and the unused raw source GeoJSON from `public/data`.

**Primary goal:** Reduce shipped JavaScript and static asset bytes without removing the live landing preview or changing the current `output: 'export'` deployment model.

**Scope rule for this pass:** Include bundle measurement, route-level client graph reduction, lazy loading of modal and online features, and a map-data packaging refactor. Do not migrate away from Next.js App Router, and do not replace the globe library in this pass.

---

## 1. Current Snapshot

### Confirmed blockers
- `npm run build` fails on a JSX parse error in `src/components/profile/ProfilePanel.tsx`
- `npm run typecheck` fails on the same file
- production bundle measurements cannot be trusted until that file is fixed

### Confirmed heavy areas in the current app
- `src/components/landing/LandingPageShell.tsx` mounts `GameViewportClient` directly on landing routes
- `src/components/app/GameViewportClient.tsx` dynamically imports the full `PlayPage` client
- `src/components/game/GameContent.tsx` eagerly imports:
  - `SettingsPanel`
  - `LeaderboardModal`
  - `ProfilePanel`
  - `GameCompleteModal`
  - decorative background components
- `src/views/app/PlayPage.tsx` preloads the globe module and region data during startup
- `src/data/maps.ts` fetches `public/data/world.optimized.geo.json`
- `public/data/world.geo.json` is still publicly shipped even though only the optimization script uses it

### Known large dependency areas
- `react-globe.gl`
- `three`
- `three-globe`
- `framer-motion`
- `@supabase/supabase-js`

### Product constraints already chosen
- keep the live landing-page preview
- optimize both route JS and shipped static assets
- include a real map-data refactor, not just code-splitting

---

## 2. Success Criteria

### Build and measurement baseline
- `npm run typecheck` passes
- `npm run build` passes
- a repeatable bundle analysis workflow exists in the repo

### Bundle targets
- landing-route initial client JS drops by at least 35% from the first green baseline
- `/play` initial client JS drops by at least 25% from the first green baseline
- no initial route chunk includes `@supabase/supabase-js`
- landing routes do not fetch the full-fidelity world geometry file

### Static asset targets
- total shipped bytes under `public/data/` drop by at least 50% from the current two-file total
- the raw source GeoJSON is no longer publicly served

### UX guardrails
- landing routes still show a live interactive preview
- `/play` still supports free play, daily challenge, and friend challenge entry
- settings, profile, leaderboard, and game-complete flows still function after lazy loading

---

## 3. Implementation Strategy

### A. Restore a clean baseline first

#### Fix the build blocker
- repair the JSX structure in `src/components/profile/ProfilePanel.tsx`
- rerun:
  - `npm run typecheck`
  - `npm run build`

#### Add measurement commands
- add `npm run analyze:bundle` using:

```bash
next experimental-analyze --output
```

- save analyzer output to a local comparison directory such as:

```text
.context/bundle-baseline
```

#### Capture the initial baseline
- record route-level client bundle data for:
  - `/`
  - `/map-game`
  - `/world-map-quiz`
  - `/play`
- record shipped byte counts for:
  - `public/data/world.geo.json`
  - `public/data/world.optimized.geo.json`

#### Add bundle budget enforcement
- create a small checked-in budget file that stores:
  - route-level JS targets
  - public data asset targets
- add `npm run bundle:check` to compare the current build against that budget

### B. Reduce the landing-route client graph while keeping the live preview

#### Split the landing shell by responsibility
- keep the content-heavy landing layout server-rendered
- move only the about-overlay toggle and scroll-lock behavior into a small client island
- keep `GameViewportClient` as the only major interactive child in the landing shell

#### Add explicit experience modes
- add `experience: 'preview' | 'full'` to:
  - `GameViewportClient`
  - `PlayPage`
  - `GameContent`
- use:
  - `preview` for `/`, `/map-game`, and `/:quizId`
  - `full` for `/play`

#### Define the preview contract
- the preview remains playable
- the preview uses lighter data and lighter visuals
- the preview does not eagerly mount secondary overlays or nonessential animation systems

### C. Split the game bundle by interaction instead of by route

#### Convert modal-heavy features to on-demand chunks
- replace eager imports in `src/components/game/GameContent.tsx` with `next/dynamic` for:
  - `SettingsPanel`
  - `LeaderboardModal`
  - `ProfilePanel`
  - `GameCompleteModal`
- only mount each chunk after its related state becomes active
- provide local fallback UI for first-open while the chunk loads

#### Defer decorative backgrounds
- keep a static gradient or minimal visual fallback on first render
- in `preview` mode:
  - do not eagerly mount `StarfieldBackground`
  - do not eagerly mount `ShootingStarsBackground`
- in `full` mode:
  - mount those effects only after globe readiness or idle time

#### Preserve existing on-demand celebratory effects
- keep `canvas-confetti` dynamically imported
- do not move it into the initial route graph

### D. Remove Framer Motion from the always-mounted path

#### Keep Motion only where it earns its weight
- convert always-mounted micro-interactions to CSS or Web Animations:
  - floating control buttons
  - progress transitions
  - simple feedback fades or transforms
- keep Framer Motion only inside lazily loaded modal/overlay chunks

#### Expected outcome
- the initial game shell stops paying for a large animation library before any overlay is opened
- modal transitions remain rich where they are most visible

### E. Remove Supabase from the initial route graph

#### Lazy-load online feature modules
- replace top-level imports with inline `import()` inside the exact interaction path that needs them:
  - friend challenge fetch in `PlayPage`
  - challenge creation in settings and game-complete flows
  - score submission in the game-complete flow
  - leaderboard fetch when the leaderboard modal opens

#### Keep the deployment model unchanged
- retain the current client-side Supabase approach
- do not introduce server actions or route handlers in this pass because the app still uses static export

#### Required invariant
- no landing or initial `/play` route chunk includes `@supabase/supabase-js`

### F. Refactor world-map data into tiered public artifacts

#### Move source data out of `public/`
- relocate the raw source file from:

```text
public/data/world.geo.json
```

- to a non-shipped source location such as:

```text
data-src/world.geo.json
```

#### Replace the current optimization script with a packer
- update `scripts/simplify-world-geojson.js` or replace it with a new build script that emits:
  - `public/data/world.meta.json`
  - `public/data/world.preview.geo.json`
  - `public/data/world.full.geo.json`

#### Artifact responsibilities
- `world.meta.json`
  - region id
  - display name
  - continent
  - population
  - precomputed centroid
  - difficulty eligibility or threshold-ready metadata
- `world.preview.geo.json`
  - aggressively simplified geometry for landing previews
- `world.full.geo.json`
  - higher-fidelity geometry for `/play`

#### Important default
- do not shard by continent in this pass
- with static export, continent-specific geometry files could multiply shipped bytes and make the public artifact set larger overall

### G. Move gameplay boot to metadata instead of geometry

#### Rewrite the data loader surface
- refactor `src/data/maps.ts` to expose typed functions such as:
  - `loadWorldMeta()`
  - `loadWorldGeometry(tier)`
  - `getFilteredRegionsFromMeta()`
  - `getCentroidByRegion()`

#### Stop deriving game state from polygon geometry
- update `src/hooks/game/useGameState.ts` to build region lists from metadata only
- update `src/components/globe/Globe.tsx` to use precomputed centroids instead of calculating them from polygon coordinates at runtime

#### Route-to-data contract
- `preview` mode loads:
  - `world.meta.json`
  - `world.preview.geo.json`
- `full` mode loads:
  - `world.meta.json`
  - `world.full.geo.json`

### H. Keep route analysis in the implementation loop

#### After each major phase, rerun
- `npm run typecheck`
- `npm run build`
- `npm run analyze:bundle`
- public-asset byte reporting

#### Inspect these import chains specifically
- why landing routes still pull `GameContent` dependencies
- whether any Framer Motion code remains in always-mounted client chunks
- whether any Supabase code remains in initial route chunks
- whether the preview mode still accidentally loads full geometry

---

## 4. Public Interfaces And Type Changes

### Component prop changes
- `GameViewportClientProps` gains:

```ts
experience: 'preview' | 'full'
```

- `PlayPageProps` gains:

```ts
experience: 'preview' | 'full'
```

- `GameContentProps` gains:

```ts
experience: 'preview' | 'full'
```

### Data-layer additions
- add a typed world-region metadata interface
- add a geometry-tier type:

```ts
type WorldGeometryTier = 'preview' | 'full'
```

- expose typed caches/loaders for metadata and geometry separately

### Behavioral contract
- landing routes can remain interactive while consuming lighter geometry and lighter visuals than `/play`

---

## 5. Test Cases And Verification

### Build and correctness
- `npm run typecheck`
- `npm run build`

### Route behavior
- `/` renders a live preview and landing content
- `/map-game` renders a live preview and landing content
- one quiz route such as `/world-map-quiz` renders a live preview and route-specific content
- `/play` renders the full experience

### Entry-path checks
- `/play?daily=true` still resolves the daily challenge correctly
- `/play?challenge=...` still loads a friend challenge correctly
- free-play query params still drive ruleset setup correctly

### Lazy-loading checks
- first open of Settings works
- first open of Leaderboard works
- first open of Profile works
- first render of Game Complete works
- score submission still works
- challenge creation still works

### Data-loading checks
- landing routes request `world.preview.geo.json`
- landing routes do not request `world.full.geo.json`
- `/play` requests `world.full.geo.json`
- no runtime path requests the raw source GeoJSON

### Static output checks
- exported output no longer contains the raw world source file
- `public/data/` only contains the intended runtime artifacts

### Bundle verification
- compare analyzer output before and after
- confirm `@supabase/supabase-js` is absent from initial route chunks
- confirm Framer Motion is absent from always-mounted landing and game-shell chunks

---

## 6. Risks And Defaults

### Risk: live preview still keeps landing routes heavy
Mitigation: use explicit `preview` mode with lighter geometry, lighter visuals, and deferred overlays.

### Risk: data refactor grows complexity too early
Mitigation: keep the artifact model to metadata + preview geometry + full geometry only. Do not add continent shards yet.

### Risk: modal lazy-loading causes visible first-open lag
Mitigation: preload a modal chunk on the first related hover, focus, or idle period if needed, but only after the main route is settled.

### Risk: bundle work regresses gameplay behavior
Mitigation: keep the current gameplay reducer and rules unchanged. Refactor loading boundaries and data sources, not scoring logic.

### Default choices for this pass
- keep static export
- keep the globe library
- keep the live landing preview
- prioritize initial route graph reduction before deeper micro-optimizations inside the globe renderer

---

## 7. Exit Criteria

This plan is complete when:
- the app has a green build and typecheck baseline
- bundle analysis is repeatable and budgeted
- landing routes ship materially less JS while keeping a live preview
- modal and online features are removed from the initial route graph
- the raw source GeoJSON is no longer publicly shipped
- map metadata and geometry are split into runtime artifacts with separate preview and full tiers
- measured route and asset sizes meet the stated reduction targets

---

## Reference

- Next.js package bundling and analyzer guidance:
  - https://nextjs.org/docs/app/guides/package-bundling
