---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260518-164720
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~15%"
context_handoff_threshold_percent: 40
context_handoff_threshold_source: user_prompt
---

# ATT_0_INTAKE — Ecological Intake for NenFlow v3

## Task Summary
Produce a staged NenFlow v3 continuation specification for finishing the `drawing_frontend_end` prototype, preserving the existing verified drawing interaction foundation while expanding toward the full product prototype: desktop shell, import workflow, multi-drawing workflow, manual correction editor, Python image processing, and automatic detection.

## Task Type
- Ecological spec-driven development intake
- Multi-agent NenFlow v3 orchestration setup
- Staged product prototype continuation
- Evidence-driven implementation and verification workflow

## Raw Prompt
```text
We need to finish off everything that needs to be done. I want to go through the spectra of an ecology, and then I need to run a nanflow planner executor run. I need the executor to verify insights and hypothesis that either itself or the planner comes up with through solid tests. I also need subdivision of labor so If the executor goes over a context window of 40%, it needs to finish what it's doing right at handoff.md and let the orchestrator point a new executor towards that handoff and continue the work. This needs to continue until everything is finished. So, if any of the subagents go over 40% of their context window, they need to handoff and a new agent needs to be spawned to continue the work.
```

## Clarified Intent
The human wants this run to use ecological intake, then proceed into NenFlow planning and execution, with strict evidence requirements and context-window subdivision. "Everything finished" means the full product prototype, not merely the next small patch: desktop shell, import workflow, multi-drawing workflow, manual editor, Python image processing, and automatic detection.

The work should follow the staged order already recorded in `handle.md`. The user accepts the likely stack direction: Electron plus web/SVG UI first, with a later local Python image-processing service or bridge. Executors may add dependencies when justified by tests. Each successful verified slice must update `handle.md` and all subagents must use canonical NenFlow continuation contracts if context saturation reaches 40%.

## Purpose
Create a durable, test-driven continuation loop that can carry the prototype from its current verified interactive-preview foundation to a fuller desktop drawing-to-interactive-control prototype without losing visual fidelity, semantic correctness, evidence discipline, or work continuity across context windows.

## Current Context

### Project
- Project cwd: `C:/Users/doner/drawing_frontend_end`
- Primary handoff/source-of-truth: `C:/Users/doner/drawing_frontend_end/handle.md`
- Run config: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260518-164720/RUN_CONFIG.json`
- Intake output path: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260518-164720/ATT_0_INTAKE.md`

### Existing Source-of-Truth Files
- `handle.md`
- `package.json`
- Existing tests under `tests/`
- Existing app files under `app/`
- Core modules under `src/core/`
- Fixture: `fixtures/sample-drawing.json`
- Preserved visual asset: `assets/drawing-underlay.jpeg`
- Preserved root static artifact: `index.html`

### Current Verified State Reported by `handle.md`
- Previous NenFlow run: `RUN_20260518-160036`
- Previous verifier verdict: `PASS`
- Existing runtime preview interactions are reported verified.
- Reported latest test result: `26 tests passed`, `0 failed`.
- Existing verified behavior includes model validation, visual/semantic/runtime separation, geometry helpers, persistence helpers, runtime box/slider interaction, connector highlighting, inspector updates, and smoke checks preserving root `index.html` and `assets/drawing-underlay.jpeg`.

### Current Scripts in `package.json`
- `npm run build` → `node scripts/build-check.mjs`
- `npm test` → `node --test`
- `npm run smoke` → `node scripts/smoke-ui.mjs`
- `npm run check` → `npm run build && npm test && npm run smoke`

### Graphify Context
No local `graphify-out/GRAPH_REPORT.md` was found in this project during intake. The intake relies on `handle.md`, `package.json`, and repo files as the current source of truth.

## Desired Future State
A staged but ultimately complete prototype exists where a user can:

