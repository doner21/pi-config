---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260518-164720
context_saturation_estimate: "~18%"
context_handoff_threshold_percent: 40
threshold_source: user_prompt
---

# ATT_1_PLAN — Full Prototype Continuation

## Task Statement
Continue `C:/Users/doner/drawing_frontend_end` from the verified drawing interaction foundation toward the full product prototype: manual correction editor, desktop shell, import/multi-drawing workflow, Python image processing, and automatic detection. Work must proceed in staged, evidence-backed slices and must not claim full completion prematurely.

## Planner Evidence
- Read `ATT_0_INTAKE.md`, `RUN_CONFIG.json`, and `handle.md` first.
- `graphify-out/GRAPH_REPORT.md` is absent (`ENOENT`), matching intake.
- Inspected `package.json`, core modules, fixture, app files, tests, and smoke script.
- Ran `npm run check`: build passed; tests reported `26` pass, `0` fail; smoke confirmed preserved `index.html`, `assets/drawing-underlay.jpeg`, app shell, fixture, and runtime handlers.

## Invariants
- No PASS without evidence: automated test, runtime/browser/desktop smoke, fixture test, schema validation, command output, or explicit file evidence.
- Planner/executor hypotheses must be verified with tests/evidence or marked `UNVERIFIED`.
- Preserve separated `visualLayer`, `semanticLayer`, and `runtimeState`; do not flatten them.
- Preserve root `index.html` and `assets/drawing-underlay.jpeg` unless the human explicitly approves otherwise.
- Preserve the real hand-drawing visual substrate; do not replace it with generic clean UI.
- Preserve existing verified behavior: model/geometry/persistence tests, box toggle, slider drag/value, connector highlight, inspector update, and smoke checks.
- Follow `handle.md` order: manual correction editor, desktop shell, multi-drawing/import workflow, Python processor stub, real image processing/detection.
- `handle.md` must be updated after every successful verified slice.
- All subagents use 40% context handoff threshold and must write canonical continuation contracts under this run dir before stopping if threshold is reached.
- If verification fails, route back through planning/execution; do not stop the overall continuation loop.

## Success Criteria
1. Baseline is rerun before and after each slice; final `npm run check` passes or failures are reported as FAIL.
2. First execution slice produces a tested manual correction editor core: add/edit/delete/move/resize/snap/save semantics.
3. Existing app/runtime behavior and preserved files remain intact.
4. Browser manual editor is only claimed with runtime/browser evidence.
5. Desktop shell is only claimed with launch smoke evidence.
6. Import/multi-drawing is only claimed with manifest/file evidence and tests.
7. Python processor bridge is only claimed with Python tests plus Node/Python bridge/fixture evidence.
8. Automatic detection is only claimed with real fixture candidate output and limitations/accuracy notes.
9. `handle.md` records each verified slice, evidence, changed files, and remaining `UNVERIFIED` areas.

## Implementation Steps

### Slice 0 — Executor Baseline Gate
Before editing, Executor must run from `C:/Users/doner/drawing_frontend_end`:
- `npm run build`
- `npm test`
- `npm run smoke`
- `npm run check`

Acceptance criteria:
- Baseline commands pass, or Executor stops feature work and reports/fixes failures.
- Evidence includes current test count and smoke output.
- Preserved files are checked by smoke and, if available, `git diff -- index.html assets/drawing-underlay.jpeg`.

Expected files changed: none.

### Slice 1 — FIRST EXECUTION SLICE: Manual Correction Editor Core
Bounded now-implementable target: add dependency-free pure editor helpers and tests. Do not start UI, Electron, import workflow, or Python in this slice.

Expected files:
- New `src/core/editor.mjs`
- New `tests/editor.test.mjs`
- Possibly update `tests/persistence.test.mjs` for edited-document round-trip
- Update `handle.md` only after verified success

Required helper exports in `src/core/editor.mjs` unless Executor finds a tested reason to rename and documents it:
- `addBoxControl(document, control, drawingId = undefined)` — add box to `semanticLayer.controls` and matching runtime `{ active }` state.
- `addSliderControl(document, control, drawingId = undefined)` — add slider and matching runtime `{ value }` state.
- `updateControlLabel(document, controlId, label, drawingId = undefined)` — reject empty/invalid labels through validation.
- `setControlGeometry(document, controlId, geometry, drawingId = undefined)` — support box rects and slider tracks.
- `moveControl(document, controlId, delta, drawingId = undefined)` — move box rect or slider endpoints by finite `{ dx, dy }`.
- `deleteControl(document, controlId, drawingId = undefined)` — remove control, its runtime state, and attached connectors.
- `addConnector(document, connector, drawingId = undefined)` — validate endpoints/anchors.
- `deleteConnector(document, connectorId, drawingId = undefined)`.
- `setConnectorEndpoint(document, connectorId, endpointName, endpoint, drawingId = undefined)` — `endpointName` is `from` or `to`.
- `snapConnectorEndpoint(document, connectorId, endpointName, point, threshold = Infinity, drawingId = undefined)` — use existing `nearestAnchor`; test the no-anchor-within-threshold contract.

Implementation constraints:
- Use immutable returns; original fixture must not mutate.
- Call `assertValidDocument` before and after edits where feasible.
- Throw clear errors for unknown controls/connectors or invalid endpoint names.
- Do not add dependencies.
- If UI is not added, browser manual editor remains `UNVERIFIED`.

