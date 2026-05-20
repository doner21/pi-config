---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260424-222231
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~12%"
---

# Task Summary
Add or confirm a hero-image interaction mode called point cloud dispersion reintegration, where hovering over the image disperses image particles and leaving the image causes reintegration. The user also wants a button-based choice on hero images between ripple and point cloud modes.

# Task Type
Frontend feature implementation and verification in an existing Three.js/Vite demo.

# User Intent
The user wants the previously explored image effects expanded so hero images can switch between at least two distinct interactive visual modes: ripple and point cloud. The point cloud mode should visually disperse on hover and reform on pointer leave.

# Goal Attractor
Deliver a hero experience where:
- hero slides can be switched,
- the current slide can be shown in ripple mode or point cloud mode via UI buttons,
- ripple mode reacts to hover/click with displacement-like ripple behavior,
- point cloud mode reacts to hover with dispersal and automatically reintegrates when hover ends.

# Constraints
- Work within the existing Vite + Three.js app.
- Preserve existing hero slide navigation.
- Keep the effect selectable through buttons in the hero UI.
- Avoid breaking current ripple behavior while adding or validating point cloud behavior.
- No graphify artifacts are available in this repo (`graphify-out/` absent).

# Invariants
- The hero remains a flat full-bleed image presentation.
- Mode switching must remain explicit and user-driven.
- Pointer leaving the image must restore the point cloud toward the source image.
- Changes should stay localized to the current app structure unless necessary.

# Success Criteria
- A visible point cloud mode exists for hero images.
- Hovering causes particle dispersion.
- Pointer leave causes reintegration.
- Buttons allow switching between ripple and point cloud modes.
- Build/test evidence confirms the implementation state.

# Ambiguities
- It is possible some or all requested behavior is already implemented from earlier experimentation.
- If already implemented, the task becomes validation plus any needed refinement rather than net-new feature work.

# Routing Decision
Proceed directly to PLAN. The repo is small and the request is implementation-oriented; no separate research phase is required.
