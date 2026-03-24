# Mobile Experience And Initial Collapsed Menu Plan

**Recommendation:** Treat mobile as a distinct interaction mode rather than a smaller desktop layout. The first pass should prioritize a cleaner initial viewport, safer edge spacing, and phone-friendly overlays, with the HUD/menu collapsed by default on initial mobile load.

**Why this approach:** The current app already adapts some rendering behavior for coarse pointers in `src/components/Globe.tsx`, but the surrounding UI still behaves mostly like a desktop interface scaled down. The top HUD starts expanded on every device, bottom-left controls ignore safe areas, and the settings and modal surfaces do not yet have a clear mobile-specific presentation.

**Primary v1 goal:** Make the first mobile view feel uncluttered and playable immediately, with the menu minimized on initial load and the rest of the UI staying reachable and readable on small screens.

**Scope rule for v1:** Focus on layout, defaults, touch ergonomics, and mobile presentation. Do not combine this with a broader visual redesign or game-logic changes.

---

## 1. Current Mobile Gaps

### Confirmed issues in the current UI
- `src/components/HUD.tsx` initializes `collapsed` with `useState(false)`, so the top menu always loads expanded, including on mobile
- `src/components/GameContent.tsx` positions the settings and leaderboard buttons at `bottom-6 left-6` without safe-area handling
- `src/components/SettingsPanel.tsx` uses a fixed left-side panel with `w-72`, which is more desktop-like than phone-friendly
- `src/components/LeaderboardModal.tsx` and `src/components/GameCompleteModal.tsx` are centered modals without explicit small-height or keyboard-aware treatment
- `src/index.css` has no safe-area utilities and no dynamic viewport-height handling
- `public/index.html` uses `user-scalable=no`, which should be revisited carefully as mobile UX and accessibility improve

### Likely consequence
On phones, the first screen feels more crowded than it needs to be, important controls can sit too close to notches or gesture areas, and modal flows risk feeling cramped on short viewports.

---

## 2. Recommendation

### Chosen implementation
Ship a mobile-first cleanup in four parts:
- collapse the HUD/menu by default on initial mobile load
- add safe-area-aware positioning and dynamic viewport sizing
- switch major overlays to mobile-friendly sheets or scrollable surfaces
- tune touch interactions and motion for coarse-pointer devices

### Why the HUD/menu change comes first
The top HUD is the most visible mobile issue because it occupies prime vertical space from the first frame. Reducing that footprint immediately improves the opening experience before any deeper polish lands.

### Why not auto-hide everything
Do not over-minimize the interface. The mobile UI still needs to show the target region clearly and keep core controls discoverable. The goal is a smaller initial footprint, not a hidden interface.

---

## 3. Menu Behavior On Mobile

### A. Initial default

#### [MODIFY] `src/components/HUD.tsx`

Change the initial collapse behavior to:
- default `collapsed = true` on mobile-sized or coarse-pointer devices
- default `collapsed = false` on desktop

Recommended detection rule:
- width below the `sm` breakpoint, or
- `matchMedia('(pointer: coarse)')`

### B. Preserve user intent
After the user manually expands or collapses the HUD, do not keep reapplying the automatic mobile default during the same session.

Recommended implementation pattern:
- compute an initial default once
- track whether the user has manually toggled the HUD
- only respond automatically to breakpoint changes before the user has interacted

### C. Visual behavior
When collapsed on mobile, the HUD header should still show:
- the `Find` label
- the current target region
- the expand chevron

That gives users the essential gameplay prompt without consuming the rest of the top panel space.

### D. Optional persistence
If the behavior still feels jumpy between reloads, persist the user’s chosen HUD state in `sessionStorage` or `localStorage`.

For v1 this is optional, not required.

---

## 4. Layout And Safe-Area Work

### A. Global viewport handling

#### [MODIFY] `src/index.css`

Add:
- dynamic viewport height support such as `100dvh`
- CSS custom properties or utility helpers for safe-area insets

Recommended coverage:
- top inset for the HUD
- bottom and left insets for the floating control buttons
- modal and panel padding near device edges

### B. Floating action buttons

#### [MODIFY] `src/components/GameContent.tsx`

Update the settings and leaderboard button cluster so it:
- respects `safe-area-inset-bottom`
- respects `safe-area-inset-left`
- uses slightly tighter spacing on very small screens

The controls should stay easy to hit without feeling detached from the device edge.

### C. Top HUD placement

#### [MODIFY] `src/components/HUD.tsx`

Offset the HUD from the notch/status-bar area on phones instead of pinning it flush to the top edge.

Recommended behavior:
- mobile: top padding based on safe area
- desktop: keep the current floating card treatment

---

## 5. Mobile Presentation Of Panels And Modals

### A. Settings panel

#### [MODIFY] `src/components/SettingsPanel.tsx`

Use different patterns by breakpoint:
- desktop: keep the current left-side panel
- mobile: present settings as a bottom sheet or full-height mobile sheet

