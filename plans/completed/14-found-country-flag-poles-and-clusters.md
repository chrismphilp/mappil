# Found Country Flag Poles And Clusters Plan

**Recommendation:** Add a dedicated found-country marker layer on top of the existing globe, using real flag images mounted on small flag-poles for normal countries and curated cluster layouts for dense microstate regions. Keep the current polygon click gameplay intact and treat the flags as celebratory found-state markers, not new interaction targets.

**Why this approach:** `src/components/globe/Globe.tsx` currently communicates progress only through polygon color, altitude, and a tooltip-style label. There is no marker layer, no flag asset pipeline, and no per-country anchor metadata beyond a runtime centroid derived from geometry. The loaded world dataset also contains `242` features, including microstates and territories, while `src/data/maps.ts` and the GeoJSON retain only `name_long`, `pop_est`, and `continent`. That means a good flag implementation needs both a new metadata layer and a deliberate cluster strategy rather than a simple “draw one image at each centroid” pass.

**Primary v1 goal:** Every found country should visibly earn a small flag on the globe without making Europe, the Gulf, island chains, or other dense regions unreadable on desktop or mobile.

**Scope rule for v1:** Stay within the existing `react-globe.gl` architecture. Do not rewrite the globe renderer or make flags the primary hit area for answering questions.

---

## 1. Current Implementation Snapshot

### What the globe does today
- `src/views/app/PlayPage.tsx` preloads the globe and GeoJSON, then mounts `GameContent`
- `src/components/game/GameContent.tsx` passes `regionsFound`, `flyToRegion`, and `onRegionClick` into `Globe`
- `src/components/globe/Globe.tsx` renders only polygon geometry
- found regions are indicated by:
  - green polygon cap color
  - higher polygon altitude
  - a tooltip label from `polygonLabel`
- skipped regions trigger camera movement via `pointOfView`

### What data exists today
- `src/data/maps.ts` loads only `public/data/world.optimized.geo.json`
- both `public/data/world.optimized.geo.json` and `public/data/world.geo.json` only expose:
  - `name_long`
  - `pop_est`
  - `continent`
- `Globe.tsx` computes centroids lazily at runtime from polygon coordinates

### What this means for a flag feature
- there is no stable flag asset identifier such as ISO code
- there is no curated marker anchor for awkward or fragmented shapes
- there is no cluster metadata for small neighboring countries
- a naive centroid-only solution will overlap badly in dense areas

---

## 2. Product Direction

### Chosen visual model
Use two marker modes:
- `direct pole`: a normal found-country flag mounted above the country anchor
- `cluster pole`: a grouped set of mini flags arranged around a shared cluster hub with leader lines back to the true country anchors

### Why this is the right fit
- it preserves the current green “found” polygon treatment
- it gives players a stronger reward than a tooltip
- it avoids making tiny countries illegible
- it works with the current library instead of forcing a custom Three.js rewrite

### Important guardrail
Do not make the flag markers intercept map clicks in v1. The game already depends on polygon hover plus click/tap handling, and a decorative layer that steals pointer events would create regressions immediately.

---

## 3. Recommended v1 Marker Design

### A. Direct flag-pole marker

For normal countries:
- anchor the pole to a country-specific marker point
- render a slim pole with a small rectangular flag image
- keep the marker slightly above the globe surface
- keep the flag readable but compact:
  - desktop target: roughly `18-22px` wide
  - mobile target: roughly `14-18px` wide
- keep a thin light border and subtle shadow so the flag stays legible against the dark globe

### B. Marker behavior

- only render flags for `regionsFound`
- keep current polygon highlighting so found states remain visible even when the flag is behind the globe
- hide or fade flag markers when they rotate behind the globe
- keep markers non-interactive with `pointer-events: none`
- use a slightly smaller flag tier as the total number of found countries grows during long runs

### C. Why not use polygon textures

Do not try to texture country polygons with their flags:
- it does not satisfy the “little flag-pole” request
- it is much harder to read on small countries
- it would look distorted on irregular shapes
- it does not solve clustered microstates at all

---

## 4. Cluster Design For Small And Dense Countries

### Chosen cluster treatment
Use curated cluster hubs placed in nearby open space or visually calmer areas. Each found country in the cluster gets:
- its own mini flag
- its own fixed slot in the cluster layout
- a thin leader line from the real country anchor to the displayed flag slot

### Recommended cluster layout style

Use a small fan or arc, not a pile:
- `2-3` countries: shallow fan
- `4-6` countries: semi-circle
- `7+` countries: two-row arc or stepped bouquet

