---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260518-160036
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~15%"
context_handoff_threshold_percent: 65
context_handoff_threshold_source: default
verification_requested: true
---

# ATT_0_INTAKE — Desktop Drawing-to-Interactive-Control Prototype, Test-First Slice

## Task Summary
Execute a NenFlow v3 implementation run for the first slice of a desktop prototype app that converts hand drawings containing boxes, sliders, and connectors into visually faithful interactive controls. The implementation must maintain reality contact through tests: no Executor claim may be marked PASS unless supported by a test, runtime check, fixture, or explicit evidence artifact.

Current project folder:
`C:\Users\doner\drawing_frontend_end`

Existing files from previous one-off artifact:
- `index.html`
- `assets/drawing-underlay.jpeg`

## Task Type
Implementation slice for a local desktop app prototype, with test-first discipline and independent verification.

## User Intent
The user wants to move from a manually recreated one-off HTML drawing toward a reusable desktop app for importing multiple hand-drawn control diagrams, preserving their visual layer, correcting semantic objects, and interacting with boxes/sliders/connectors. The user specifically wants tests to be built and run so that planner/executor theories stay grounded in observable behavior.

## Goal Attractor
A small but real first implementation slice that establishes the architecture, data model, geometry behavior, test harness, and a minimal desktop-app-shaped interface without overclaiming full image processing or full automatic detection. Every implemented claim should be backed by passing tests or explicitly marked unverified.

## Scope for This Run
This run should implement the **first slice**, not the full product.

Recommended first-slice outcomes:
- Add a project scaffold for a desktop-app-oriented codebase.
- Preserve the existing one-off artifact unless replacing it is explicitly planned and tested.
- Add a shared semantic data model for drawings, controls, connectors, and runtime state.
- Add geometry/interaction primitives that can be tested without a full UI.
- Add a minimal manual-editor or preview surface if feasible.
- Add a test harness and representative tests for geometry, schema validation, persistence helpers, slider projection, connector snapping, and semantic state changes.
- Include test fixtures using the existing `assets/drawing-underlay.jpeg` or a copied fixture reference if useful.

Out of scope for this first run:
- Full automatic CV pipeline.
- Full production desktop packaging.
- ML model training.
- Complete human correction UI.
- Claiming arbitrary drawing conversion works.

## Hard Execution Invariant: Tests Before PASS
The Executor must not report any feature, theory, implementation behavior, or insight as PASS unless it has evidence from at least one of:
- automated test run,
- runtime check,
- fixture-based check,
- explicit file/command evidence,
- browser/app smoke test,
- schema validation.

If a claim is not tested, the Executor must mark it as **UNVERIFIED**, not PASS.

Examples:
- Slider projection works only if a test proves value clamping/projection.
- Connector snapping works only if a test proves nearest endpoint behavior.
- Persistence works only if a test writes and reads representative JSON.
- UI smoke works only if a runtime/browser check loads without errors.
- Image processing works only if run against a real/representative fixture.

## Constraints
- Target product direction: desktop app.
- First implementation may use the most practical testable foundation, even if full Electron packaging is deferred.
- Python local processing is acceptable, but full CV implementation is not required in this slice.
- Human correction UI is required in the overall prototype, but first slice may build foundations/manual semantic primitives.
- GPL tools like Potrace/AutoTrace are acceptable later, but need not be integrated now.
- Supported drawing vocabulary: boxes, sliders, connectors.
- Visual layer and semantic interaction layer must remain distinct.
- Existing original image asset should remain available as a visual reference.
- Tests must be runnable locally from the project folder.

## Invariants
1. Preserve existing source/reference image asset unless there is a tested reason to alter a copy.
2. Do not claim full drawing-to-interactive conversion in this run.
3. Maintain separation of visual layer and semantic layer.
4. Keep semantic controls manipulable as code/JSON.
5. Use tests as reality contact before declaring PASS.
6. Mark untested claims UNVERIFIED.
7. Prefer small, inspectable architecture over overbuilt app scaffolding.
8. Verifier must independently inspect test evidence, not just Executor narrative.

## Success Criteria
1. A testable first-slice implementation exists in the project folder.
   - Evidence required: file listing and changed/created files.
2. Tests are defined and run.
   - Evidence required: command output showing passing/failing tests.
3. Geometry primitives for boxes/sliders/connectors are implemented or explicitly deferred.
   - Evidence required: tests for implemented primitives, UNVERIFIED/deferred notes otherwise.
4. Semantic model is defined for drawings, controls, connectors, and visual/semantic separation.
   - Evidence required: schema/types and tests or sample fixture validation.
5. A minimal UI/app surface or scaffold exists for the desktop direction.
   - Evidence required: smoke test, static check, or clear UNVERIFIED marking if not runnable.
