# Additional Map Modes And Content Expansion Plan

**Recommendation:** Build a generalized map-pack and prompt-mode architecture before adding more content. Mappil should expand by reusable data packs and quiz modes, not by bolting more special cases onto the current world-countries-only path.

**Why this approach:** The README currently lists `World Countries`, `US States`, and `UK Administrative Regions`, but the running code path in `src/data/maps.ts` only loads `public/data/world.optimized.geo.json`. The current game state, filtering logic, and globe rendering are all effectively hardwired to world-country data. If Mappil adds more content without first abstracting the dataset layer, every new mode will multiply complexity.

**Primary v1 goal:** Make it practical to add new geographic content packs and a few high-signal prompt modes without rewriting the app every time.

**Scope rule for v1:** Prioritize a clean content architecture plus two or three strong new experiences. Do not try to ship every geography quiz idea at once.

---

## 1. Current Gap Snapshot

### What the app currently assumes
- `src/data/maps.ts` fetches only `world.optimized.geo.json`
- region filtering is continent-based and population-threshold-based
- `GameState` uses a single `regionToFind` string
- `src/components/Globe.tsx` reads `feature.properties.name_long` directly
- centroid and hover logic are tuned to country polygons on a globe

### What this blocks
- US states and UK regions as first-class supported packs
- non-country prompt modes like capitals or flags
- denser regional content where a globe may not be the best renderer
- dataset-specific difficulty logic

### Likely consequence
New content will become brittle unless Mappil stops treating “world countries on a globe” as the only quiz shape.

---

## 2. Recommendation

### Chosen implementation
Expand in two layers:
- map packs: what geography set is being played
- prompt modes: what clue the player receives for that set

### Recommended first map packs
- `World Countries`
- `US States`
- `UK Administrative Regions`

These are already the most natural next packs because the README signals them and they fit the current core interaction model.

### Recommended first prompt modes
Start with prompt modes that still end in clicking a region on a map:
- region name to map click
- capital name to map click
- flag to map click

These reuse the current interaction loop better than typed answers or multiple-choice overlays.

### Why not add everything to the globe
Do not assume every future geography set belongs on the 3D globe. Dense regional content such as UK administrative areas may work better in a flat projected map view.

---

## 3. Content Architecture

### A. Map-pack abstraction

#### [NEW] `src/types/mapPack.types.ts`

Define a top-level content identity such as:

```ts
type MapPackId =
  | 'world-countries'
  | 'us-states'
  | 'uk-admin-regions';
```

Each pack should define:
- display name
- data file path
- geometry type expectations
- region label field
- optional grouping metadata
- default renderer

### B. Prompt-mode abstraction

#### [MODIFY] `src/types/game.types.ts`

Add a prompt or quiz mode concept separate from `GameMode`.

Recommended distinction:
- `GameMode` describes run length or pacing
- `PromptMode` describes the clue type

Example direction:

```ts
type PromptMode =
  | 'region-name'
  | 'capital-name'
  | 'flag'
  | 'reverse-identify';
```

### C. Dataset registry

#### [NEW] `src/data/mapPackRegistry.ts`

Create one registry that describes each pack:
- data source
- feature accessors
- metadata fields
- supported prompt modes
- supported renderer

This should become the single source of truth for content expansion.

---

## 4. Data Strategy

### A. Separate geometry from metadata

#### [NEW] pack-specific data files

Use pack-specific files such as:
- `public/data/world-countries.geo.json`
- `public/data/us-states.geo.json`
- `public/data/uk-admin-regions.geo.json`

And metadata companions such as:
- `public/data/world-countries.meta.json`
- `public/data/us-states.meta.json`
- `public/data/uk-admin-regions.meta.json`

Metadata should hold:
- display names
- aliases
- abbreviations
- capitals
- flags or asset references
- difficulty tags

### B. Stop hardcoding `name_long`

#### [MODIFY] `src/components/Globe.tsx`
#### [MODIFY] `src/data/maps.ts`

Replace direct `properties.name_long` assumptions with pack-specific accessors from the registry.

### C. Pack-specific filtering
Difficulty should stop being global population-threshold-only.

Recommended direction:
- world countries: population thresholds remain a valid heuristic
- US states: use area, population, and recognizability tags
- UK regions: use curated difficulty tiers rather than population alone

This avoids awkward difficulty behavior on smaller or denser maps.

---

## 5. Renderer Strategy

### A. Renderer abstraction

#### [NEW] `src/types/renderer.types.ts`

Recommended renderer identities:
- `globe`
- `flat-map`

### B. Globe-friendly packs
Best fit for `globe`:
- world countries
- some large-scale continent or country-level packs

### C. Flat-map-friendly packs
Better fit for `flat-map`:
- US states
- UK administrative regions
- any small, dense, or highly overlapping regional pack

### D. Why this matters
Forcing every map onto the globe would make small-region accuracy and UX worse, not better.

