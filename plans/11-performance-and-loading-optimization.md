# Performance And Loading Optimization Plan

**Recommendation:** Optimize Mappil in three layers: faster perceived startup, lighter data loading, and steadier runtime rendering. The biggest win is to stop making the entire experience wait on the heaviest assets before users see anything useful.

**Why this approach:** The current startup path in `src/App.tsx` eagerly preloads the globe component and fetches `public/data/world.optimized.geo.json` before rendering `GameContent`. The optimized world file is still about `1.3M`, `loadGeoJson()` parses it on the main thread, and the app holds users behind a full-screen loading overlay until both data and globe setup are ready. On weaker devices this creates a slow first impression even before gameplay quality is considered.

**Primary v1 goal:** Reduce time-to-useful-screen and keep frame pacing stable on mobile and desktop without rewriting the app stack.

**Scope rule for v1:** Focus on the current Create React App plus `react-globe.gl` architecture. Do not assume a framework migration as the first performance fix.

---

## 1. Current Performance Snapshot

### Startup characteristics today
- `src/App.tsx` calls `preloadGlobe()` immediately
- `src/App.tsx` waits for `loadGeoJson()` before rendering `GameContent`
- `src/components/LoadingOverlay.tsx` blocks the full viewport until the globe is ready
- `src/data/maps.ts` streams and then fully parses the GeoJSON on the main thread
- `public/data/world.optimized.geo.json` is still large at roughly `1.3M`

### Runtime characteristics today
- `src/components/Globe.tsx` renders the interactive globe at full viewport size
- resize handling updates React state on every viewport resize event
- the component traverses the scene to patch polygon materials after relevant updates
- the renderer pixel ratio is capped, which is already a good safeguard
- label, color, and altitude callbacks run across the polygon set each render path

### Likely consequence
The first experience is gated by heavy data and rendering work, and runtime headroom on mobile is thinner than it needs to be.

---

## 2. Recommendation

### Chosen optimization strategy
Prioritize:
- perceived performance first
- data size and parsing second
- runtime rendering stability third

### Why perceived performance matters most
Even a technically acceptable total load time can feel bad when the app shows only a blocking loader. The current startup path hides the product until almost everything is ready.

### Why not start with micro-optimizations
Do not begin by shaving tiny amounts off component re-renders while the app still waits on a large GeoJSON parse and a full-screen blocking overlay. Attack the largest startup bottlenecks first.

---

## 3. Startup Optimization

### A. Split metadata from geometry

#### [NEW] metadata file strategy

Introduce a lightweight metadata file separate from the full polygon geometry.

Recommended split:
- `world.optimized.meta.json` for names, continents, population, centroids, and difficulty tags
- `world.optimized.geo.json` for full polygon geometry only

### Why this helps
The app currently needs the full geometry file before it can even choose a starting region. With a metadata file, Mappil can:
- initialize the game state earlier
- show the target region and basic UI sooner
- begin loading geometry in parallel rather than serially blocking on it

### B. Render the shell earlier

#### [MODIFY] `src/App.tsx`

Move from:
- wait for data
- then render game shell

To:
- render shell as soon as minimal metadata is ready
- lazy-load the heavy globe and geometry behind it

Recommended user-visible behavior:
- fast transition from blank page to branded shell
- progress labels for “Preparing regions” and “Loading globe”
- ability to read onboarding or game context sooner

### C. Make the loading overlay smarter

#### [MODIFY] `src/components/LoadingOverlay.tsx`

Instead of a percentage-only spinner, show staged progress:
- initializing app
- loading region metadata
- preparing globe
- finalizing interaction

This improves perceived responsiveness even before raw speed improves.

---

## 4. Data Optimization

### A. Reduce geometry further

#### [MODIFY] `scripts/simplify-world-geojson.js`

Audit the existing optimization script and push the data file further where it is safe.

Recommended checks:
- remove unused properties
- lower coordinate precision carefully
- simplify high-vertex polygons further where visual quality still holds
- exclude features or fields not used by runtime logic

### B. Precompute expensive metadata

#### [NEW] offline preprocessing step

Move more one-time work out of runtime:
- centroids
- pack-specific labels
- difficulty tags
- filtered region lists for common rulesets if useful

Right now `featureCentroid()` is computed lazily from geometry. That is acceptable, but it is still runtime work derived from the heavy polygon file. Precomputing this in build tooling is cleaner.

### C. Version and cache data explicitly

Use versioned static data files so the browser can cache them aggressively.

Recommended direction:
- hashed or versioned filenames
- immutable cache headers for data assets
- explicit invalidation when data changes

### D. Validate compression
Confirm the deployed host serves large static assets with Brotli or gzip.

If compression is already active, document it. If not, fix that before chasing smaller runtime wins.

---

## 5. Runtime Rendering Optimization

### A. Quality tiers

#### [MODIFY] `src/components/Globe.tsx`

Formalize device-sensitive quality levels instead of scattering one-off heuristics.

Recommended tier inputs:
- viewport width
- coarse pointer
- device pixel ratio
- optional reduced-motion preference

Recommended tier outputs:
- pixel ratio cap
- atmosphere enabled or toned down
- polygon curvature resolution
- auto-rotate behavior
- optional label richness

### B. Avoid unnecessary scene traversal

#### [MODIFY] `src/components/Globe.tsx`