This keeps each found country individually visible while preventing the center of the cluster from becoming a blur.

### Why curated clusters beat pure heuristics in v1

Pure size- and distance-based logic will still produce ugly results for islands, enclaves, and long thin coastlines. v1 should use:
- a generated default anchor for most countries
- a curated override table for known problem regions

This is simpler to ship and much easier to review visually.

### Initial hotspot groups to design deliberately

Based on the current geometry and centroid spacing, the first curated clusters should include:
- western and central Europe:
  - Luxembourg, Belgium, Netherlands
  - Monaco, Liechtenstein, Andorra, San Marino
  - Malta as an offset micro-island marker
- Gulf region:
  - Bahrain, Qatar, Kuwait, United Arab Emirates
- eastern Mediterranean and Levant:
  - Israel, Palestine, Lebanon, Cyprus or Northern Cyprus if overlap proves messy
- maritime Southeast Asia:
  - Singapore
  - Brunei Darussalam
  - nearby small-island states if the visual pass shows collisions
- Caribbean micro-islands:
  - Antigua and Barbuda
  - Saint Kitts and Nevis
  - Dominica
  - Saint Lucia
  - Barbados
  - Saint Vincent and the Grenadines
  - Grenada
  - Trinidad and Tobago
- Pacific microstates:
  - Nauru
  - Tuvalu
  - Marshall Islands
  - Federated States of Micronesia
  - Palau
  - Kiribati
  - Samoa
  - Tonga

### Mobile-specific expectation

Cluster layouts should stay individual, but tighten spacing and shrink flags slightly on narrow viewports. Do not replace multiple found-country flags with a single count bubble in v1, because the request is to show the country flag for each country found.

---

## 5. Data And Asset Architecture

### A. Add a dedicated flag marker manifest

#### [NEW] `src/data/foundRegionFlags.ts`

Create a manifest keyed by `name_long` with fields along these lines:

```ts
type FoundRegionFlagMarker = {
  region: string;
  flagSrc: string;
  anchorLat: number;
  anchorLng: number;
  altitude: number;
  mode: 'direct' | 'cluster';
  clusterId?: string;
  clusterSlot?: number;
  poleHeight?: number;
  scale?: 'sm' | 'md';
};
```

This file should be the source of truth for:
- which flag image to use
- where the marker should anchor
- whether the country uses direct or clustered presentation

### B. Add explicit cluster configuration

#### [NEW] `src/data/foundRegionFlagClusters.ts`

Store cluster-level layout metadata separately:
- `clusterId`
- hub latitude and longitude
- layout type:
  - `fan`
  - `arc`
  - `two_row_arc`
- slot ordering
- optional leader-line bend or offset data

That keeps the per-country manifest simple while making cluster tuning manageable.

### C. Store flag assets locally

#### [NEW] `public/flags/...`

Vendor the actual flag images into the repo:
- prefer SVG where possible for crisp small rendering
- keep assets local rather than depending on a remote CDN
- use a predictable naming scheme and map every game region explicitly

### D. Do not rely on name inference alone

Because the dataset includes name variants and territories, the manifest should use explicit mapping for entries such as:
- `Czech Republic`
- `Kingdom of eSwatini`
- `Republic of Cabo Verde`
- `Côte d'Ivoire`
- `Russian Federation`
- `Brunei Darussalam`
- `Dem. Rep. Korea`
- territories and partial-recognition states in the dataset

This avoids broken flags caused by mismatched provider naming conventions.

### E. Add a graceful fallback

If an asset is missing, render a plain pennant with initials rather than a broken image icon. That protects the UX while the manifest is being completed.

---

## 6. Rendering Strategy

### Chosen implementation path

Use the layers already supported by the installed `react-globe.gl` stack:
- `htmlElementsData` for the visible flag-pole marker DOM
- `pathsData` or a lightweight custom layer for leader lines in clustered layouts

### Why HTML elements are the best v1 choice

They make it easy to:
- render real flag images
- style a pole with simple CSS
- control visibility behind the globe
- iterate on cluster layouts quickly

### Why not start with custom 3D flag meshes

Avoid true waving mesh flags in v1:
- more rendering complexity
- more code for textures and object updates
- more difficult cluster layout iteration
- limited upside for a first usable version

### Recommended component split

#### [NEW] `src/components/globe/foundFlags.ts`

Move marker derivation into a helper module that:
- maps `regionsFound` to marker data
- resolves direct versus clustered layout
- returns stable arrays for globe layers

#### [MODIFY] `src/components/globe/Globe.tsx`