If a flat map is not feasible in the first release, prioritize packs that still play well on the globe and defer the denser ones until the renderer abstraction exists.

---

## 6. Recommended Expansion Roadmap

### Phase 1: Data architecture and world-pack cleanup
- introduce map-pack registry
- refactor current world countries data into the new pack model
- keep the current name-to-region click loop intact

### Phase 2: Ship the promised next packs
- add US states
- add UK administrative regions if the renderer experience is good enough

This phase should also resolve the current README-to-code mismatch.

### Phase 3: Add prompt-mode variety
- capital name to region
- flag to region

These add meaningful replay value without changing the core answer mechanic.

### Phase 4: Consider new interaction families
- reverse identify
- typed answers
- multiple choice
- map labeling practice

Only do this after the pack architecture is stable.

---

## 7. UI And Navigation

### A. Pack selection

#### [MODIFY] `src/components/SettingsPanel.tsx`

Add a `Map Pack` selector above or near existing continent and difficulty controls.

### B. Prompt-mode selection
Add a `Prompt` selector that only shows modes supported by the active pack.

### C. Pack-aware labels

#### [MODIFY] `src/components/HUD.tsx`

Update copy so the HUD and completion flow can say:
- `Find State`
- `Find Region`
- `Find Country`

based on the active pack.

### D. Completion screen

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Show:
- map pack
- prompt mode
- ruleset summary

This becomes more important as the number of playable configurations grows.

---

## 8. Technical Changes By File

### [MODIFY] `src/data/maps.ts`
Turn this into a pack-aware loader rather than a single hardcoded world-data module.

### [NEW] `src/data/mapPackRegistry.ts`
Central pack definitions and accessors.

### [MODIFY] `src/hooks/useGameState.ts`
Accept `mapPack` and `promptMode` as part of run configuration.

### [MODIFY] `src/types/game.types.ts`
Add `mapPack`, `promptMode`, and pack-aware state typing.

### [MODIFY] `src/components/Globe.tsx`
Stop assuming country-specific property names and prepare for pack-aware geometry access.

### [NEW] optional `src/components/FlatMap.tsx`
If UK regions or US states need a denser renderer, isolate that work in a dedicated component rather than overloading `Globe.tsx`.

---

## 9. Content Prioritization Guidance

### Ship what is already implied publicly
Because the README already names US states and UK administrative regions, those should be the highest-priority content additions once the architecture is ready.

### Prefer quality over quantity
It is better to ship:
- excellent world countries
- excellent US states
- one or two strong prompt modes

than to ship a dozen thin content packs with inconsistent UX.

### Keep educational coherence
Each added pack or prompt mode should help players learn something real, not just inflate the mode count.

---

## 10. Analytics And Measurement

### Track content adoption
Add events for:
- map pack selected
- prompt mode selected
- run started by pack and prompt
- run completed by pack and prompt
- replay rate by pack and prompt

### Primary success metrics
Track:
- which packs are actually played
- which prompt modes drive repeat runs
- whether dense packs produce more abandonment
- whether added content increases weekly return rate

---

## 11. Implementation Order

1. Introduce map-pack registry and pack-aware data loading.
2. Migrate world countries onto the new abstraction.
3. Add pack selection to settings and run config.
4. Add US states as the first new pack.
5. Decide whether UK administrative regions need a flat-map renderer before shipping them.
6. Add one new prompt mode such as capitals or flags.
7. Instrument pack and prompt adoption.

---

## 12. Verification

### Manual checks
- switching map packs actually swaps the playable data source
- pack-specific labels and prompts update everywhere in the UI
- world countries still behave exactly as before after migration
- difficulty rules remain sensible for each pack
- leaderboards and profile rulesets can distinguish packs cleanly

### Regression focus
Pay particular attention to:
- hardcoded `name_long` assumptions surviving the refactor
- renderer choice being wrong for dense packs
- difficulty heuristics producing trivial or impossible runs on new content
- the pack architecture becoming too abstract before the second pack ships

---

## 13. Risks And Mitigations

### Risk: renderer complexity balloons
Mitigation: keep the pack registry separate from renderer choice and add `flat-map` only when a pack clearly needs it.

### Risk: prompt-mode expansion outpaces data quality
Mitigation: add prompt modes only when the metadata for that pack is complete and reliable.

### Risk: new packs feel inconsistent with the original game
Mitigation: preserve the core flow of prompt, map search, tap, feedback, and replay.

### Risk: README and live product stay out of sync
Mitigation: use this plan to either ship the publicly listed packs or update public claims until they exist.

---

## 14. Exit Criteria

This plan is complete when:
- Mappil has a reusable map-pack architecture
- world countries are migrated onto that architecture cleanly
- at least one additional pack can be added without another special-case rewrite
- pack-aware prompt modes are possible
- content expansion becomes a scalable product path rather than a one-off refactor
