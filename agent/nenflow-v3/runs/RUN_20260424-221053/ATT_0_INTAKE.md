---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260424-221053
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~4%"
---

# ATT_0 — INTAKE

## Task Summary
Add a new hover-driven point-cloud dispersion/reintegration image effect alongside the existing ripple and displacement image effects, and allow hero images to switch between point-cloud and ripple modes via a button.

## Task Type
feature

## User Intent
The user wants to expand the current interactive image treatment system with a more visually striking option that turns an image into a point cloud, disperses it on hover, and smoothly restores it when the cursor leaves, while also giving users an explicit way to choose between major hero-image effects.

## Goal Attractor
The experience feels like a polished interactive gallery/hero system where existing image effects still work, a new point-cloud mode is available as a distinct effect, and hero images can visibly toggle between ripple and point-cloud behavior without confusion or regressions.

## Constraints
- The new effect must be separate from the existing ripple and displacement effects, not a replacement.
- The point-cloud effect must work from any image source used by the current image effect system.
- Hovering over an image must trigger dispersion of the point cloud.
- Moving the mouse away must trigger reintegration back into the original image.
- Hero images must expose a button-based choice between at least point-cloud and ripple effects.
- Existing experimentation with ripple and displacement implies the project already has an interactive image-effects implementation that should be extended rather than rebuilt from scratch.
- The request is framed as a UI/interaction enhancement, so the result should remain visually coherent and performant enough for normal interactive use.

## Invariants
- Existing ripple behavior must continue to function.
- Existing displacement behavior must not be broken, even if it is not part of the hero-image toggle.
- Images must still be recognizable as the source image before hover and after reintegration.
- The new point-cloud effect must reintegrate reliably when hover ends; it cannot leave images in a corrupted or partially dispersed state.
- Hero-image controls must clearly switch effect modes rather than ambiguously mixing multiple active hero effects at once.
- The change must preserve the current image presentation flow and must not remove existing effect options already being used.
- The implementation must avoid introducing obvious interaction regressions such as stuck hover state, unusable buttons, or broken image rendering.

## Success Criteria
1. A distinct point-cloud image effect exists in the application and can be applied to images handled by the current effect system.
2. When the pointer hovers over an image using the point-cloud effect, the image disperses into a point-cloud presentation.
3. When the pointer leaves that image, the dispersed points animate or transition back into the original integrated image state.
4. Existing ripple effect behavior remains available and functional after the change.
5. Existing displacement effect behavior remains functional after the change.
6. On hero images, a visible button-based control allows selecting ripple mode or point-cloud mode.
7. Switching the hero-image mode changes the effect the hero image uses in a way that is observable in the UI.
8. The hero-image effect selection and hover interactions work without obvious broken states such as frozen dispersion, missing image content, or controls that do nothing.

## Ambiguities
- Whether the point-cloud effect should be available on all images globally or only on specific images/components in addition to hero images.
- Whether the hero-image button should be a per-image toggle, a global mode selector for all hero images, or a cycling control.
- Whether displacement should also be selectable from the hero-image control or remain separate from the new point-cloud/ripple switch.
- The desired visual density, particle behavior, and performance targets for the point cloud are unspecified.
- Accessibility and non-hover behavior for touch devices are not specified.

## Routing Decision
PLAN
The task is clear enough to frame and plan, but it affects interactive behavior, existing effects, and UI controls, so a structured plan is appropriate before execution.