Recommended mobile behavior:
- full-width sheet
- rounded top corners
- internal scroll if content grows
- close affordance that is easy to reach with one hand

### B. Leaderboard modal

#### [MODIFY] `src/components/LeaderboardModal.tsx`

Improve phone handling by:
- increasing usable height on mobile
- making the content area reliably scrollable
- allowing filter controls to wrap cleanly without crowding the header

Recommended mobile treatment:
- near-full-height sheet or card
- sticky header with close button
- scrollable results body

### C. Game complete modal

#### [MODIFY] `src/components/GameCompleteModal.tsx`

Make the completion flow more resilient on phones by:
- reducing vertical padding on small screens
- allowing internal scroll for short devices
- ensuring the username input and submit button remain reachable when the keyboard is open

### D. Feedback overlay

#### [MODIFY] `src/components/FeedbackOverlay.tsx`

Recheck the feedback position on mobile so it does not collide visually with:
- the top HUD
- notches
- modal surfaces

This may only require a slightly lower anchor point on smaller screens.

---

## 6. Touch And Performance Polish

### A. Touch targets

#### [MODIFY] interactive controls

Ensure primary tap targets stay comfortably mobile-sized:
- at least 44px hit area
- adequate spacing between grouped controls

Relevant components:
- `src/components/SettingsButton.tsx`
- `src/components/LeaderboardButton.tsx`
- `src/components/OptionSelector.tsx`

### B. Motion on coarse pointers

Reduce non-essential motion on mobile where it helps responsiveness.

Recommended targets:
- tone down confetti intensity on coarse pointers in `src/components/FeedbackOverlay.tsx`
- tone down completion confetti in `src/components/GameCompleteModal.tsx`
- avoid hover-first affordances as meaningful signals on mobile

### C. Globe interaction coexistence

The mobile UI must not interfere with the globe’s drag and tap interactions.

Regression focus:
- the collapsed HUD should leave more touchable globe area visible
- floating controls must not overlap likely drag zones more than necessary
- sheets and modals must fully capture interaction when open

---

## 7. Suggested Implementation Structure

### [NEW] `src/hooks/useIsMobileViewport.ts`

Add a small hook to centralize responsive checks used by UI components.

Recommended responsibilities:
- expose whether the viewport is currently mobile-sized
- expose whether the pointer is coarse
- listen for resize and media-query changes

This avoids scattering `window.innerWidth` and `matchMedia` logic across multiple components.

### [MODIFY] `src/components/HUD.tsx`

Use the responsive hook to choose the initial collapsed state and mobile layout behavior.

### [MODIFY] `src/index.css`

Define safe-area and viewport helpers once so components can reuse them consistently.

---

## 8. Implementation Order

1. Add responsive and safe-area helpers.
2. Update `HUD.tsx` so the menu starts collapsed on mobile.
3. Reposition the floating settings and leaderboard controls with safe-area awareness.
4. Convert the settings panel to a mobile sheet while preserving the desktop side panel.
5. Improve leaderboard and completion modal sizing and scroll behavior on phones.
6. Tune touch targets, overlay placement, and mobile motion intensity.
7. Test on real narrow and short viewports, including keyboard-open states.

---

## 9. Verification

### Manual checks
- on a mobile-width viewport, the HUD/menu loads collapsed on first render
- the user can expand and collapse the HUD reliably
- the HUD does not overlap the notch or system status area
- floating controls do not sit under home-indicator or edge-gesture areas
- settings are comfortable to use one-handed on a phone
- leaderboard results remain scrollable and readable on short screens
- the game-complete modal still works with the software keyboard visible
- the globe remains draggable and tappable behind the mobile UI

### Device matrix
At minimum verify:
- narrow phone portrait
- narrow phone landscape
- a taller modern phone with a notch or dynamic island
- a coarse-pointer tablet width

### Regression focus
Pay particular attention to:
- HUD state flicker during initial render
- unexpected auto-expansion after a user manually collapses or expands the menu
- safe-area spacing regressions on desktop
- modal overflow clipping on short screens

---

## 10. Risks And Mitigations

### Risk: the HUD becomes too hidden on mobile
Mitigation: keep the collapsed header informative and obvious, with the current target region always visible.

### Risk: responsive logic causes layout flicker
Mitigation: compute the initial mobile default lazily on mount and avoid reapplying it after user interaction.

### Risk: mobile-specific sheets diverge too far from desktop UI
Mitigation: limit the difference to layout and motion. Preserve the same actions, labels, and flow.

### Risk: safe-area handling adds complexity across components
Mitigation: centralize the inset rules in `src/index.css` instead of hardcoding spacing in each file.

---

## 11. Exit Criteria

This plan is complete when:
- the HUD/menu is minimized by default on initial mobile load
- the mobile UI respects safe areas and short viewports
- settings, leaderboard, and completion flows are comfortable on phones
- touch targets and motion feel appropriate on coarse-pointer devices
- gameplay remains fully usable without the mobile UI crowding the globe
