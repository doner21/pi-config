---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260518-160036
context_saturation_estimate: "~8%"
---

## Task Statement
Build the first coding slice for `C:\Users\doner\drawing_frontend_end`: a dependency-light foundation for a future desktop drawing-to-interactive-control app. Preserve the existing static artifact/reference image, add tested semantic model/geometry/state/persistence primitives, and add a minimal app-shaped preview surface without claiming full CV or production desktop packaging.

## Invariants
- Executor must build/run tests before marking any feature, behavior, architecture insight, or implementation claim as PASS.
- Any untested claim must be marked **UNVERIFIED**, not PASS.
- Preserve `index.html` and `assets/drawing-underlay.jpeg`; do not delete or overwrite the JPEG.
- Do not claim full drawing-to-interactive conversion, arbitrary image processing, ML/CV, or production desktop packaging.
- Keep visual layer data separate from semantic layer data.
- Keep semantic controls manipulable as code/JSON.
- Prefer no required external dependencies. If dependencies are added, install and test them before dependency-backed claims are PASS.
- Tests must run locally from `C:\Users\doner\drawing_frontend_end`.

## Success Criteria
1. Scaffold exists and reference artifacts remain available. Evidence: file listing and checks for `index.html` plus `assets/drawing-underlay.jpeg`; otherwise preservation is **UNVERIFIED**.
2. Test/build harness exists and is run. Evidence: `npm run build`, `npm test`, and preferably `npm run check`; otherwise harness reliability is **UNVERIFIED**.
3. Semantic model covers drawings, visual layers, controls, connectors, and runtime state separately. Evidence: schema/model helpers plus fixture validation tests.
4. Geometry primitives for boxes/sliders/connectors are implemented only as tested. Evidence: edge-case tests for clamp/projection/snap/tie behavior.
5. Persistence/state helpers round-trip JSON and update state predictably. Evidence: temp-file read/write tests and state tests.
6. Minimal app/preview surface exists for desktop direction. Evidence: static smoke test; browser/runtime behavior remains **UNVERIFIED** unless separately smoke-tested.
7. Execution report separates PASS, FAIL, and **UNVERIFIED** using direct command/file evidence.

## Implementation Steps

1. Baseline and preservation check before edits.
   - Work in `C:\Users\doner\drawing_frontend_end`.
   - Record: `pwd`, `find . -maxdepth 3 -type f | sort`, `node --version && npm --version`, and a file/dimension check for `assets/drawing-underlay.jpeg`.
   - Do not modify `assets/drawing-underlay.jpeg`.
   - Required evidence/tests: before/after file evidence that root `index.html` and the JPEG still exist.
   - Mark **UNVERIFIED** if no before/after preservation evidence is captured.

2. Add a dependency-light project/test harness.
   - Create/update `package.json` with ESM scripts: `build` = `node scripts/build-check.mjs`, `test` = `node --test`, `smoke` = `node scripts/smoke-ui.mjs`, `check` = `npm run build && npm test && npm run smoke`.
   - Create `scripts/build-check.mjs` to import all core modules and validate the sample fixture as the first-slice build substitute.
   - Avoid mandatory npm dependencies. If adding Vitest/Vite/Electron/Tauri/etc., install and run their checks or mark related claims **UNVERIFIED**.
   - Required evidence/tests: `npm run build` and `npm test` output.
   - Mark **UNVERIFIED** if these commands are not run.

3. Implement semantic model and representative fixture.
   - Add `src/core/model.mjs` with validation helpers for `DrawingDocument { version, drawings }`; drawing `{ id, name, visualLayer, semanticLayer }`; `visualLayer { imagePath, width, height, opacity }`; semantic `controls` and `connectors`.
   - Control types should include `box` and `slider` with stable ids, geometry, and state fields. Connectors should include endpoint references/anchors and optional path points.
   - Add `fixtures/sample-drawing.json` referencing `assets/drawing-underlay.jpeg` with dimensions `2048x1656` and coarse boxes/sliders/connectors from the current drawing vocabulary.
   - Add `tests/model.test.mjs` for valid fixture acceptance and invalid cases: missing visual layer, duplicate ids, connector to unknown control, invalid slider range/value.
   - Required evidence/tests: model test output or full `npm test` output.
   - Mark **UNVERIFIED** for any schema rule not tested.

