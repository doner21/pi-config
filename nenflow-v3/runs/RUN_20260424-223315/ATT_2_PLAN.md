---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260424-223315
context_saturation_estimate: "~18%"
---

## Task Statement
Refine the existing Three.js point-cloud hero effect so point-cloud mode reads like the original full-color image gently dispersing under the pointer instead of becoming washed out, sparse, or hole-punched. Keep the change set minimal and concentrated in `src/main.js`, preserve the existing ripple/mode/slide flows, and require post-implementation build plus browser/Playwright-based interaction checking.

## Invariants
- Do not modify files outside the planning artifacts; implementation should stay primarily in `C:/Users/doner/html_cloth/src/main.js`.
- `Ripple` mode must remain available, selectable, and behaviorally unchanged aside from shared infrastructure continuing to work.
- `Point Cloud` mode must remain selectable through the existing buttons in `index.html` and current mode state in `src/main.js`.
- Point-cloud pointer-leave reintegration must remain intact; particles must return toward their base positions.
- The hero must remain flat and full-bleed; no 3D rotation treatment should be introduced.
- The point-cloud effect must preserve the source image’s apparent color relationships and should not read like a monochrome/negative treatment.
- Dispersion must be more restrained and localized than the current implementation; avoid a large central void.
- Prefer minimal, targeted adjustments before introducing any heavier architectural change.
- Build verification is required, and browser/Playwright-based interaction checking must be attempted and documented after implementation.

## Success Criteria
1. `createPointCloudHero()` in `C:/Users/doner/html_cloth/src/main.js` is updated with a minimal refinement path that improves image fidelity without disturbing the surrounding effect lifecycle.
2. Point-cloud compositing preserves the sampled source colors more faithfully than the current additive/glowy look; dark image regions are no longer disproportionately dropped.
3. Hover interaction in point-cloud mode produces a smaller, subtler, more local disturbance with visible reintegration after pointer leave.
4. Existing slide switching and effect toggling still work for both hero images and both modes.
5. `npm run build` succeeds from `C:/Users/doner/html_cloth` after implementation.
6. Browser validation is attempted in a running app (prefer Playwright/MCP if available): switch to point-cloud mode, hover across the hero, verify subtle local dispersion, leave the canvas to confirm reintegration, switch slides, then switch back to ripple mode to confirm no regression.
7. If browser/Playwright tooling is unavailable in the environment, that failed attempt is explicitly documented together with any fallback manual/browser evidence gathered.

## Implementation Steps
1. Open `C:/Users/doner/html_cloth/src/main.js` and work only inside the point-cloud path unless a tiny supporting adjustment elsewhere is clearly required.
2. In `createPointCloudHero()`:
   - keep the existing canvas sampling/color-buffer approach,
   - remove or sharply relax dark-pixel culling so alpha is still respected but very dark pixels are not discarded just because luminance is low,
   - keep `vertexColors: true` and `toneMapped: false`.
3. Update the `THREE.PointsMaterial` in `createPointCloudHero()` to stop using `THREE.AdditiveBlending`; use normal/default alpha compositing instead, keeping transparency/depth settings compatible with the current scene.
4. Retune the point-cloud interaction math in the same function for subtlety:
   - reduce hover radius and/or hover strength,
   - reduce the radial push/swirl multipliers,
   - keep z-motion restrained,
   - add a clamp on per-particle planar displacement from `basePositions` so hovering cannot open a large hole.
5. Preserve existing reintegration by leaving the spring-back logic in place, only retuning constants as needed so particles settle smoothly after pointer leave.
6. Only if the above minimal pass still leaves obvious coverage loss, add the smallest viable fallback inside `createPointCloudHero()`: return a `THREE.Group` containing a very subtle texture underlay plane plus the points overlay. Treat this as a second-pass option, not the default first edit.
7. After implementation, run `npm run build` from `C:/Users/doner/html_cloth`.
8. Run the app for browser validation (for example with `npm run dev`), then use available browser/Playwright tooling to check:
   - point-cloud mode preserves image color,
   - hover creates only a local disturbance,
   - pointer leave reintegrates particles,
   - next/previous slide controls still work,
   - ripple mode still behaves correctly.
9. Capture in the execution report which constants/settings were changed and what browser evidence was observed, including any Playwright/MCP availability limitation.

## Handoff Notes
- Repo context: `graphify-out/` is absent here, so planning was grounded directly in source plus research artifact.
- Relevant implementation hotspot: `C:/Users/doner/html_cloth/src/main.js`, especially `createPointCloudHero()` around the sampling loop, `THREE.PointsMaterial`, and the point update loop.
- Research confirms the app already samples per-pixel color correctly; the bad visual read is most likely caused by `THREE.AdditiveBlending`, dark-pixel luminance culling, sparse point coverage, and overly strong dispersion constants rather than missing color data.
- The existing architecture already supports swapping in any object via `activeEffect.object`; if an underlay is needed later, a `THREE.Group` is compatible with current `rebuildActiveEffect()`, `disposeActiveEffect()`, and `updateDisplayedPlaneSize()` flows.
- Keep changes minimal and avoid introducing a custom shader unless the simple material/force tuning pass clearly fails.
- Browser validation matters for this task because the desired result is aesthetic/interactive, not just structural.
