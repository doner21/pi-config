---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260424-231213
context_saturation_estimate: "~28%"
---

[PLANNER CONTEXT — START]
self_estimate: ~28%
health: HEALTHY

## Task Statement
Redesign the existing point-cloud hero mode in `C:/Users/doner/html_cloth/src/main.js` so the active slide remains clearly readable as the real source image at rest, can break apart dramatically on hover, and snaps back together quickly after hover/leave. Keep the current Vite + Three.js architecture, preserve ripple mode and slide navigation, and verify the finished behavior through a stable `vite preview` browser path on a fixed port.

## Invariants
- Do not add OpenCV/OpenCV.js for runtime; research shows it is not needed for the real-time effect in this repo.
- Keep the app inside the current Vite + Three.js setup defined in `C:/Users/doner/html_cloth/package.json`.
- `Ripple` mode must remain selectable and functional through `#effect-ripple`.
- `Point Cloud` mode must remain selectable and functional through `#effect-point-cloud`.
- The hero must remain flat and full-bleed; do not introduce 3D camera tilt/rotation behavior.
- Slide navigation via `#hero-prev` / `#hero-next` and `changeSlide()` must continue to work for both images.
- The point-cloud presentation at rest must still resemble the actual slide image, not degrade into an abstract monochrome field.
- Reassembly after hover disturbance must remain present and become noticeably faster/more decisive than the current implementation.
- Verification must include an actual browser-access attempt against a stable preview server, not source inspection alone.
- `graphify-out/` is absent in this repo; do not plan around graphify artifacts.

## Success Criteria
1. `C:/Users/doner/html_cloth/src/main.js` implements a point-cloud redesign grounded in the current scene lifecycle (`rebuildActiveEffect()`, `changeSlide()`, `updateDisplayedPlaneSize()`) rather than a separate app architecture.
2. Point-cloud mode shows the current slide as a clearly readable image at rest for both `/hero-image.png` and `/hero-image-2.png`.
3. Hover interaction produces a visibly stronger breakup/destruction effect than the current tight-dispersion behavior, with larger temporary displacement and clearer particle separation.
4. On hover end / pointer leave, the image reintegrates quickly and convincingly, with no long drift or permanently scattered particles.
5. Ripple mode still behaves as before: hover ripples and click impulses still work after the point-cloud redesign.
6. Slide switching still rebuilds/fades correctly for both modes without broken opacity transitions or stale geometry.
7. `npm run build` succeeds.
8. Browser verification is attempted against `vite preview` on a fixed port (recommended: `4173`) and documented with evidence that the production bundle loads and the redesigned hover/reassembly effect is observable.

## Implementation Steps
1. Inspect and preserve the current control flow in `C:/Users/doner/html_cloth/src/main.js`:
   - keep `EFFECT_MODES`, `setEffectMode()`, `rebuildActiveEffect()`, `changeSlide()`, `updateDisplayedPlaneSize()`, and shared pointer state intact unless a small targeted refactor is required;
   - keep `createRippleHero()` working unchanged or minimally touched.
2. Redesign `createPointCloudHero(texture)` in `C:/Users/doner/html_cloth/src/main.js` around a hybrid composition:
   - add a textured plane underlay using the active slide texture to guarantee image readability at rest;
   - keep a particle overlay derived from the same sampled image;
   - return a single effect object whose `object` is a `THREE.Group` containing underlay + particle overlay so it still fits existing scene add/remove logic.
3. Make the hybrid effect compatible with current sizing and transitions:
   - ensure `updateDisplayedPlaneSize()` scales the returned group correctly;
   - ensure `setOpacity()` updates both underlay and particle overlay in a coordinated way so `animateEffectOpacity()` and `changeSlide()` continue to fade cleanly.
4. Rework particle generation inside `createPointCloudHero(texture)` for better fidelity at rest:
   - continue using the existing offscreen 2D canvas sampling path rather than adding OpenCV;
   - increase or rebalance sampling density within safe performance bounds so the image reads more clearly;
   - keep per-particle source color data from the sampled image;
   - if needed, bias retention toward non-transparent/high-detail pixels, but do not make preprocessing a new build step.
5. Rework point-cloud motion tuning for dramatic destruction on hover:
   - widen the interaction radius beyond the current `0.0115`-style constraint;
   - increase temporary XY/Z displacement budgets beyond the current clamp regime;
   - use stronger outward impulse / swirl / turbulence while hovering so particles visibly peel away from the image;
   - preserve deterministic spring return targets at the original sampled positions.
6. Rework reassembly behavior so it is decisively faster than the current implementation:
   - on active hover, allow stronger force and looser displacement;
   - on hover end / `onPointerLeave()`, increase return stiffness and/or damping profile so particles snap back quickly;
   - ensure velocities settle fully instead of leaving long residual drift.
7. Coordinate underlay visibility with destruction state:
   - at rest, underlay should provide the stable readable image foundation;
   - during hover, fade or partially suppress the underlay enough that the particle destruction is visually dramatic;
   - on hover end, restore underlay quickly in sync with particle reintegration.
8. Keep interaction and lifecycle compatibility:
   - preserve existing `pointermove`, `pointerleave`, and mode-switch paths;
   - ensure `resetInteractionState()` cleanly resets the new point-cloud effect;
   - ensure changing slides in point-cloud mode disposes old geometry/materials and rebuilds with the new texture.
9. Validate locally with repo commands from `C:/Users/doner/html_cloth`:
   - `npm run build`
   - `npm run preview -- --host 127.0.0.1 --strictPort --port 4173`
10. Perform browser-based verification against the fixed preview URL:
   - open `http://127.0.0.1:4173/` through available MCP/browser tooling;
   - verify ripple mode, point-cloud readability at rest, dramatic hover breakup, fast reassembly after leave, and slide switching on both images;
   - capture the exact URL/port and observed pass/fail evidence in the execution artifacts.

## Handoff Notes
- Repo root: `C:/Users/doner/html_cloth`
- Primary implementation file: `C:/Users/doner/html_cloth/src/main.js`
- Supporting UI files likely unchanged or minimally changed: `C:/Users/doner/html_cloth/index.html`, `C:/Users/doner/html_cloth/src/style.css`
- Current point-cloud limitations are directly visible in `createPointCloudHero()`: sparse sampling cap, `THREE.PointsMaterial`, small hover radius, strong spring return, and tight XY/Z clamps.
- Strongest fit from research: hybrid textured-plane underlay + particle overlay. This best satisfies readable image at rest + dramatic destruction on hover + fast reassembly.
- OpenCV is out of scope for runtime here. If preprocessing ideas arise, prefer the existing offscreen canvas pixel pipeline first.
- Current scene architecture already supports this approach well: orthographic camera, flat hero plane sizing, scene add/remove lifecycle, and slide rebuild path.
- Stable verification path should prefer preview over dev because `vite.log` showed dev-port churn. Use `4173` with `--strictPort` unless that port is unavailable.

[PLANNER CONTEXT — END]
self_estimate: ~28%
