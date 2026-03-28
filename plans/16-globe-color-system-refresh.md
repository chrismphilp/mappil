# Globe Color System Refresh Plan

**Recommendation:** Refresh the globe colors in three layers: a clearer base world palette, tighter gameplay-state color rules, and a centralized theme module so future tuning does not stay trapped inside `Globe.tsx`.

**Why this approach:** `src/components/globe/Globe.tsx` currently hard-codes the ocean fill, atmosphere, polygon caps, polygon sides, polygon stroke, and found-label color directly inside the renderer. The current palette works functionally, but the neutral land color sits close to the ocean in darkness, the atmosphere glow is tuned separately from the rest of the scene, and palette changes require editing rendering callbacks rather than adjusting one source of truth.

**Primary v1 goal:** Make the globe easier to read and more visually deliberate while keeping the current gameplay, interaction model, and runtime performance profile intact.

**Scope rule for v1:** Stay within the current `react-globe.gl` setup and transparent-canvas scene. Do not rewrite the globe renderer, add shader-heavy lighting, or widen this into a full app-wide rebrand.

---

## 1. Current Color Snapshot

### Base environment today
- `src/components/globe/Globe.tsx` builds a flat ocean texture from one solid fill: `#0f172a`
- the globe atmosphere uses `#3b82f6` at altitude `0.2`
- `src/app/globals.css` sets the page background to `#020617`, which is close in value to the ocean

### Polygon colors today
- default cap color: `rgba(71, 85, 105, 0.6)`
- found cap color: `rgba(52, 211, 153, 0.85)`
- fly-to or skipped-region cap color: `rgba(251, 191, 36, 0.85)`
- found side color: `rgba(16, 185, 129, 0.6)`
- stroke color: `rgba(148, 163, 184, 0.2)`

### Supporting color usage today
- found-country label text is hard-coded to `#34d399`
- tooltip chrome in `src/app/globals.css` uses a dark slate glass treatment separate from the globe callbacks
- HUD and feedback surfaces already lean on slate, cyan, emerald, amber, and rose accents

### Likely consequence
The scene is usable, but it does not yet feel color-directed:
- oceans and unfound land are both dark enough to visually compress together
- success and guidance states are vivid, but they sit on top of a neutral palette that does not create enough contrast headroom
- changing the globe palette means touching multiple inline strings inside rendering logic

---

## 2. Recommendation

### Chosen color strategy
Refresh the globe in three layers:
- a deeper, more dimensional ocean treatment
- a lighter but still restrained neutral land palette
- vivid accent colors reserved for gameplay states such as found and fly-to

### Why this direction fits Mappil
The rest of the app already uses a coherent dark-slate base with cyan, emerald, amber, and rose accents. The globe should feel like part of that same system rather than a separate experiment.

### Why not just brighten everything
If land, atmosphere, and ocean all become brighter at once:
- the globe starts competing with the HUD
- found countries lose some of their reward contrast
- dense regions become noisier, not clearer

The right move is stronger hierarchy, not more saturation everywhere.

---

## 3. Visual Direction

### Desired look
Aim for a night-atlas palette:
- oceans as deep navy rather than flat black-blue
- neutral countries as cool steel or slate so coastlines read clearly
- atmosphere as a thinner cyan rim rather than a wide blue fog
- found countries as the most rewarding green in the scene
- fly-to guidance as warm amber that is clearly different from success green

### Recommended v1 token set
Use this as the starting point, then tune visually against the real globe:

- `oceanBase`: `#08111f`
- `oceanHighlight`: `#0c1b33`
- `atmosphere`: `#38bdf8`
- `countryDefaultCap`: `rgba(100, 116, 139, 0.72)`
- `countryDefaultStroke`: `rgba(148, 163, 184, 0.18)`
- `countryFoundCap`: `rgba(52, 211, 153, 0.9)`
- `countryFoundSide`: `rgba(16, 185, 129, 0.72)`
- `countryFlyToCap`: `rgba(245, 158, 11, 0.92)`
- `countryLabelFound`: `#6ee7b7`
- `tooltipBackdrop`: `rgba(15, 23, 42, 0.88)`

### Color rules
Keep these rules explicit:
- the ocean should remain the darkest major surface on the globe
- neutral land should be readable without becoming an accent color
- only stateful countries should use vivid, high-saturation fills
- success green and guidance amber must remain distinct through the atmosphere layer and at mobile pixel-ratio caps

---

## 4. Globe-Specific Architecture

### A. Centralize globe theme tokens

#### [NEW] `src/components/globe/globeTheme.ts`

Create a dedicated theme module for globe visuals.

Responsibilities:
- export named color tokens
- export small helpers for cap, side, stroke, and label colors
- own any generated ocean texture logic
- document the meaning of each gameplay state color

This keeps palette changes out of rendering callbacks and makes color tuning safer.

### B. Keep the renderer simple

#### [MODIFY] `src/components/globe/Globe.tsx`

Refactor `Globe.tsx` so it consumes theme helpers instead of hard-coded strings.

That includes:
- ocean texture creation
- atmosphere color and altitude
- polygon cap color selection
- polygon side color selection
- stroke color
- label HTML color

The renderer should decide state. The theme module should decide color.

### C. Only use CSS variables where CSS owns rendering
`react-globe.gl` color callbacks and the canvas-generated ocean texture live in JavaScript, so a TypeScript theme module is the most direct source of truth for the globe.

If tooltip chrome also needs alignment, either:
- keep matching values in `src/app/globals.css`, or
- expose a small shared token bridge later

Do not force the globe to read CSS variables at runtime just to say the theme is centralized.

---

