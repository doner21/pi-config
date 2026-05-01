---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260424-223315
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~14%"
---

# Task Summary
Refine the current hero image point-cloud effect so it becomes subtler and preserves the source image visually. The current behavior creates too large a dispersion hole and visually reads like a black-and-white/negative treatment instead of a dispersion of the original full-color image. The user also explicitly requests that a researcher agent investigate feasibility/patterns before planning, and asks that the result be checked using the Playwright MCP server.

# Task Type
Frontend visual-effect refinement in an existing Three.js/Vite application, with required research and browser-based interaction checking.

# User Intent
The user wants the point-cloud mode to feel like the actual image gently disperses into particles rather than blowing apart into a large hole or becoming tonally inverted. They want a more subtle, premium effect and specifically want research before implementation.

# Goal Attractor
Deliver a refined point-cloud hero mode where:
- the original image colors are preserved in the particle treatment,
- hover creates a subtle local dispersion rather than a destructive large void,
- pointer leave causes graceful reintegration,
- the effect remains compatible with the existing hero mode selector and slide system,
- browser-based checking is attempted with the available Playwright/MCP browser tooling.

# Constraints
- Must follow NenFlow v3 with an explicit RESEARCH phase before planning.
- Work within the existing Vite + Three.js app.
- Preserve the existing ripple mode and mode-toggle UI.
- Keep hero presentation flat and full-bleed.
- Prefer minimal, targeted changes.
- `graphify-out/` is absent in this repo.
- Browser checking should use the available Playwright MCP/browser tooling if operational in this environment.

# Invariants
- Ripple mode must remain available and not regress.
- Point-cloud mode must remain selectable via the existing button UI.
- Point-cloud reintegration on pointer leave must remain intact.
- The effect should read as the source image dispersing, not a monochrome/negative conversion.
- The dispersion should be more restrained and localized than the current implementation.

# Success Criteria
- Research artifact documents feasible approaches for a subtler, full-color image-preserving point cloud in Three.js.
- Plan reflects those findings and proposes minimal code changes.
- Implementation reduces the dispersion radius/intensity enough to avoid a massive hole.
- Implementation preserves source-image color appearance in point-cloud mode.
- Ripple mode and slide switching continue to work.
- Build passes.
- Browser/Playwright-based interaction check is attempted and documented.

# Ambiguities
- The user says the point cloud appears black-and-white/negative; this may be caused by additive blending and sparse particle rendering rather than literal grayscale conversion, because the current code already samples per-pixel color.
- The exact desired subtlety level is subjective and may need aesthetic tuning after a first refinement pass.
- Playwright MCP/browser tools may or may not be fully operational in this harness; this should be attempted and documented either way.

# Routing Decision
Proceed to RESEARCH first, per explicit user request. Research should focus on how to preserve the underlying image look in a point-cloud effect and how to reduce destructive dispersion while maintaining readable motion.
