---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260424-221053
context_saturation_estimate: "~9%"
---

## Task Statement
Extend the current `C:/Users/doner/html_cloth` Vite + Three.js hero demo so the existing ripple image treatment remains available, and add a separate point-cloud dispersion/reintegration mode that can be selected for hero images via a button control. The new mode should turn the current slide image into a point cloud, disperse it when the pointer moves over the image, and smoothly reintegrate it when the pointer leaves.

## Invariants
- Keep the existing ripple hero behavior functional in `C:/Users/doner/html_cloth/src/main.js`.
- Do not break any existing displacement experiment if it exists outside the inspected files; no displacement implementation was found in `index.html`, `src/main.js`, `src/style.css`, or `TESTING.md`, so the Executor should verify before removing or rewriting any adjacent code.
- Preserve the current full-viewport hero presentation, slide navigation (`#hero-prev`, `#hero-next`, arrow keys), and image loading from `slideSources`.
- The hero must still render recognizable source imagery before hover and after reintegration.
- The point-cloud mode must fully reintegrate on pointer leave; no stuck dispersed state.
- Only one hero effect mode should be active at a time; ripple and point-cloud should be selectable, not blended ambiguously.
- Keep the shared renderer/camera resize behavior intact so the active image still covers the hero area.
- Avoid introducing console/runtime errors or obvious frame-stalling behavior during normal hover and slide switching.

## Success Criteria
1. `C:/Users/doner/html_cloth/index.html` exposes a visible hero control that lets the user select at least `Ripple` and `Point Cloud` modes.
2. In ripple mode, the current hover and click wave behavior from `src/main.js` still works on both hero slides.
3. In point-cloud mode, the current hero image is rendered as a particle/point representation derived from the active slide image, not a generic placeholder effect.
4. While point-cloud mode is active, pointer movement over `#hero-canvas` causes observable particle dispersion around the hover location.
5. When the pointer leaves `#hero-canvas` in point-cloud mode, particles animate back into the original image arrangement and settle reliably.
6. Changing slides with `#hero-prev`, `#hero-next`, or keyboard arrows updates the currently selected effect with the new slide image.
7. The selected hero mode is visually reflected in the UI and actually changes the rendered interaction behavior.
8. `npm run build` succeeds in `C:/Users/doner/html_cloth` after the change.

## Implementation Steps
1. **Refactor `C:/Users/doner/html_cloth/src/main.js` into a mode-based hero controller.**
   - Introduce explicit mode state, e.g. `let effectMode = 'ripple';`.
   - Keep the existing shared setup (`renderer`, `scene`, `camera`, `loader`, `slideTextures`, resize handlers, slide index state) in place.
   - Extract the current ripple implementation from `buildHero()` / `updateCloth()` into ripple-specific functions, e.g. `createRippleHero(texture)`, `updateRipple(dt, elapsed)`, and `disposeActiveEffect()`.
   - Add a single animation loop that delegates to the currently active mode updater.

2. **Implement a separate point-cloud effect path in `C:/Users/doner/html_cloth/src/main.js`.**
   - Build the point-cloud from the active slide texture, ideally by sampling image pixels through an offscreen canvas from `texture.image`.
   - Create a `THREE.BufferGeometry` / `THREE.Points` representation whose particles map back to image-space positions so the integrated state reconstructs the image.
   - Store per-particle base position, current offset/velocity, and any brightness/color attributes needed to preserve the source image.
   - Add point-cloud update logic, e.g. `createPointCloudHero(texture)`, `updatePointCloud(dt, elapsed)`, with dispersion driven by hover distance and reintegration driven by damping/lerp back to base coordinates.

3. **Keep pointer interaction shared, but make its effect mode-specific.**
   - Continue using pointer events on `#hero-canvas`.
   - Keep UV/pointer tracking centralized (`pointerNdc`, `hoverUv`, `hoverTargetUv`, `isHovering`), but route responses by `effectMode`.
   - For point-cloud mode, use the hover position to push nearby particles away from their base positions; on `pointerleave`, clear hover state so reintegration begins immediately.
   - For ripple mode, preserve current impulse spawning on hover movement and click.
   - If raycasting the point cloud is unreliable, keep or add an invisible plane hit target matching the displayed image bounds so both modes can derive stable UV coordinates.

4. **Handle mode switching and slide switching without leaking scene objects.**
   - In `src/main.js`, add a dedicated rebuild path, e.g. `setEffectMode(nextMode)` and `rebuildActiveEffect()`.
   - On mode change, remove/dispose the prior geometry/material/object before creating the new ripple mesh or point cloud.
   - Update `changeSlide(direction)` so the incoming slide texture is applied to whichever mode is active; keep the existing fade transition if practical.
   - Reset transient interaction state on slide/mode changes (`impulses`, hover flags, particle offsets) so the new image does not inherit stale motion.

5. **Add hero effect selection controls in `C:/Users/doner/html_cloth/index.html`.**
   - Add a new button group near the existing hero slider UI, with stable selectors/IDs for JS hookup, e.g. `#effect-ripple` and `#effect-point-cloud` inside a `.hero-effect-toggle` container.
   - Make the labels explicit so the active mode is understandable without hovering.
   - Update any hero helper copy/badges that currently imply ripple-only behavior if they would become misleading.

6. **Style the new controls in `C:/Users/doner/html_cloth/src/style.css`.**
   - Add styles for the mode toggle container and active/inactive button states.
   - Match the existing glassmorphism hero control language used by `.hero-arrow` / `.hero-slide-indicator`.
   - Ensure responsive placement does not collide with the current bottom-right slider controls or mobile badge layout.

7. **Verify behavior locally after implementation.**
   - Run in `C:/Users/doner/html_cloth`:
     - `npm run dev`
     - `npm run build`
   - Manually verify: ripple mode still ripples on hover/click, point-cloud mode disperses on hover and reintegrates on leave, slide changes preserve the selected mode, and controls visibly switch modes.

## Handoff Notes
- Inspected project: `C:/Users/doner/html_cloth`.
- Inspected files: `package.json`, `index.html`, `src/main.js`, `src/style.css`, `TESTING.md`.
- Current implementation is a single-mode Three.js ripple hero using a subdivided plane and `MeshBasicMaterial`; the main extension point is `src/main.js`.
- Current slide assets are `C:/Users/doner/html_cloth/public/hero-image.png` and `C:/Users/doner/html_cloth/public/hero-image-2.png`.
- There is currently no inspected button/UI for effect selection; only slide navigation exists.
- There is currently no inspected displacement implementation in this repo. Treat preservation of displacement as a guardrail, but verify with a broader search before claiming full coverage.
- A practical approach is to keep one renderer/scene/camera and swap only the active hero object between a ripple mesh and a points object.
- For point-cloud image fidelity, sampling a reduced-resolution grid from the source image is likely the best performance/quality tradeoff; do not attempt per-pixel particles at full image resolution.