## 5. Color Improvements By Layer

### A. Ocean and atmosphere

#### [MODIFY] `src/components/globe/Globe.tsx`

The current ocean texture is a `2x2` flat fill. Replace it with a slightly richer generated texture that still costs essentially nothing at runtime.

Recommended direction:
- generate a small canvas texture once, such as `32x32`
- use a subtle vertical or radial gradient between `oceanBase` and `oceanHighlight`
- keep texture detail restrained so the globe does not look noisy
- reduce atmosphere altitude from `0.2` toward a thinner range such as `0.12` to `0.16` if testing shows the current halo washes the rim too broadly

### B. Neutral countries

#### [MODIFY] `src/components/globe/Globe.tsx`

Make unfound countries slightly lighter and more legible against the ocean.

Recommended direction:
- shift the default cap toward cool steel rather than darker slate
- increase opacity enough that landmasses read at a glance
- keep saturation low so found and fly-to colors still pop
- tune stroke opacity to preserve borders without creating a chalk-outline effect

### C. Found countries
Keep found countries clearly rewarding.

Recommended direction:
- preserve emerald as the success color because it already matches score and positive feedback surfaces
- slightly raise cap opacity so found regions read confidently through the atmosphere
- keep side color darker than cap color so extruded regions still feel dimensional rather than neon

### D. Fly-to or skipped-country highlight
The current amber direction is correct, but it should remain clearly separate from success green and not feel muddy against the darker ocean.

Recommended direction:
- keep amber warmer than the cyan atmosphere and cooler slate base
- tune opacity high enough to stay visible during the camera move
- verify it does not read as an error state when shown briefly

### E. Labels and tooltip chrome
The label and tooltip colors should feel related to the globe palette.

Recommended direction:
- move found label color into the same theme module as the polygon colors
- keep tooltip backdrop aligned with the slate base used elsewhere in the app
- avoid introducing a separate font or accent palette just for globe labels

---

## 6. Optional But Useful v1 Enhancements

### A. Add a subtle hover treatment only if it improves clarity
The globe currently tracks hovered polygons for interaction but does not render a dedicated hover color.

If testing shows value, add a restrained hover treatment such as:
- a slightly brighter stroke
- a low-amplitude cap lift in a cyan-tinted neutral

Do not add a loud hover fill that competes with found and fly-to states.

### B. Capture before-and-after screenshots from fixed camera positions
A color refresh is easy to over-tune by eye in motion. Use a few fixed reference views to compare:
- full-world view
- Europe and the Mediterranean
- southeast Asia
- Pacific island view
- South America and southern oceans

This will make palette review less subjective.

---

## 7. Recommended File Changes

### [NEW] `src/components/globe/globeTheme.ts`
Central source of truth for globe palette tokens and state-to-color helpers.

### [MODIFY] `src/components/globe/Globe.tsx`
Consume the theme module and replace inline color literals with named tokens.

### [MODIFY] `src/app/globals.css`
Only if tooltip styling needs to be brought into the same globe palette treatment.

### [NEW] optional `src/components/globe/globeTheme.test.ts`
Add a lightweight test for state-to-color mapping and token invariants if the theme logic becomes non-trivial.

---

## 8. Implementation Order

1. Inventory every globe-specific color literal currently living in `Globe.tsx` and group them by environment, neutral state, success state, and guidance state.
2. Add `src/components/globe/globeTheme.ts` with named tokens and small helper functions.
3. Replace the flat ocean fill with a slightly richer generated texture and retune the atmosphere.
4. Retune neutral land and stroke colors until the land-ocean separation is clearly better than today.
5. Retune found, fly-to, and label colors so state hierarchy remains obvious.
6. Align tooltip chrome if it still feels detached from the updated globe palette.
7. Add a small test for theme helpers if the mapping logic warrants it.
8. Run visual QA across desktop and coarse-pointer or mobile conditions.

---

## 9. Verification

### Manual checks
- the globe reads more clearly at a full-world zoom level before any countries are found
- unfound land is easier to distinguish from ocean without becoming visually loud
- found countries are still the most rewarding accent on the globe
- fly-to amber remains clearly distinct from found green
- Europe, the Caribbean, southeast Asia, and Pacific islands remain readable
- the atmosphere supports the scene without turning the rim into a bright halo
- the HUD still stands out against the globe rather than blending into it

### Technical checks
- `npm run typecheck`
- `npm run build`
- `npm test` if a theme test is added

### Review method
Compare before and after states from the same camera positions and with the same found-country set. A color change should be judged against like-for-like views, not memory.

---

## 10. Risks And Mitigations

### Risk: the neutral palette gets too bright and competes with gameplay states
Mitigation: keep saturation low on default land and reserve the strongest chroma for found and fly-to states.

### Risk: a stronger atmosphere washes out borders or looks blurry on mobile
Mitigation: lower atmosphere altitude and validate on coarse-pointer devices at the existing pixel-ratio cap.

### Risk: globe tokens drift away from the rest of the app palette
Mitigation: align the theme explicitly with existing slate, cyan, emerald, and amber accents already used by HUD and feedback surfaces.

### Risk: color values stay centralized in name only but still scatter across markup strings
Mitigation: route label HTML and any generated texture logic through the theme module rather than leaving special cases behind in `Globe.tsx`.

---

## 11. Exit Criteria

This plan is complete when:
- the globe has a clearer land-ocean hierarchy than the current hard-coded palette
- found and fly-to states remain instantly distinguishable
- globe colors are defined in one intentional source of truth rather than scattered literals
- the updated palette feels aligned with the rest of Mappil's dark-slate visual language
- the change lands without build, type, or obvious visual regressions