4. Implement geometry primitives with edge-case tests.
   - Add `src/core/geometry.mjs` with pure functions: `clamp`, `rectAnchors`, `projectPointToSegment`, `sliderValueFromPoint`, and `nearestAnchor`.
   - `nearestAnchor` must be deterministic, e.g. sort by distance, then control id, then anchor name.
   - Add `tests/geometry.test.mjs` for slider projection inside track, before/after track clamping, nearest snap within threshold, no snap outside threshold, and deterministic tie behavior.
   - Required evidence/tests: geometry test output.
   - Mark **UNVERIFIED** for curved connector routing, visual fidelity, or geometry behaviors not directly tested.

5. Implement state and persistence helpers.
   - Add `src/core/state.mjs` with pure or clearly documented update helpers such as `toggleBoxState(document, controlId)` and `setSliderValue(document, sliderId, value)`.
   - Add `src/core/persistence.mjs` with `serializeDocument`, `parseDocument`, `saveDocumentToFile`, and `loadDocumentFromFile`, reusing model validation.
   - Add `tests/state.test.mjs` for box toggles, slider clamping, and unrelated controls unchanged.
   - Add `tests/persistence.test.mjs` using a temp file to prove JSON round-trip preserves controls, connectors, and visual layer.
   - Required evidence/tests: state and persistence test output.
   - Mark **UNVERIFIED** for browser localStorage, sync, binary file formats, or untested persistence paths.

6. Add a minimal app-shaped preview surface without replacing the legacy artifact.
   - Keep root `index.html` available as the existing one-off artifact unless there is a tested reason to edit it.
   - Add `app/index.html` and `app/main.mjs` that load the fixture/core modules and render a simple plain HTML/SVG preview: underlay path, boxes, sliders, connectors, and small state/inspector panel.
   - Add `scripts/smoke-ui.mjs` to statically verify `app/index.html`, `app/main.mjs`, fixture loading/reference, resolved `assets/drawing-underlay.jpeg`, and root `index.html` existence.
   - If feasible, run an actual local browser smoke test; otherwise explicitly mark browser runtime behavior **UNVERIFIED**.
   - Required evidence/tests: `npm run smoke`; optional browser smoke evidence if performed.
   - Mark **UNVERIFIED** for Electron/Tauri packaging, browser event interaction, visual fidelity, import workflow, and full desktop behavior unless tested.

7. Run final checks and produce evidence-oriented handoff.
   - Run from project root: `npm run build`, `npm test`, `npm run smoke`, `npm run check`, and `find . -maxdepth 3 -type f | sort`.
   - Execution Report must include changed/created file list, command outputs or excerpts, PASS only for tested behaviors, FAIL for known broken checks, and **UNVERIFIED** for all untested claims.
   - Mandatory **UNVERIFIED** unless separately tested: full CV, arbitrary drawing import, production desktop packaging, browser runtime, visual fidelity, and complete human correction UI.

## Handoff Notes
- No research artifact was used.
- No `graphify-out/GRAPH_REPORT.md` or `graphify-out/wiki/index.md` was found in `C:\Users\doner\drawing_frontend_end`; planning used direct inspection.
- Current project contains only `index.html` and `assets/drawing-underlay.jpeg`; local inspection reported the JPEG as `2048x1656`.
- Node `v24.14.0`, npm `11.9.0`, and Python `3.12.10` are available.
- Recommended stack: plain ESM JavaScript plus Node built-in `node:test`, because it is testable without network installs and can later sit behind an Electron/Tauri wrapper.