1. Import one or more photographed drawings.
2. See the original/normalized/traced visual layer while preserving the real drawing feel.
3. Detect or manually mark boxes, sliders, and connectors.
4. Correct geometry, semantic labels, and connector endpoints.
5. Test interactions directly on the drawing.
6. Save/load multi-drawing projects.
7. Run local Python-backed image-processing and automatic detection assistance.
8. Use the workflow in a desktop shell.

The prototype should not be claimed complete until all listed prototype areas are implemented and verified, or explicitly marked out of scope by the human.

## User Intent
The human wants the NenFlow process itself to enforce disciplined continuation: plan, execute, verify, and loop through failures until finished. The human especially wants planner/executor hypotheses to be tested rather than accepted narratively.

## Goal Attractor
A faithful drawing-first desktop prototype with a human-corrected semantic interaction layer, developed through small verified slices that survive context-window handoffs.

## Epistemic Map

### Known
- The run id is `RUN_20260518-164720`.
- The configured context handoff threshold is 40% from the user prompt.
- `RUN_CONFIG.json` records warning threshold 35% and hard-risk threshold 45%.
- The exact intake artifact path is `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260518-164720/ATT_0_INTAKE.md`.
- The exact intake continuation path, if needed, is `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260518-164720/ATT_0_CONTINUATION_INTAKE_1.md`.
- The human clarified that full prototype scope includes desktop shell, import workflow, multi-drawing workflow, manual editor, Python image processing, and automatic detection.
- The human approved the staged order from `handle.md`.
- The human approved likely stack direction: Electron + web/SVG UI, later local Python image-processing service/bridge.
- The human allows justified new project dependencies when supported by tests.
- `handle.md` requires `handle.md` updates after each successful verified slice.
- `handle.md` reports 26 tests passing and prior runtime preview browser evidence.
- `index.html` and `assets/drawing-underlay.jpeg` must be preserved unless explicitly approved otherwise.

### Inferred
- The next best route is PLAN, not more clarification, because the user supplied material clarifications and `handle.md` contains staged source-of-truth guidance.
- The next implementation slice should likely start with the manual correction editor foundation because `handle.md` recommends it before desktop shell, multi-drawing, and image processing.
- Electron is the default desktop-shell direction unless the Planner discovers a tested blocker or a human gate changes the stack.
- Python image processing should be introduced after the editor/multi-drawing foundation unless the Planner finds a lower-risk staged bridge first.

### Assumed
- The repo state still matches `handle.md`; the next Executor/Verifier must re-run baseline checks before relying on the prior reported 26-pass state.
- Windows is the primary local development environment because paths are Windows-style, but cross-platform production packaging is not yet required.
- The manual editor can begin with tested model/state operations before advanced visual/UI polish.
- Automatic detection can be incremental and assistive; it does not need to replace human correction.

### Unknown
- Exact desktop packaging target and distribution format.
- Exact UI framework choice inside the web/Electron shell, if any.
- Exact Python image-processing library set.
- Exact visual-fidelity metric for arbitrary drawings.
- Exact minimum acceptable automatic-detection accuracy.

### Material Unknowns
None block planning. The unknowns above should become Planner decisions, Executor research/test spikes, or human gates before irreversible commitments.

## Invariants

1. No PASS without evidence.
   - Why it matters: Prevents plausible but unverified progress claims.
   - Verification method: Every PASS claim must cite automated test, runtime/browser smoke test, fixture-based test, schema validation, command output, or explicit file evidence.

2. Planner/executor hypotheses must be verified with solid tests or marked `UNVERIFIED`.
   - Why it matters: The human explicitly requires insight/hypothesis verification.
   - Verification method: Plans and execution reports must distinguish tested claims from untested assumptions.

3. Preserve faithful visual layer + human-corrected semantic layer.
   - Why it matters: The product goal is interaction on top of the original drawing, not replacement by generic UI.
   - Verification method: Inspect model boundaries and runtime rendering; require evidence that original/normalized drawing remains the visual substrate.

