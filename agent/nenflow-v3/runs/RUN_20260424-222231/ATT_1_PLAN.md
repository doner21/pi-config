---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260424-222231
context_saturation_estimate: "~8%"
---

## Task Statement
Validate the current Three.js hero implementation against the requested ripple/point-cloud feature set, then make only the smallest necessary code changes if any requested behavior is missing or incorrect. The repo already appears to contain mode-switch UI in `index.html` and both ripple and point-cloud effect paths in `src/main.js`, so the Executor should treat this first as a verification-and-refinement task, not automatically as net-new implementation work.

## Invariants
- Preserve the existing Vite + Three.js app structure and keep changes localized unless a broader change is strictly necessary.
- Preserve hero slide navigation and current slide indicator behavior.
- Keep the hero as a flat, full-bleed image presentation; do not introduce 3D card rotation or perspective gimmicks.
- Mode switching must remain explicit and user-driven through the hero UI buttons.
- Ripple mode must continue to respond to hover/click without regression.
- Point-cloud mode must disperse on hover and move back toward the source image when pointer hover ends.
- If the requested feature set is already implemented, prefer no functional code changes; only fix verified gaps or polish issues needed to satisfy the request.
- Maintain the existing button IDs and canvas hookup unless there is a compelling compatibility reason to change them.
- Do not add graphify artifacts; `graphify-out/` is absent in this repo.

## Success Criteria
1. Verification confirms whether the existing code already satisfies the requested hero modes before any edits are made.
2. `index.html` exposes explicit mode-selection buttons for both ripple and point-cloud interaction states.
3. `src/main.js` supports both effect modes and can switch between them for the active hero slide without breaking slide navigation.
4. In ripple mode, hover and click interactions still produce visible ripple/displacement behavior.
5. In point-cloud mode, hover produces visible particle dispersion and pointer leave causes visible reintegration toward the original image.
6. Any code changes made are minimal, targeted, and justified by a concrete gap found during validation.
7. Build evidence is captured with `npm run build`, and the final report clearly states whether the feature was already present or required refinement.

## Implementation Steps
1. Read and confirm the current implementation state in:
   - `C:/Users/doner/html_cloth/src/main.js`
   - `C:/Users/doner/html_cloth/index.html`
   - `C:/Users/doner/html_cloth/src/style.css`
   Focus on `EFFECT_MODES`, `setEffectMode()`, `createRippleHero()`, `createPointCloudHero()`, pointer handlers, and the `#effect-ripple` / `#effect-point-cloud` buttons.
2. Start the app locally with `npm run dev` from `C:/Users/doner/html_cloth` and manually validate the current behavior before editing anything:
   - switch between slides,
   - click the Ripple button and test hover/click behavior,
   - click the Point Cloud button and test hover dispersion plus reintegration on pointer leave.
3. Decide based on observed behavior:
   - If all requested behavior already works, do **not** make functional code changes.
   - If there are gaps, isolate them precisely and change only the relevant code path in `src/main.js`, `index.html`, or `src/style.css`.
4. If edits are needed in `src/main.js`, keep them scoped to the existing architecture:
   - preserve `EFFECT_MODES` and existing button wiring,
   - refine `createPointCloudHero()` only if dispersion/reintegration behavior is insufficient,
   - preserve ripple logic in `createRippleHero()` and `spawnRippleImpulse()`,
   - preserve slide transition flow in `changeSlide()` and effect rebuild logic in `rebuildActiveEffect()`.
5. If edits are needed in `index.html` or `src/style.css`, keep the current hero layout and mode-toggle UX intact; only fix missing labeling, state visibility, or interaction affordances.
6. Re-run manual checks in the browser after any edits, covering both slides and both modes.
7. Run `npm run build` in `C:/Users/doner/html_cloth` to capture final build evidence and ensure the app still compiles cleanly.
8. In the Execution Report, explicitly document:
   - whether the requested feature was already implemented on arrival,
   - any specific defects found,
   - exact files changed (if any),
   - build result and manual verification observations.

## Handoff Notes
- Repo state already strongly suggests the requested feature exists:
  - `index.html` contains `#effect-ripple` and `#effect-point-cloud` buttons.
  - `src/main.js` defines `EFFECT_MODES.RIPPLE` and `EFFECT_MODES.POINT_CLOUD`.
  - `src/main.js` has both `createRippleHero(texture)` and `createPointCloudHero(texture)`.
  - `onPointerLeave()` calls `resetInteractionState()`, and the point-cloud update loop continuously attracts particles back to `basePositions`, which likely already satisfies reintegration.
- Existing slide navigation is handled through `changeSlide(direction)` and should be protected from regressions.
- Existing ripple interactions are wired through `onPointerMove()`, `onPointerDown()`, and `spawnRippleImpulse()`; avoid altering these unless validation shows breakage.
- Existing point-cloud behavior uses particle positions, velocities, and attraction back to `basePositions`; if refinement is needed, stay inside that model rather than replacing it wholesale.
- `package.json` scripts available: `npm run dev`, `npm run build`, `npm run preview`.
- No research artifact was provided. No `graphify-out/` artifacts are present, matching the intake note.
