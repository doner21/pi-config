---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260424-231213
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~16%"
---

# Task Summary
Refine the hero image point-cloud mode so it still looks like the underlying picture, but can be dramatically destroyed on hover and then rapidly reintegrated. The user explicitly requests a researcher phase first, including research into whether OpenCV can help, and requires proper verification with a working MCP/browser path.

# Task Type
Frontend interactive visual-effect redesign/refinement in an existing Three.js/Vite application, with required research and browser-based verification.

# User Intent
The user wants the point-cloud mode to preserve the recognizability of the source image while allowing a stronger “destruction and fast reassembly” behavior than the current subtle dispersion. They also want confidence that the effect is verified in-browser, not only inferred from source code.

# Goal Attractor
Deliver a point-cloud hero mode where:
- the image still reads as the original picture at rest,
- hovering can strongly disrupt or destroy the picture into particles,
- reintegration happens quickly and convincingly,
- the effect remains compatible with the existing hero buttons, slides, and ripple mode,
- OpenCV-relevant options are researched before planning,
- MCP/browser verification is performed through a stable path.

# Constraints
- Must follow NenFlow v3 with an explicit RESEARCH phase before planning.
- Work within the existing Vite + Three.js app.
- Preserve ripple mode and slide navigation.
- Keep the hero flat and full-bleed.
- Prefer minimal architecture changes unless needed to hit the new visual target.
- OpenCV is not currently present in package.json, so any OpenCV use would need to be justified and feasible for this repo.
- `graphify-out/` is absent in this repo.
- Verification should use MCP/browser tools and should prefer a stable serving mode over flaky HMR where possible.

# Invariants
- Ripple mode must remain selectable and functional.
- Point-cloud mode must remain selectable through the existing hero UI.
- The point-cloud visual must still resemble the actual image, not an abstract monochrome field.
- Reintegration after hover disturbance must remain present and become faster/more decisive than the current behavior.
- Verification must include an actual browser-access attempt through MCP tooling.

# Success Criteria
- Research artifact documents whether OpenCV is useful here and what role it could realistically play.
- Plan selects an implementation path grounded in the current Three.js architecture.
- Point-cloud mode still reads as the original picture at rest.
- Hover can cause a much more dramatic breakup/destruction than the current subtle dispersion.
- Particles reassemble quickly after hover/leave.
- Ripple mode and slide switching still work.
- Build passes.
- MCP/browser verification is successfully attempted via a stable route and documented with evidence.

# Ambiguities
- “Completely destroy the image” is aesthetic rather than binary; implementation likely needs a controlled destruction radius/impulse model rather than literally losing all image coherence globally.
- OpenCV may help with preprocessing/sampling/masks/edge-aware particle generation, but it may not be necessary for the real-time runtime effect itself.
- Browser MCP stability depends on the serving mode and harness behavior; `vite preview` may be preferable to `vite dev`.

# Routing Decision
Proceed to RESEARCH first, per user instruction. Research should evaluate OpenCV usefulness, the best way to preserve image fidelity while enabling dramatic breakup/reassembly, and stable MCP/browser verification strategy.
