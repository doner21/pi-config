---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260424-231213
context_saturation_estimate: "~22%"
---

## Investigation Scope
Investigated the current Three.js/Vite hero implementation to determine the best approach for a point-cloud hero that:
- still reads as the source image at rest,
- can be aggressively disrupted on hover,
- reintegrates quickly on hover end,
- preserves existing ripple mode and slide switching,
- and can be verified in-browser through a stable serving path.

Primary evidence came from:
- `src/main.js`
- `package.json`
- `index.html`
- `src/style.css`
- `vite.log`
- `TESTING.md`
- external docs: Vite CLI docs and OpenCV.js usage docs

## Key Findings

### 1. Current repo state is a very small Vite + Three.js app with no OpenCV dependency
Evidence:
- `package.json` only includes `three` and `vite`.
- Scripts are only `dev`, `build`, and `preview`.
- There is no OpenCV/OpenCV.js package, no preprocessing pipeline, and no shader tooling.

Implication:
- Any OpenCV use would be a new dependency and should be justified carefully.
- The current app is simple enough that image sampling and particle generation can already be done with the existing canvas 2D path in `createPointCloudHero()`.

### 2. The current point-cloud effect is built from canvas pixel sampling and CPU-updated point positions
Evidence in `src/main.js`:
- `createPointCloudHero(texture)` draws the image into an offscreen canvas and reads `getImageData`.
- Particle positions/colors are generated from sampled pixels.
- Runtime motion is fully CPU-side in the `update(dt, elapsed)` loop by mutating `geometry.attributes.position.array`.

Implication:
- The current architecture already separates preprocessing-like work (sampling image pixels once) from runtime animation (hover forces + spring return).
- This means OpenCV is not required for the main runtime destruction/reassembly loop.

### 3. Current recognizability is limited by sparse sampling and basic point rendering
Evidence in `src/main.js`:
- Sampling density is capped at `240 x 160` max.
- For current images this produces roughly:
  - `public/hero-image.png` (1536x1024) -> `219 x 146` ~= 31,974 candidate samples
  - `public/hero-image-2.png` (9216x6144) -> capped at `240 x 160` = 38,400 candidate samples
- Rendering uses `THREE.PointsMaterial` with a single global `size`.
- The `sizes` array is computed per particle but is only used for dynamics; it is not bound as a render attribute, so it does not increase visual fidelity.

Implication:
- At rest, image legibility is constrained by point density and by the fact that the points are not rendered with a custom sprite/shader-based shape/opacity system.
- A pure points-only solution can work, but current rendering choices bias toward a sparser, more abstract read.

### 4. Current destruction is intentionally constrained, which is why it feels subtle
Evidence in `src/main.js`:
- Hover force radius is small: `radius = 0.0115`.
- Return springs are strong: `vx += (baseX - x) * dt * 18`, `vy += ... * 18`, `vz += ... * 13`.
- Displacement is clamped tightly:
  - `z` clamped to `[-0.12, 0.12]`
  - XY offset clamped via `maxOffset = 0.024 + sizes[particleIndex] * 0.008`

Implication:
- The present system is tuned to preserve structure and prevent dramatic breakup.
- To achieve “destroy on hover,” the implementation will need either:
  - a wider/faster force field and larger temporary offset budget, or
  - a layered architecture where the stable image read is preserved by something other than the particles alone.

### 5. A hybrid underlay + particle overlay is the safest path for strong destruction without losing recognizability
Why:
- A textured plane underlay preserves the image read at rest and during the first moments of interaction.
- A particle overlay can still explode dramatically and carry the visual drama.
- The underlay can be faded/masked locally or globally during hover, then snapped back quickly on hover end.

Why this fits the repo:
- The app already uses an orthographic camera and full-bleed plane presentation.
- It already scales hero effects to the displayed image bounds via `updateDisplayedPlaneSize()`.
- A hidden/visible/faded plane is a low-risk addition in this scene setup.

Implication:
- If the goal is “clearly the original picture at rest” plus “dramatic destruction on hover,” hybrid is a better fit than points-only.
- Points-only remains possible, but it will need much denser sampling or shader tricks to avoid becoming too abstract once disruption is increased.

### 6. OpenCV/OpenCV.js is not the right tool for runtime particle destruction/reassembly here
External evidence:
- OpenCV.js usage requires asynchronous script loading / initialization and explicit memory management of `cv.Mat` objects (`mat.delete()`), per OpenCV.js docs.

Repo-fit assessment:
- The runtime effect here is not a computer-vision problem. It is a particle animation / interaction problem.
- Runtime destruction/reassembly is already governed by force, damping, spring return, and rendering strategy.
- OpenCV would not replace the Three.js animation loop in a useful way.

Best realistic roles for OpenCV in this repo:
- preprocessing or one-time sampling assistance:
  - edge detection to preserve important contours,
  - threshold/mask extraction for subject-vs-background weighting,
  - saliency-like weighting if a custom preprocessing script is introduced,
  - contour extraction to seed higher-density particles around recognizable features.

Not a good role:
- per-frame runtime destruction physics,
- hover-driven reassembly logic,
- general Three.js particle motion.

### 7. Canvas 2D already covers the likely preprocessing needs unless advanced masks are truly needed
Evidence:
- Current code already reads pixel data from a 2D canvas and can derive luminance/alpha.

Implication:
- If the team only needs better sampling, alpha cutoffs, edge emphasis, focal weighting, or multi-resolution particle selection, that can likely be done without OpenCV.
- OpenCV becomes more justifiable only if the Planner wants nontrivial vision operations such as contour extraction, morphology, segmentation-like masks, or offline asset prep.

### 8. `vite preview` is the better MCP/browser verification target than `vite dev` in this environment
Evidence:
- `package.json` includes both `build` and `preview`.
- Vite CLI docs: `vite preview` locally previews the production build from `dist`.
- `vite.log` shows the dev server had port churn (`5173` through `5177`), which is exactly the kind of instability that can complicate browser automation.

Implication:
- For MCP/browser verification, the stable path should be:
  1. `npm run build`
  2. `npm run preview -- --host 127.0.0.1 --strictPort --port <chosen-port>`
  3. point browser tooling at that exact preview URL
- `vite dev` is still useful during implementation, but `preview` is better for reproducible verification because it avoids HMR behavior and validates the production bundle actually being served.

## Constraints Identified
- `src/main.js` currently keeps both hero modes in a single file; changes should respect existing slide/mode switching flow unless a refactor is explicitly chosen later.
- Ripple mode and point-cloud mode share interaction state (`hoverUv`, `hoverTargetUv`, `isHovering`, etc.), so point-cloud redesign should not break ripple interactions.
- Slide transitions rely on `rebuildActiveEffect(nextTexture)` and opacity animation; any new underlay/overlay architecture must still cooperate with this lifecycle.
- The hero must remain flat and full-bleed; current orthographic camera + plane scaling system is already aligned with that invariant.
- `graphify-out/GRAPH_REPORT.md` is absent; this matches INTAKE and removes graphify-based repo navigation.

## Existing Patterns
- Full-bleed hero sizing is controlled by `updateDisplayedPlaneSize()` in `src/main.js`.
- Current image sampling pattern is:
  1. load texture
  2. draw to offscreen canvas
  3. read pixel buffer
  4. create geometry attributes once
  5. update only p
