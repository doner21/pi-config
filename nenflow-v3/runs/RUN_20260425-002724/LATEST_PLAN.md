---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260425-002724
context_saturation_estimate: "~18%"
---

[PLANNER CONTEXT - START]
self_estimate: ~18%
health: HEALTHY

## Task Statement
Redesign the existing Ci Labs London hero into a bold luxury editorial / experimental laboratory experience while preserving the working Three.js ripple and point-cloud engine already implemented in `src/main.js`. Add an interactive live lab-console/log layer that is visibly tied to hero mode, slide, pointer activity, and transition state so the experience feels branded and cinematic rather than like a generic effect demo.

## Invariants
- Do not replace or remove the existing Vite + Three.js hero architecture.
- `src/main.js` must continue to support both effect modes defined in `EFFECT_MODES`: `ripple` and `point-cloud`.
- Slide navigation via `#hero-prev`, `#hero-next`, `#hero-slide-current`, and `#hero-slide-total` must remain functional.
- The redesign must stay compatible with the current effect lifecycle: `setEffectMode()`, `changeSlide()`, `rebuildActiveEffect()`, pointer handlers, and the animation loop.
- Interactive logs must be meaningful and visibly connected to live hero state, not a static decorative box.
- Preserve or extend `window.__heroDebug.getState()` rather than removing it, because existing verification depends on it.
- Keep the hero full-bleed / flat presentation; do not turn it into a 3D rotating card or boxed demo.
- Favor implementation primarily in `index.html`, `src/style.css`, and targeted UI/state additions in `src/main.js`.
- Keep the experience production-facing and responsive; mobile layout must still work.
- Build must continue to pass with `npm run build`.

## Success Criteria
1. `index.html` presents a clearly reauthored Ci Labs London hero with stronger brand voice, luxury-editorial typography, asymmetry, and lab-oriented framing rather than the current generic interactive-hero copy.
2. `src/style.css` establishes a distinctive visual system for Ci Labs London: richer atmosphere, layered scrims/panels, intentional typography pairing, asymmetric composition, and memorable controls/details aligned to the luxury editorial / experimental lab direction.
3. The hero includes an interactive console/log interface in the hero itself, and that console updates from live state such as active mode, current slide, hover activity, transitions, ripple impulses, or point-cloud destruction/reintegration signals.
4. `src/main.js` keeps ripple mode working, including hover deformation and click ripple pulses.
5. `src/main.js` keeps point-cloud mode working, including hover-driven particle disruption and reintegration.
6. Existing mode toggles and slide controls still update their UI state correctly (`aria-pressed`, slide indicator text, active button states).
7. `window.__heroDebug.getState()` still returns usable verification state, with any added telemetry remaining additive rather than breaking the existing shape expected by `playwright-verify-pointcloud.spec.js`.
8. The redesign renders coherently across desktop and mobile breakpoints without obscuring the controls or making the console unreadable.
9. `npm run build` succeeds, and the existing Playwright verification flow remains runnable against the updated hero.

## Implementation Steps
1. Inspect and reframe the hero markup in `index.html`.
   - Replace the current generic title/copy with Ci Labs London-specific editorial/lab language.
   - Reorganize the hero overlay into a stronger composition: brand masthead, oversized headline, supporting manifesto text, stat/descriptor rail, and a dedicated live console/log panel.
   - Keep the existing canvas and core control hooks intact: `#hero-canvas`, `#effect-ripple`, `#effect-point-cloud`, `#hero-prev`, `#hero-next`, `#hero-slide-current`, `#hero-slide-total`.
   - If additional UI nodes are needed for logs/status, add them around the existing hero controls rather than renaming/removing tested IDs.

2. Rebuild the visual identity in `src/style.css` around the new directive.
   - Replace the current standard dark-glass landing-page styling with a more intentional luxury editorial / experimental laboratory system.
   - Update root tokens (colors, surfaces, borders, shadows, spacing) to support richer atmosphere and stronger contrast.
   - Restyle `.site-header`, `.hero-overlay`, badges, toggles, arrows, and slide indicator so they feel like part of one designed system.
   - Give the live console/log area a cinematic instrument-panel treatment that feels tied to the hero image, not like a detached debug widget.
   - Use asymmetry, layered gradients/scrims, refined serif/display typography, and a more distinctive information hierarchy.
   - Preserve responsive behavior by updating the existing `@media (max-width: 1040px)` and `@media (max-width: 720px)` sections.

