---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260518-150759
context_saturation_estimate: "~10%"
---

## Task Statement
Build a local static interactive drawing artifact in `C:\Users\doner\drawing_frontend_end` that recreates the provided hand-drawn diagram as a browser-openable `index.html`. Use the original photo as a faint underlay, draw a sketch-like SVG overlay, make four boxes clickable, and make two sliders draggable with color effects on connected boxes.

## Invariants
- Do not add a framework, backend, package install, database, or server dependency.
- Keep output confined to `C:\Users\doner\drawing_frontend_end` except reading/copying the source image.
- Preserve the drawing aesthetic: imperfect/sketchy strokes, faint notebook-photo underlay, non-corporate styling.
- Include exactly these functional elements: input box, filter box, two output boxes, lower/left slider, upper/right slider.
- Four boxes must be clickable and visibly toggle active/inactive.
- Both sliders must drag horizontally, clamp to their tracks, and visibly move their knobs.
- Lower/left slider changes the filter box color gradually.
- Upper/right slider changes both output boxes' colors gradually.
- Connector paths must visually touch relevant element edges/connection points.
- Verification phase is skipped by user request, so Executor must do explicit self-checks.

## Success Criteria
1. `C:\Users\doner\drawing_frontend_end\index.html` exists and opens directly via `file://`.
2. `C:\Users\doner\drawing_frontend_end\assets\drawing-underlay.jpeg` exists and is copied from `C:\Users\doner\Downloads\WhatsApp Image 2026-05-18 at 14.31.32.jpeg`.
3. The page displays the source photo faintly behind a sketch-style overlay.
4. Overlay contains input, filter, two output boxes, two horizontal sliders, labels, and connector lines matching the photo's pattern.
5. Clicking each box toggles a visible active state without losing slider-driven fill color.
6. Dragging lower/left slider gradually updates the filter box fill.
7. Dragging upper/right slider gradually updates both output box fills.
8. Dragging outside slider bounds clamps the knob and causes no console errors.
9. Connector endpoints touch component boundaries: input-to-filter, input-to-lower-slider, lower-slider-to-outputs, filter-to-upper-slider.
10. No unrelated app behavior or generated build artifacts are introduced.

## Implementation Steps
1. Inspect current project files from `C:\Users\doner\drawing_frontend_end` with `find . -maxdepth 3 -type f -o -type d | sort`. If unexpected user files exist, do not delete them; add only the planned files.
2. Create `C:\Users\doner\drawing_frontend_end\assets\` and copy `C:\Users\doner\Downloads\WhatsApp Image 2026-05-18 at 14.31.32.jpeg` to `assets\drawing-underlay.jpeg`.
3. Create `C:\Users\doner\drawing_frontend_end\index.html` as a single HTML file with embedded CSS/JS. Use a responsive wrapper, max width around `1100px`, and an SVG `viewBox="0 0 2048 1656"` because the source image is `2048x1656`.
4. Add the faint underlay either as an SVG `<image href="assets/drawing-underlay.jpeg" width="2048" height="1656" opacity="0.18-0.28">` or an absolutely positioned `<img>` below the SVG. Add subtle paper/notebook texture if desired, but keep the photo visible.
5. Draw sketch-style SVG groups with stable IDs/classes:
   - `box-input` near `x=210 y=355 w=315 h=170`.
   - `box-filter` near `x=880 y=135 w=450 h=160`.
   - `box-output-a` near `x=260 y=1130 w=320 h=215`.
   - `box-output-b` near `x=760 y=1110 w=320 h=240`.
   - `slider-filter` lower/left track roughly `x=60..820 y=795`, knob initially near `x=170`.
   - `slider-output` upper/right track roughly `x=1160..2040 y=410`, knob initially near `x=1280`.
   Use imperfect `path`/`polyline` outlines, not polished rectangles. Labels should read `input`, `filter`, `slider`, and `output`.
6. Draw connector paths that end on actual coordinates of shapes/tracks: input right/top edge to filter left edge; input bottom edge to lower slider; lower slider branch to both output top edges; filter right edge down/right to upper slider. Avoid floating endpoints.
7. Add interaction CSS: box groups use `cursor:pointer`, focus-visible styling, and `.is-active` highlight/bolder outline; slider groups use grab/grabbing cursors. Add transparent hit areas over thin paths and knobs for easier pointer interaction.
8. Add JavaScript state:
   - Track active state for input/filter/outputA/outputB.
   - On click and keyboard Enter/Space, toggle the relevant box group's active class.
   - Implement slider pointer handlers with `pointerdown`, `pointermove`, `pointerup`/`pointercancel`, `setPointerCapture`, SVG coordinate conversion, and value clamping `0..1`.
   - Update knob position and optional track fill as value changes.
   - Map lower/left slider value to a subtle sketch-compatible fill for the filter box.
   - Map upper/right slider value to a subtle fill applied to both output boxes.
   - Keep active outline/highlight independent from fill color.
9. Add a small unobtrusive instruction such as: “Click boxes to toggle. Drag sliders to tint connected boxes.”
10. Executor self-check before reporting done: verify both planned files exist, open `index.html` locally if possible, confirm underlay visibility, click all four boxes, drag both sliders including outside bounds, inspect that connected box colors change, verify connectors visually touch shapes, and check browser console has no load/interaction errors.

## Handoff Notes
- Project directory appeared empty during planning.
- Source image exists at `C:\Users\doner\Downloads\WhatsApp Image 2026-05-18 at 14.31.32.jpeg` and is `2048x1656`.
- The drawing shows input at left, filter at top center, a right/top slider connected from filter, a lower/left slider connected from input, and two outputs below the lower slider.
- Exact coordinate precision is not required; prioritize visual similarity, sketch style, working interactions, and connector contact.
- Intended file set is only `index.html` plus `assets/drawing-underlay.jpeg`.
- Since verification is skipped, include self-check results in the execution report.