6. Existing one-off artifact/reference image remains available.
   - Evidence required: file checks.
7. Execution report clearly distinguishes PASS, FAIL, and UNVERIFIED.
   - Evidence required: execution report sections.

## Ambiguities
- Exact desktop stack is not fully locked. Planner should choose a pragmatic first-slice stack that can be tested in this environment.
- Full dependency installation may or may not be available. Planner/Executor should prefer tests that can run reliably; if external deps are used, install and test them or mark affected claims unverified.
- UI completeness is less important than test-backed architecture foundation.

## Routing Decision
Proceed to PLAN, then EXECUTE, then VERIFY. Verification is required for this run because the user explicitly emphasized tests and verification as reality contact.

## Epistemic Map

### Known
- Existing folder contains previous static HTML artifact and drawing underlay asset.
- User wants Plan B: first implementation slice.
- User wants tests before pass and tests for insights/theories.
- Long-term target is a desktop app for multiple drawings with boxes, sliders, connectors.
- Python local processing is acceptable.
- Human correction UI is required for the overall prototype.

### Inferred
- The safest first implementation is a tested foundation: data schema, geometry, persistence, and minimal UI/scaffold.
- Full image processing should not be attempted as the first claim unless tests are created around fixtures.
- Verifier should check evidence rigorously.

### Assumed
- Node.js is available or can be used for project tests; if not, Executor should create an alternative runnable test method.
- It is acceptable to add package/config/source/test files to the project.
- Existing one-off `index.html` can remain as legacy/reference unless a new app scaffold requires another entrypoint.

### Unknown
- Whether npm install/network access is available.
- Whether Electron dependencies are already installed.
- Whether the user wants the previous static artifact preserved as-is long-term.

## Affordance Landscape

### For the Human
- Review concrete first-slice files and test outputs.
- See which claims are verified vs unverified.
- Approve the next slice based on evidence.

### For the Planner
- Design implementation scope around testable claims.
- Require tests per planned behavior.

### For the Executor
- Build small modules and tests first.
- Run tests before reporting PASS.
- Mark anything not exercised as UNVERIFIED.

### For the Verifier
- Inspect actual files and command outputs.
- Re-run tests if feasible.
- Reject overclaims.

## Attractors and Failure Modes

### Useful Attractors to Strengthen
- Test-first implementation.
- Small, inspectable modules.
- Evidence before claims.
- Separation of visual and semantic layers.
- Manual correction foundations before brittle automation.

### Bad Attractors to Counter
- Creating a large app shell with no verified behavior.
- Claiming conversion works without image-processing tests.
- Treating UI mockups as working desktop functionality.
- Omitting tests due to speed.
- Hiding dependency/test failures.

### Counter-Constraints
- Executor must include test commands and outputs.
- Verifier must independently classify evidence.
- Untested claims must be UNVERIFIED.
- Scope must remain first-slice only.

## Representative Environment
- Local Windows project folder under Pi.
- Existing drawing image fixture at `assets/drawing-underlay.jpeg`.
- Node/Python-capable local development environment, subject to verification.
- Target user workflow eventually: import multiple hand-drawn box/slider/connector diagrams into a desktop app, correct semantics, test interactions.

## Perturbation Tests
1. Missing dependency test
   - Perturbation: npm/Electron dependencies unavailable.
   - Expected response: implement/test core logic with available runtime and mark UI runtime unverified if needed.
   - Failure condition: report PASS despite unrunnable tests.
2. Geometry edge test
   - Perturbation: drag outside slider bounds.
   - Expected response: value clamps to min/max.
   - Failure condition: unclamped or untested slider logic.
3. Ambiguous connector test
   - Perturbation: endpoint near multiple controls.
   - Expected response: deterministic nearest/snap behavior with tie/threshold handling.
   - Failure condition: connector snap claimed without test.
4. Persistence test
   - Perturbation: save/load representative semantic model.
   - Expected response: round-trip preserves controls/connectors.
   - Failure condition: persistence claimed without file round-trip test.
5. Scope creep test
   - Perturbation: Executor attempts full CV pipeline.
   - Expected response: defer or create limited fixture test only.
   - Failure condition: broad claims without evidence.

## Falsifiers
- Executor reports PASS without tests/evidence.
- Tests are written but not run.
- Test failures are hidden or minimized.
- Semantic and visual layers are conflated.
- Existing reference image is removed or broken.
- Implementation claims full arbitrary drawing conversion.

## Human Gates
- After this run, human should approve whether to proceed to real CV preprocessing/tracing, more UI correction tooling, or desktop packaging.

## Handoff Notes
Planner should produce a plan where each implementation task has explicit tests/evidence requirements. Executor must implement only the first slice and run tests before PASS. Verifier must re-run or inspect evidence and fail overclaims.