Add:
- `htmlElementsData`
- `htmlLat`
- `htmlLng`
- `htmlAltitude`
- `htmlElement`
- `htmlElementVisibilityModifier`

Optionally add:
- `pathsData` for leader lines from true anchors to cluster slots

### Keep the current gameplay pipeline intact

Do not replace:
- polygon hover tracking
- pointer-up click logic
- fly-to skipped country behavior

The new layers should sit beside the current polygon logic, not rewrite it.

---

## 7. Geometry And Anchor Strategy

### A. Keep generated defaults for most countries

The current centroid logic is a useful starting point. Use it to generate default anchors for:
- large countries
- visually isolated countries
- island countries with no nearby overlap

### B. Override bad anchors explicitly

Some countries will need hand-tuned marker points because centroids are not visually helpful for:
- thin countries
- fragmented island groups
- enclave-style microstates
- shapes whose centroid lands in crowded land or water

### C. Move anchor ownership out of `Globe.tsx`

`Globe.tsx` should stop being the source of truth for centroids. It should consume prepared marker metadata instead. That makes the visual system testable and keeps the globe component from accumulating more geography-specific logic.

### D. Optional build-time helper

#### [NEW] `scripts/build-found-flag-markers.js`

If the data entry becomes tedious, add a small script that:
- reads the GeoJSON
- generates default centroid anchors
- writes starter marker records

Then keep manual overrides in checked-in metadata.

---

## 8. Implementation Roadmap

### Phase 1: Metadata and proof of concept
- add local flag assets for a subset of countries
- add the marker manifest shape
- render one direct pole and one clustered example in `Globe.tsx`
- confirm markers hide correctly behind the globe
- confirm they do not break click/tap selection

### Phase 2: Ship the direct marker system
- generate or enter default markers for all supported regions
- render direct found flags for all non-cluster countries
- add responsive size tiers and found-count scale reduction
- keep the current polygon highlight behavior

### Phase 3: Ship the clustered hotspot layouts
- add curated cluster configs
- add leader lines
- test the cluster fan layouts at common zoom levels
- tune spacing for desktop and mobile

### Phase 4: Polish and safety work
- add missing-asset fallback pennants
- tune z-index, shadows, and visibility transitions
- reduce any rendering churn from marker regeneration
- document how to add a new region flag and cluster override

---

## 9. QA And Review Checklist

### Functional checks
- finding a country adds its flag marker immediately
- flags never intercept answer clicks
- skipped-country fly-to still works
- continent and difficulty filters still behave correctly
- full-game runs remain stable as marker count grows

### Visual checks
- direct markers feel attached to the globe
- flags remain readable against the dark ocean and night-sky backdrop
- markers hide cleanly when they rotate behind the globe
- cluster fans stay legible in:
  - Europe
  - Gulf region
  - Caribbean
  - Southeast Asia
  - Pacific islands

### Performance checks
- no major regression during rotation or zoom
- no excessive DOM churn as `regionsFound` grows
- mobile viewport remains smooth with many found markers

---

## 10. Risks And Open Decisions

### A. Dataset identity mismatch

The README says “230 Countries,” but the active GeoJSON contains `242` features and includes territories or special-status regions. Before implementation, decide whether the flag system should cover:
- every playable feature in the dataset
- only sovereign-country-style entries

The safer engineering choice is to support every playable feature explicitly.

### B. Territory flag policy

Some regions in the dataset may need:
- their own territorial flag
- the sovereign state flag
- or a product decision if the gameplay wording is ambiguous

This needs to be settled while building the manifest.

### C. Endgame density

A full run can produce a very crowded globe. The v1 answer should be:
- keep every found flag visible
- taper size modestly as count rises
- rely on curated clusters where density is worst

Do not silently hide a large share of found-country markers after the user has earned them.

---

## 11. Concrete File Plan

### New files
- `src/data/foundRegionFlags.ts`
- `src/data/foundRegionFlagClusters.ts`
- `src/components/globe/foundFlags.ts`
- `public/flags/...`
- optional: `scripts/build-found-flag-markers.js`

### Modified files
- `src/components/globe/Globe.tsx`
- optional: `src/data/maps.ts` if marker metadata is loaded alongside geometry

---

## 12. Recommended First Slice

Ship a narrow but representative slice before filling all `242` entries:
- one large direct-marker country such as `Brazil`
- one island country such as `Japan`
- one Europe microstate cluster
- one Gulf cluster

If those four cases feel right, the rest of the rollout becomes mostly data entry and tuning rather than architectural risk.