3. Add structured hero telemetry state in `src/main.js` for UI binding.
   - Introduce a small state object or derived snapshot for UI-facing telemetry, sourced from existing runtime state (`effectMode`, `currentSlideIndex`, `isHovering`, `hoverMotion`, `isTransitioning`, and active effect internals).
   - Cache references to any new DOM nodes added for the console/log panel (status labels, metric readouts, event list, progress bars, etc.).
   - Keep this additive and lightweight; do not rewrite the rendering engine.

4. Create meaningful live log/event updates in `src/main.js`.
   - Emit concise event entries when mode changes, slide changes, pointer enters/leaves, ripple pulses fire, and point-cloud destruction/reintegration states shift.
   - Maintain a bounded event list so the console feels live but does not grow indefinitely.
   - Update status text/metrics from existing runtime values and effect-specific debug data, especially `createPointCloudHero().getDebugState()` and ripple interaction state.
   - Consider adding a small timestamp/frame counter/phase label if it helps the cinematic lab-console feeling, but keep it tied to real state.
5. Connect telemetry updates to existing lifecycle points in `src/main.js`.
   - Hook UI/log refreshes into `setEffectMode()`, `changeSlide()`, `onPointerMove()`, `onPointerLeave()`, `onPointerDown()`, and the animation loop.
   - For ripple mode, log center-pulse/impulse events from `spawnRippleImpulse()` without altering the physics behavior.
   - For point-cloud mode, surface key values from `destroyMix`, `meanOffset`, `maxOffset`, or hover energy so the console reflects the effect's live state.
   - Ensure telemetry gracefully handles transitions when `activeEffect` is swapped in `rebuildActiveEffect()`.

6. Preserve verification compatibility.
   - Keep tested selectors and IDs stable for Playwright: `#effect-ripple`, `#effect-point-cloud`, `#hero-next`, `.hero-slide-indicator`, `#hero-canvas`.
   - Keep `window.__heroDebug.getState()` available and extend it only in backwards-compatible ways.
   - If new telemetry is added to debug state, append fields instead of renaming existing ones such as `effectMode`, `currentSlideIndex`, `isHovering`, `hoverMotion`, `activeEffectType`, and `effectState`.

7. Validate after implementation.
   - Run `npm run build` from `C:/Users/doner/html_cloth`.
   - If time permits during execution, run the existing verification flow already present in the repo (`playwright-verify-pointcloud.spec.js` or `playwright-verify-pointcloud.mjs`) against preview to confirm mode switching, slide navigation, and runtime state still behave.
   - Visually confirm the hero console is readable, animated, and clearly connected to live hero behavior on both desktop and mobile widths.

## Handoff Notes
- Relevant files: `C:/Users/doner/html_cloth/index.html`, `C:/Users/doner/html_cloth/src/style.css`, `C:/Users/doner/html_cloth/src/main.js`.
- Existing fonts in `index.html` are `Cormorant Garamond` and `Manrope`; these already lean editorial but the current composition/copy is still generic. Executor can either use them more boldly or replace them if necessary.
- The current hero already has two effect constructors: `createRippleHero(texture)` and `createPointCloudHero(texture)`. Preserve them and work around them rather than rebuilding the engine.
- The point-cloud path already exposes useful telemetry through `getDebugState()`. Ripple mode has no equivalent debug method yet; if needed, add a lightweight one or compute UI metrics from existing ripple state (`impulses.length`, hover state, etc.).
- `changeSlide()` currently animates opacity during transitions and swaps `activeEffect`; any UI console should reflect transition state during this window instead of freezing.
- Current tests assert slide switching and mode switching through DOM state and `window.__heroDebug.getState()` in `playwright-verify-pointcloud.spec.js`; avoid breaking those assumptions.
- `graphify-out/` is absent in this repo, confirmed by the intake and file check.
- The redesign should be decisively non-generic: think luxury editorial briefing meets cinematic lab instrument cluster, not just nicer glassmorphism.

[PLANNER CONTEXT - END]
self_estimate: ~18%