4. Preserve `index.html` and `assets/drawing-underlay.jpeg` unless the human explicitly approves changes.
   - Why it matters: These are named preserved artifacts.
   - Verification method: File existence and content-preservation checks in smoke/build or explicit command output.

5. Keep `visualLayer`, `semanticLayer`, and `runtimeState` separate.
   - Why it matters: Prevents flattening the core architecture and makes manual correction/image processing tractable.
   - Verification method: Model/state tests and code inspection evidence.

6. Context handoff threshold is 40% for all subagents.
   - Why it matters: The human requested subdivision of labor before context degradation.
   - Verification method: Each role prompt and artifact must carry threshold metadata from `RUN_CONFIG.json`.

7. Subagents must write canonical continuation contracts under the run directory when threshold is reached.
   - Why it matters: Fresh agents must be able to continue without hidden context.
   - Verification method: Validate continuation contracts with the NenFlow validator before resuming.

8. `handle.md` must be updated after each successful verified slice.
   - Why it matters: It is the project-level durable handoff and source of truth.
   - Verification method: Execution/verification evidence must include the `handle.md` update after PASS.

9. Full prototype scope must remain staged.
   - Why it matters: Prevents claiming the full product is done after only one slice.
   - Verification method: Verification must check prototype-area completion matrix or explicit human out-of-scope decisions.

## Constraints

### Technical Constraints
- Existing Node ESM project and tests must remain functional.
- Likely stack direction is Electron + web/SVG UI, with Python local processing/bridge later.
- New dependencies are allowed only when justified by tests or required runtime evidence.
- Python image processing must be introduced with tested bridge/stub behavior before large CV claims.

### Repo/File Constraints
- Preserve `index.html` and `assets/drawing-underlay.jpeg` unless explicitly approved.
- Preserve existing tests and add tests for new claims.
- Use `handle.md` as project-level continuity after each successful slice.

### Design Constraints
- Do not replace the drawing with generic clean UI unless explicitly requested.
- Interaction should feel overlaid on the real drawing.
- Automatic detection should assist human correction, not bypass it.

### Human Constraints
- Avoid asking non-material questions before planning.
- Human gates are required for destructive changes, major stack reversals, and replacing preserved assets.

### Orchestration Constraints
- All subagents use 40% context handoff threshold.
- If a subagent reaches threshold, it must finish the current atomic unit, write a canonical continuation contract in the run directory, and stop.
- The orchestrator must resume with a fresh same-role agent using the continuation contract.
- If verification fails, orchestration should continue back through planning/execution rather than stopping after one failure.

### Verification Constraints
- Re-run baseline checks first: `npm run build`, `npm test`, `npm run smoke`, and `npm run check` as appropriate.
- Runtime/browser/desktop claims require runtime evidence, not only static tests.
- Image-processing claims require fixture execution and output artifacts.

## Affordance Landscape

### For the Human
- Can correct semantic interpretation of drawings manually.
- Can approve or reject major stack/dependency/asset decisions.
- Can use `handle.md` to understand current project state without reading all run artifacts.

### For the Planner
- Can derive staged work from `handle.md` and this intake.
- Can sequence manual editor, desktop shell, multi-drawing workflow, Python stub, and real detection.
- Can define evidence per slice before execution.

### For the Executor
- Can begin with existing `npm run check` and current tests.
- Can add focused dependencies when justified by a testable slice.
- Can update `handle.md` after verified progress.
- Can hand off at 40% with a continuation contract instead of overextending.

### For the Verifier
- Can reject claims lacking command output, file evidence, runtime evidence, or fixture artifacts.
- Can compare work against invariants, scope matrix, and falsifiers.
- Can force retry loops when a slice fails.

### Actions That Should Be Difficult or Blocked
- Deleting/replacing preserved visual assets.
- Collapsing the visual and semantic layers.
- Claiming automatic detection works without fixture evidence.
- Claiming full product completion after a partial slice.
- Continuing past 40% context without a continuation contract.