`patchPolygonMaterials()` currently traverses the scene after several updates. Audit whether it can run:
- once on globe ready
- only when polygon objects are recreated

Avoid full scene traversal on updates where only region state changed.

### C. Pause work when not visible

Add document visibility handling to:
- pause auto-rotate
- reduce animation work
- avoid unnecessary updates while the tab is hidden

### D. Protect mobile frame pacing

Recommended mobile-specific safeguards:
- lower effective quality on coarse pointers
- reduce atmospheric effects if needed
- avoid extra overlay animations during active globe interaction

---

## 6. State And React Work

### A. Keep animation loops out of React state
Continue the current pattern of imperative globe control and avoid introducing frame-driven React state updates.

### B. Re-check resize handling

#### [MODIFY] `src/components/Globe.tsx`

Current resize logic is already debounced with `requestAnimationFrame`, which is good. Still verify:
- whether the globe needs full width and height state updates on every resize
- whether some updates can be deferred until resize settles on mobile orientation changes

### C. Memoization audit
The globe component already uses `memo`, `useMemo`, and `useCallback` in several places. Audit whether the expensive props actually stay referentially stable and whether `regionsFound` updates trigger broader work than necessary.

Do not add memoization indiscriminately. Keep only what materially protects expensive paths.

---

## 7. Gameplay-Adjacent Performance

### A. Feedback effects

#### [MODIFY] `src/components/FeedbackOverlay.tsx`
#### [MODIFY] `src/components/GameCompleteModal.tsx`

Confetti and celebratory effects should scale with device capability.

Recommended behavior:
- full richness on desktop
- reduced particle counts on coarse-pointer devices
- reduced or disabled effects under reduced-motion preferences

### B. Loading vs interaction contention
Avoid doing heavy non-essential work during the same startup window as:
- GeoJSON parsing
- globe initialization
- onboarding rendering if added later

Sequence tasks so the first interactive experience wins.

---

## 8. Instrumentation And Measurement

### A. Performance marks

#### [NEW] lightweight performance instrumentation

Add marks for:
- app start
- metadata ready
- geometry ready
- globe ready
- first interactive frame
- first region prompt shown

### B. Runtime metrics
Track:
- median time to first useful screen
- median time to globe ready
- median time to first correct answer
- dropped-frame risk on mobile during active play

### C. Device segmentation
Report performance separately for:
- mobile
- desktop
- coarse-pointer devices
- low-memory browsers if detectable

Without segmentation, averages may hide the devices that need the most help.

---

## 9. Recommended File Changes

### [MODIFY] `src/App.tsx`
Split startup into lighter early shell rendering and later heavy asset readiness.

### [MODIFY] `src/components/LoadingOverlay.tsx`
Stage-based, less opaque loading treatment.

### [MODIFY] `src/data/maps.ts`
Support metadata-first loading and cache-aware access.

### [MODIFY] `src/components/Globe.tsx`
Formal quality tiers, visibility handling, and scene-update auditing.

### [MODIFY] `scripts/simplify-world-geojson.js`
Precompute more metadata and strip more unused payload.

### [NEW] optional `src/lib/performance.ts`
Central performance marks and helper utilities.

---

## 10. Implementation Order

1. Instrument the current startup path so improvements can be measured.
2. Split metadata from geometry and initialize gameplay state from metadata first.
3. Render a useful shell earlier in `App.tsx`.
4. Improve `LoadingOverlay.tsx` to reflect staged readiness.
5. Tighten GeoJSON preprocessing and precompute metadata offline.
6. Formalize runtime quality tiers in `Globe.tsx`.
7. Audit scene traversal, hidden-tab behavior, and overlay effect intensity.

---

## 11. Verification

### Manual checks
- the user sees useful UI earlier than before
- the game can choose a target region before the full polygon file is parsed
- the globe still initializes correctly after metadata-first startup
- mobile frame pacing remains stable during drag, zoom, and skip fly-to
- loading progress reflects real startup stages rather than misleading percentages

### Regression focus
Pay particular attention to:
- metadata and geometry getting out of sync
- the shell rendering before required game state exists
- globe quality dropping too far on desktop
- stale cached data after asset version changes

### Performance targets
Define concrete targets before implementation, for example:
- meaningful UI visible noticeably sooner than today
- globe-ready time reduced on mobile
- no obvious frame drops during normal interaction on modern phones

---

## 12. Risks And Mitigations

### Risk: metadata and geometry duplication increases maintenance cost
Mitigation: generate both from one source in a shared build step.

### Risk: early shell rendering makes the app feel interactive before it truly is
Mitigation: distinguish clearly between shell-ready and globe-ready states in the UI.

### Risk: aggressive geometry simplification hurts map quality or click accuracy
Mitigation: simplify iteratively and validate against small or complex regions.

### Risk: optimization work becomes a broad rewrite
Mitigation: keep the plan grounded in the current CRA and `react-globe.gl` architecture and target the largest bottlenecks first.

---

## 13. Exit Criteria

This plan is complete when:
- Mappil shows meaningful UI earlier in the startup path
- heavy geometry is no longer the first gating dependency for the whole experience
- data payloads and preprocessing are tighter and more intentional
- runtime globe performance remains stable on desktop and mobile
- performance gains are measurable rather than anecdotal
