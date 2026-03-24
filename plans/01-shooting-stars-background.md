# Shooting Stars Background Plan

**Recommendation:** Add a dedicated, very low-resolution 2D canvas layer for shooting stars behind the globe and HUD, while keeping the existing static starfield in `src/index.css` as the baseline background.

**Why this approach:** `react-globe.gl` already renders with `alpha: true` and `backgroundColor="rgba(0,0,0,0)"` in `src/components/Globe.tsx`, so the cleanest implementation is a separate background effects layer rather than adding extra work inside the Three.js scene. That keeps the effect visually present across the whole app without competing with the globe renderer.

**Primary v1 goal:** Add subtle, infrequent shooting stars that make the background feel more alive without affecting gameplay responsiveness on low-power devices.

**Scope rule for v1:** Prioritize low resolution, low object counts, and graceful disabling over visual complexity. This should feel atmospheric, not like a particle system showcase.

---

## 1. Recommendation

### Chosen implementation
Render shooting stars in a fullscreen `<canvas>` that is:
- fixed to the viewport
- behind the globe and overlays
- scaled up from a much smaller internal render size
- driven by a tiny pool of active meteors

### Why not CSS-only animation
Avoid animating multiple DOM nodes with long glowing trails. CSS shooting stars are easy to prototype but harder to tune for strict frame budgets, especially once randomized timing, sizing, and cleanup are needed.

### Why not add it to the globe scene
Do not add these effects to `react-globe.gl` or the underlying Three.js scene for v1. The globe already owns the critical interactive render path, and background ambience should not increase scene complexity, GPU state changes, or debugging surface area there.

---

## 2. V1 Product Scope

### Include in v1
- occasional diagonal shooting stars in the empty background space
- soft trail fade rather than dense particle bursts
- randomized spawn timing and start positions
- opacity and speed tuned to stay subtle behind the globe
- automatic pause or disable when motion should be reduced

### Explicitly defer from v1
- parallax star layers
- comet bursts or impact effects
- color cycling
- synchronization with score, streak, or game events
- integration with Framer Motion
- any effect that requires more than a handful of draw calls per frame

---

## 3. Technical Design

### A. New background effects component

#### [NEW] `src/components/ShootingStarsBackground.tsx`

Create a dedicated background component that owns:
- canvas setup and resize handling
- low-resolution backing buffer calculations
- a preallocated list of active shooting stars
- the animation loop
- reduced-motion checks

Recommended public API:

```tsx
interface ShootingStarsBackgroundProps {
  enabled?: boolean;
}
```

Keep the API small for v1. Most tuning can stay as internal constants until the effect proves worthwhile.

### B. Layering and placement

#### [MODIFY] `src/components/GameContent.tsx`

Insert the background component before `<Globe />` so the stacking order becomes:
1. static CSS starfield from `src/index.css`
2. low-res shooting stars canvas
3. globe
4. HUD, modals, and controls

Use `pointer-events: none` and a low z-index on the background canvas so it never interferes with globe interaction.

### C. Rendering strategy

Use a 2D canvas, not WebGL.

Recommended defaults:
- internal render width around `viewportWidth / 4`
- internal render height around `viewportHeight / 4`
- cap effective DPR at `1`
- scale the canvas to the full viewport with CSS

This deliberately trades sharpness for performance. Slight blur is acceptable because the effect is decorative and fast-moving.

### D. Shooting star model

Represent each shooting star with a tiny data object:
- `x`, `y`
- `vx`, `vy`
- `length`
- `life`
- `maxLife`
- `alpha`

Recommended pool constraints:
- `0` to `2` active stars at once
- spawn interval randomized within a relaxed range such as `3` to `8` seconds
- very short lifetime, roughly `400` to `900` milliseconds

Avoid array churn during animation. Reuse objects from a fixed-size pool.

### E. Drawing rules

Each frame should:
1. clear the low-res canvas
2. update active star positions by delta time
3. draw each star as a simple line or tapered gradient
4. remove or recycle finished stars

Keep drawing primitive:
- one stroke for the trail
- optional tiny head highlight
- no expensive blur filters
- no per-frame shadow calculations

If a glow is needed, fake it with alpha and line width instead of canvas filters.

### F. Visibility and motion controls

Pause animation when:
- `document.hidden` is true
- `prefers-reduced-motion: reduce` matches

On reduced motion, either:
- disable shooting stars entirely, or
- reduce to near-zero spawn frequency

Prefer a full disable for v1. It is simpler and more defensible.

---

## 4. Performance Constraints

### Hard rules
- do not allocate new arrays or gradients every frame unless profiling shows it is negligible
- do not render at device pixel ratio on high-density screens
- do not exceed a tiny active-star count
- do not tie the effect to React state updates during animation

### React integration rule
Drive the animation entirely through refs and imperative canvas drawing. React should mount the component once and stay out of the frame loop.

### Mobile safeguard
Use a coarser internal scale on small screens if needed, for example:
- desktop: quarter-resolution
- mobile: fifth-resolution

The effect should bias toward disappearing slightly into softness rather than spending extra pixels.

---

## 5. Implementation Steps

1. Add `src/components/ShootingStarsBackground.tsx` with a fixed-position canvas and ref-driven animation loop.
2. Add viewport resize logic that recalculates the low-res backing size without exceeding the configured cap.
3. Implement a fixed-size shooting-star pool with randomized spawn timing, trajectory, and lifetime.
4. Mount the component in `src/components/GameContent.tsx` behind the globe.
5. Verify the canvas remains non-interactive and does not block region selection.
6. Tune opacity, trail length, and spawn frequency against the existing deep-space CSS background.
7. Test reduced-motion and hidden-tab behavior.

---

## 6. Testing and Verification

### Manual checks
- confirm the globe remains fully clickable and draggable
- confirm modals and HUD render above the effect
- confirm frame pacing stays stable during globe rotation and zoom
- confirm there are never multiple bright meteors crowding the screen
- confirm the effect still looks acceptable on lower-end mobile hardware

### Developer diagnostics
For tuning, add temporary debug constants for:
- spawn interval range
- max concurrent stars
- internal scale factor
- trail length and alpha

Keep these local to the component until a broader effects system exists.

---

## 7. Risks and Mitigations

### Risk: the effect reads as visual noise
Mitigation: keep spawn frequency low and trails short so the globe remains the focal point.

### Risk: the canvas looks too blurry on large displays
Mitigation: accept some softness by design, then raise the internal scale slightly only if the effect becomes unreadable.

### Risk: mobile devices still pay too much for the effect
Mitigation: lower the backing resolution further on coarse pointers and disable entirely under reduced motion.

### Risk: layering conflicts with the globe or overlays
Mitigation: mount the effect in `GameContent` behind the globe and keep `pointer-events: none`.

---

## 8. Exit Criteria

This plan is complete when:
- the app has a dedicated shooting stars background layer
- the effect is visibly subtle and runs behind the transparent globe
- performance remains stable on desktop and mobile
- reduced-motion users do not receive the animation
- the implementation remains isolated from globe rendering logic