## Attractors and Failure Modes

### Useful Attractors to Strengthen
- Small verified slices.
- Tests before PASS claims.
- Read `handle.md` before editing.
- Preserve original drawing visual layer.
- Use runtime evidence for runtime claims.
- Update durable handoff after success.

### Bad Attractors to Counter
- Jumping into broad implementation without staging.
- Overbuilding automatic CV before manual correction workflow exists.
- Replacing hand drawings with generic UI components.
- Treating passing unit tests as proof of desktop/browser behavior.
- Hiding failed tests or marking hypotheses as facts.
- Losing work during long executor context windows.

### Counter-Constraints
- Planner must define per-slice evidence before execution.
- Executor must mark untested claims `UNVERIFIED`.
- Verifier must independently inspect evidence, not trust narrative.
- Subagents must use canonical continuation contracts at 40%.
- `handle.md` must be updated only after successful verified slices.

### Early Warning Signs
- A plan starts with full image detection before editor/import foundations.
- An execution report says "works" without command output or browser/fixture evidence.
- A desktop-shell claim lacks a launch smoke test.
- A visual-fidelity claim lacks screenshot/overlay/file evidence.
- A continuation file is vague or outside the run directory.

## Scope

### In Scope
- Continue the full product prototype through staged NenFlow loops.
- Manual correction editor foundation.
- Desktop shell prototype, likely Electron + web/SVG UI.
- Drawing import workflow.
- Multi-drawing project workflow.
- Python image-processing service/bridge.
- Automatic detection of boxes, sliders, and connectors.
- Tests, runtime smoke checks, fixture-based verification, and durable handoffs.

### Out of Scope Unless Human Adds It
- Production-grade installer/distribution hardening.
- Cloud sync or multi-user collaboration.
- Replacing the original drawing with a generic clean UI.
- Deleting/replacing preserved `index.html` or `assets/drawing-underlay.jpeg`.

### Deferred Within Scope
- Real image processing should follow foundational editor/import/multi-drawing work unless the Planner identifies a safer earlier stub.
- Automatic detection accuracy thresholds should be defined before real detection is claimed complete.

### Requires Human Gate
- Changing away from the approved Electron + web/SVG + later Python direction.
- Introducing large or risky dependencies.
- Replacing preserved visual assets.
- Declaring a prototype area out of scope.
- Claiming final full prototype completion.

## Representative Environment

### Real Use Context
A desktop prototype for photographed hand drawings composed of boxes, sliders, and connectors. Users need to preserve the drawing's real visual appearance while adding and correcting semantic interaction regions.

### Realistic Inputs
- Existing fixture: `fixtures/sample-drawing.json`.
- Existing image asset: `assets/drawing-underlay.jpeg`.
- Future imported photographed drawings with imperfect lighting, perspective, line quality, and ambiguous connector endpoints.

### Realistic Edge Cases
- Multiple drawings in one project.
- Duplicate or invalid control IDs.
- Connector endpoints near multiple possible anchors.
- Slider bounds/value inconsistencies.
- Image files with unsupported paths or dimensions.
- Python service unavailable or returning no candidates.
- UI interactions that work in unit tests but fail in browser/Electron runtime.

### Misleading Toy Conditions to Avoid
- Testing only generated clean rectangles instead of photographed drawings.
- Verifying image processing only by checking that a function returns an object.
- Claiming visual fidelity without inspecting generated visual output.
- Claiming desktop readiness without launching the shell.

### Evidence Needed From Real or Representative Use
- `npm run check` output.
- Unit tests for model/state/editor/persistence behavior.
- Runtime/browser or Electron smoke evidence for UI behavior.
- File evidence for import/save/load workflows.
- Fixture image-processing output artifacts.
- Screenshots or overlays for visual layer claims where applicable.

## Perturbation Tests