Required tests in `tests/editor.test.mjs`:
1. Add box adds semantic control plus runtime state, validates, and does not mutate original.
2. Add slider adds semantic control plus runtime state and validates.
3. Duplicate/invalid control IDs fail with evidence.
4. Label and geometry updates work for boxes/sliders and preserve `visualLayer`.
5. `moveControl` moves box and slider geometry by expected deltas.
6. Add connector validates endpoints and anchors.
7. Snap connector endpoint chooses nearest anchor and tests threshold/no-snap behavior.
8. Delete control removes runtime state and attached connectors with no dangling endpoints.
9. Delete connector preserves controls and removes only that connector.
10. Edited document serialize/parse or save/load round-trip preserves edits.

Verification commands for Slice 1:
- `node --test tests/editor.test.mjs`
- `node --test tests/persistence.test.mjs`
- `npm run check`

Acceptance criteria:
- Existing 26 tests plus new editor tests pass.
- Edited documents remain valid via `assertValidDocument`.
- Persistence evidence proves edited controls/connectors survive round trip.
- `index.html` and `assets/drawing-underlay.jpeg` remain preserved.
- `handle.md` is updated with run id `RUN_20260518-164720`, changed files, commands/evidence, and next slice.

### Slice 2 — Manual Correction Editor UI
Start after Slice 1 PASS. Add minimal web/SVG UI for selection and at least one create/edit/delete correction path on the drawing.

Expected files: `app/index.html`, `app/main.mjs`, `tests/app-runtime.test.mjs`, `scripts/smoke-ui.mjs` or new browser smoke, and `handle.md`.

Acceptance and verification:
- Runtime/browser evidence performs a representative editor operation and verifies changed DOM/inspector/document state.
- Existing interaction mode still works or mode separation is tested.
- Visual layer remains the drawing underlay.
- Final `npm run check` passes.

### Slice 3 — Desktop Shell
Start after manual editor has a verified usable path. Implement prototype desktop wrapper, likely Electron + web/SVG UI. Any reversal to another stack requires human gate.

Expected files: `package.json`, desktop/electron entry/preload files, desktop smoke script, and `handle.md`.

Acceptance and verification:
- Install/build evidence for new dependencies.
- Launch smoke proves app opens and loads fixture/project.
- Basic workflow has no startup console/runtime errors.
- Existing web tests/checks remain passing.

### Slice 4 — Import + Multi-Drawing Project Workflow
Start after desktop shell, unless human requests web-only import first. Import one or more drawing images and maintain a multi-drawing project manifest with per-drawing semantic/runtime state.

Expected files: `src/core/project.mjs` and/or `src/core/import.mjs`, persistence/model updates if needed, `tests/project.test.mjs` / `tests/import.test.mjs`, UI drawing list/browser files, and `handle.md`.

Acceptance and verification:
- Temp-dir tests prove import copy/reference behavior and path resolution.
- Saved/loaded project contains at least two drawings.
- Switching active drawing preserves per-drawing edits/states.
- Runtime/desktop smoke covers drawing selection if UI is added.
- No import path overwrites preserved assets.

### Slice 5 — Python Processor Stub + Bridge
Start after import/multi-drawing exists. Add minimal local Python processor and Node/Python bridge before real CV claims.

Expected files: `processor/` or `python/` module, Python tests, Node bridge helper/tests, and `handle.md`.

Acceptance and verification:
- Python test accepts fixture image path and returns dimensions/metadata or placeholder normalized output.
- Node/Python bridge smoke processes `assets/drawing-underlay.jpeg` without error.
- Candidate-free result schema is explicit, e.g. boxes/sliders/connectors arrays are empty.
- Missing Python/process failure path is tested.
- Real CV/detection remains `UNVERIFIED` unless implemented later.

### Slice 6 — Real Image Processing and Automatic Detection
Start after bridge PASS. Sequence: image normalization, threshold/ink mask, trace/vector or skeleton extraction, candidate box/slider/connector detection, then candidate review/import into manual editor.

Acceptance and verification:
- Every processing claim runs on a real fixture and produces inspectable artifact/output paths.
- Detection tests assert candidate geometry/counts on known fixture(s).
- Limitations and unmeasured accuracy are marked `UNVERIFIED`.
- Automatic detection assists manual correction; it does not replace it.

### Slice 7 — Integrated Prototype Pass
Start only after prior slices PASS or human explicitly scopes an area out.

End-to-end acceptance:
- Launch desktop app.
- Import at least one fixture drawing.
- Add/correct at least one control/connector.
- Save and reload project.
- Run Python processing/detection path.
- Test interaction mode on corrected drawing.
- Full Node checks and Python tests pass.
- `handle.md` contains a prototype completion matrix for manual editor, desktop shell, import, multi-drawing, Python processing, automatic detection, and remaining `UNVERIFIED` limits.

## Labor Subdivision / Handoff Contract
- First Executor should perform only Slice 0 + Slice 1.
- Verifier must independently inspect files and run commands; do not trust Executor narrative alone.
- Any role at 40% context must finish the current atomic unit, write a continuation contract under `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260518-164720/` (for example `ATT_2_CONTINUATION_EXECUTOR_1.md` if no exact path is supplied), include completed work/evidence/failures/remaining work/resume instruction, then stop.
- Each successful slice must update `handle.md`; failed or partial slices must not be recorded as PASS.

## Handoff Notes
- Current project baseline is healthy as of planner run: `npm run check` passed with 26 tests.
- First implementation should be core editor helpers only; no dependencies are needed.
- Existing useful functions: `getDrawing`, `getControl`, `assertValidDocument`, `nearestAnchor`, persistence helpers.
- Existing model already supports multiple drawings structurally, but import/project workflow is `UNVERIFIED`.
- Desktop, Python, image processing, automatic detection, and full conversion are all still `UNVERIFIED` until their slices are implemented and tested.