1. Vague Prompt Test
   - Perturbation: A future prompt says only "finish the app."
   - Expected response: Agent reads `handle.md` and this intake, stages work, and avoids claiming full completion prematurely.
   - Failure condition: Agent implements an arbitrary feature without mapping it to prototype scope and evidence.

2. Overloaded Prompt Test
   - Perturbation: A future prompt asks for editor, desktop, import, CV, and detection all in one executor pass.
   - Expected response: Planner slices work and enforces continuation at 40%.
   - Failure condition: Executor attempts all areas in one context and produces weak evidence.

3. Contradiction Test
   - Perturbation: A proposed implementation wants to overwrite the drawing with a clean generated UI.
   - Expected response: Agent blocks or escalates because it violates faithful visual layer invariant.
   - Failure condition: Generic UI replaces the drawing without explicit human approval.

4. Context Loss Test
   - Perturbation: Executor reaches 40% context during an unfinished slice.
   - Expected response: Executor finishes current atomic unit, writes a valid continuation contract under the run directory, and stops.
   - Failure condition: Executor continues past threshold or leaves only informal notes.

5. Verification Weakness Test
   - Perturbation: Tests pass, but no browser/Electron runtime evidence exists for a runtime claim.
   - Expected response: Verifier marks runtime claim FAIL or UNVERIFIED and routes back to execution.
   - Failure condition: Verifier accepts narrative as proof.

6. Scope Creep Test
   - Perturbation: Planner proposes production packaging, cloud sync, or broad redesign before prototype areas are done.
   - Expected response: Planner defers or requires human gate.
   - Failure condition: Executor spends effort outside full prototype scope while core areas remain incomplete.

## Success Criteria

1. Baseline remains healthy before each slice.
   - Evidence required: Fresh command output for `npm run check` or justified subset plus final full check.
   - Verification method: Verifier inspects command output and failures.

2. Each implemented feature has direct evidence.
   - Evidence required: Automated tests, runtime/browser/Electron smoke tests, fixture tests, schema validation, command output, or explicit file evidence.
   - Verification method: Verifier maps each claim to evidence and rejects unsupported claims.

3. Manual correction editor foundation works.
   - Evidence required: Tests for add/edit/delete/select/move/resize/snap/save semantics, plus browser/runtime evidence for representative UI operations if UI is added.
   - Verification method: Unit and persistence tests; runtime smoke where applicable.

4. Desktop shell works when that slice is reached.
   - Evidence required: Launch smoke test, app loads project/drawing, no runtime console errors for basic workflow.
   - Verification method: Electron/runtime command evidence and file checks.

5. Import and multi-drawing workflows work when reached.
   - Evidence required: Tests for import fixture copy/reference behavior, project manifest save/load, drawing list/status transitions, and per-drawing semantic models.
   - Verification method: Unit/integration tests plus file evidence.

6. Python processor bridge works when reached.
   - Evidence required: Python unit tests, Node/Python bridge smoke test, fixture image processed without error, output/result file evidence.
   - Verification method: Command output and artifact inspection.

7. Automatic detection claims are fixture-backed when reached.
   - Evidence required: Real fixture execution, candidate output, measurable or inspectable detection result, and explicit accuracy/limitation notes.
   - Verification method: Fixture tests and artifact review.

8. Durable continuity is maintained.
   - Evidence required: `handle.md` updated after each successful verified slice; canonical continuation contracts validated if any role hits threshold.
   - Verification method: File diff/evidence and validator output.

## Falsifiers

1. Any PASS claim lacks evidence.
   - Why it invalidates success: Violates the primary testing invariant.

2. `visualLayer`, `semanticLayer`, and `runtimeState` are collapsed.
   - Why it invalidates success: Breaks the core architecture principle.

3. The app replaces the hand drawing with a generic clean UI without human approval.
   - Why it invalidates success: Contradicts the product goal.

4. `index.html` or `assets/drawing-underlay.jpeg` is deleted/overwritten without explicit approval.
   - Why it invalidates success: Violates named preservation constraints.

5. A subagent exceeds the 40% threshold without a valid continuation contract.
   - Why it invalidates success: Violates the human's subdivision-of-labor requirement.

6. Full prototype completion is claimed before all required prototype areas are tested or explicitly scoped out.
   - Why it invalidates success: Misrepresents progress.

7. Verification fails and orchestration stops instead of routing back through planning/execution.
   - Why it invalidates success: Contradicts the requested continuation loop.

## Human Gates
- Approve any deletion/replacement of `index.html` or `assets/drawing-underlay.jpeg`.
- Approve any reversal away from Electron + web/SVG UI + later local Python processing.
- Approve large dependencies that significantly change app architecture or install burden.
- Approve final declaration that a prototype area is out of scope.
- Approve final full-prototype completion claim.

## Ambiguities
- Exact desktop packaging target is not specified; treat as prototype launch smoke until clarified.
- Exact UI framework is open; Planner may choose minimal web/SVG or a framework if justified.
- Exact Python libraries and detection algorithms are open; introduce incrementally with fixture-backed tests.
- Exact automatic-detection accuracy threshold is not specified; do not claim robust detection until criteria are defined and tested.

## Material Questions
None blocking. The user has already provided the clarifications needed for planning. Remaining unknowns should be handled as staged Planner decisions, Executor spikes with evidence, or explicit human gates.

## Human Review Gate

### My Current Understanding
The run should proceed from ecological intake to planning, then through repeated execution and verification slices until the full prototype scope is complete. Each role must respect the 40% context handoff threshold and preserve evidence discipline.

### Decisions Settled
- Full prototype areas are in scope.
- Staged order from `handle.md` is approved.
- Likely stack direction is Electron + web/SVG UI with later Python local processing.
- Tests/evidence are mandatory for PASS.
- `handle.md` must be updated after each successful verified slice.

### Decisions Still Open
- Exact UI framework, if any.
- Exact desktop packaging details.
- Exact Python processing libraries.
- Exact detection accuracy criteria.

### Assumptions Carried
- The next slice starts with manual correction editor foundation unless the Planner finds a stronger reason to alter order.
- Existing repo state should be re-verified before implementation.

### Ready for Planning?
Yes.

## Planning Readiness
Ready for Planner.

Readiness checklist:
- [x] Raw prompt preserved
- [x] Intent clarified
- [x] Purpose clarified
- [x] Context mapped
- [x] Known, inferred, assumed, and unknown separated
- [x] Invariants named
- [x] Constraints named
- [x] Affordances mapped
- [x] Attractors and risks identified
- [x] Scope bounded
- [x] Representative environment described
- [x] Perturbation tests included
- [x] Success criteria are observable
- [x] Falsifiers are explicit
- [x] Human gates are named
- [x] Planning readiness stated
- [x] Next agent identified

## Routing Decision
Route to PLAN. Research is optional inside planning/execution if a specific dependency, Electron setup, or Python bridge decision needs quick discovery, but no separate pre-planning research artifact is required by current intake.

## Recommended Next Agent
Planner (`pev-planner`).

## Handoff Notes
Planner should:
1. Read this intake, `handle.md`, `package.json`, and current tests.
2. Treat `handle.md` as the current project-level source of truth.
3. Start by requiring baseline verification (`npm run check`) before implementation claims.
4. Produce a staged plan for the full prototype, but make the next executable slice small and verifiable.
5. Prefer the `handle.md` order: manual correction editor, desktop shell, multi-drawing workflow, Python processor stub, real image processing/detection.
6. Include explicit tests/evidence for every planned claim.
7. Carry the 40% context handoff threshold into all downstream role prompts.
8. Require canonical continuation contracts under the run directory if any role reaches threshold.
9. Require `handle.md` updates after each successful verified slice.
10. If verification fails, route back through planning/execution instead of treating the run as permanently stopped.
